// Test comment: pushed by Luthando on 2026-10-30 to verify GitHub sync is working
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthContext";
import { OfflineQueueProvider } from "./src/context/OfflineQueueContext";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <OfflineQueueProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </OfflineQueueProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
