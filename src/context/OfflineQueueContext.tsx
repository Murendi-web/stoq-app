import React, { createContext, useContext, useMemo } from "react";
import { useOfflineQueue } from "../hooks/useOfflineQueue";
import { logSale } from "../services/saleService";
import { recordStockMovement } from "../services/stockMovementService";

interface OfflineQueueContextValue {
  enqueue: ReturnType<typeof useOfflineQueue>["enqueue"];
  isConnected: boolean;
}

const OfflineQueueContext = createContext<OfflineQueueContextValue | null>(null);

/**
 * Registers the real Firestore-writing handlers once, at the top of the app,
 * so a sale logged on the LogSaleScreen still gets flushed even if the user
 * has already navigated away by the time connectivity returns (NFR3).
 */
export function OfflineQueueProvider({ children }: { children: React.ReactNode }) {
  const queue = useOfflineQueue({
    LOG_SALE: async (payload) => {
      await logSale(payload as any);
    },
    RECORD_RESTOCK: async (payload) => {
      await recordStockMovement(payload as any);
    },
  });

  const value = useMemo(() => ({ enqueue: queue.enqueue, isConnected: queue.isConnected }), [queue.enqueue, queue.isConnected]);

  return <OfflineQueueContext.Provider value={value}>{children}</OfflineQueueContext.Provider>;
}

export function useOfflineQueueContext() {
  const ctx = useContext(OfflineQueueContext);
  if (!ctx) throw new Error("useOfflineQueueContext must be used within OfflineQueueProvider");
  return ctx;
}
