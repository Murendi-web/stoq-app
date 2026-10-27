import { useCallback, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueuedAction, QueuedActionType } from "../types";
import { useNetworkStatus } from "./useNetworkStatus";

const QUEUE_KEY = "stoq:offline-queue";

type ActionHandler = (payload: Record<string, unknown>) => Promise<void>;

/**
 * Implements NFR3: sales and stock actions are queued locally when offline
 * and automatically synced once connectivity resumes.
 *
 * Every AsyncStorage call is wrapped in try/catch. 
 */
export function useOfflineQueue(handlers: Partial<Record<QueuedActionType, ActionHandler>>) {
  const isConnected = useNetworkStatus();
  const isFlushing = useRef(false);
  const storageBroken = useRef(false);

  const readQueue = useCallback(async (): Promise<QueuedAction[]> => {
    if (storageBroken.current) return [];
    try {
      const raw = await AsyncStorage.getItem(QUEUE_KEY);
      return raw ? (JSON.parse(raw) as QueuedAction[]) : [];
    } catch (err) {
      storageBroken.current = true;
      console.warn("useOfflineQueue: AsyncStorage read failed, offline queue disabled for this session.", err);
      return [];
    }
  }, []);

  const writeQueue = useCallback(async (queue: QueuedAction[]) => {
    if (storageBroken.current) return;
    try {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (err) {
      storageBroken.current = true;
      console.warn("useOfflineQueue: AsyncStorage write failed, offline queue disabled for this session.", err);
    }
  }, []);

  const flush = useCallback(async () => {
    if (isFlushing.current) return;
    isFlushing.current = true;
    try {
      let queue = await readQueue();
      while (queue.length > 0) {
        const [next, ...rest] = queue;
        const handler = handlers[next.type];
        if (!handler) {
          break;
        }
        try {
          await handler(next.payload);
          queue = rest;
          await writeQueue(queue);
        } catch (err) {
          console.warn("useOfflineQueue: failed to sync action, will retry", err);
          break;
        }
      }
    } finally {
      isFlushing.current = false;
    }
  }, [handlers, readQueue, writeQueue]);

  useEffect(() => {
    if (isConnected) {
      flush();
    }
  }, [isConnected, flush]);

  const enqueue = useCallback(
    async (type: QueuedActionType, payload: Record<string, unknown>) => {
      const action: QueuedAction = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type,
        payload,
        createdAt: Date.now(),
      };

      // Storage is broken on this device/session: still try the write
      // immediately via the handler (if online) instead of silently
      // dropping it, since we can't queue it for later either.
      if (storageBroken.current) {
        if (isConnected) {
          const handler = handlers[type];
          if (handler) await handler(payload);
        }
        return action.id;
      }

      const queue = await readQueue();
      await writeQueue([...queue, action]);

      if (isConnected) {
        flush();
      }
      return action.id;
    },
    [isConnected, readQueue, writeQueue, flush, handlers]
  );

  const pendingCount = useCallback(async () => (await readQueue()).length, [readQueue]);

  return { enqueue, flush, pendingCount, isConnected };
}