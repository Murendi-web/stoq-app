import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

/**
 * Thin wrapper around NetInfo so the rest of the app only cares about a
 * single boolean. Backs NFR3 (offline tolerance) — see useOfflineQueue.ts.
 */
export function useNetworkStatus(): boolean {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(Boolean(state.isConnected && state.isInternetReachable !== false));
    });
    return () => unsubscribe();
  }, []);

  return isConnected;
}
