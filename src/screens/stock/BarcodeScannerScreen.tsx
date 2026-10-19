import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { colors } from "../../theme/colors";

export default function BarcodeScannerScreen({ navigation, route }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const returnScreen: string = route.params?.returnScreen ?? "ProductForm";

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Stoq needs camera access to scan barcodes.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const onScanned = (result: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    navigation.navigate({
      name: returnScreen,
      params: { scannedBarcode: result.data },
      merge: true,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "qr"] }}
        onBarcodeScanned={scanned ? undefined : onScanned}
      />
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.scanBox} />
        <Text style={styles.hint}>Point the camera at a barcode</Text>
      </View>
      {scanned && (
        <TouchableOpacity style={styles.rescanButton} onPress={() => setScanned(false)}>
          <Text style={styles.buttonText}>Scan Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: colors.background },
  message: { textAlign: "center", color: colors.text, marginBottom: 16 },
  button: { backgroundColor: colors.primary, borderRadius: 8, padding: 14, paddingHorizontal: 24 },
  buttonText: { color: "#fff", fontWeight: "700" },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  scanBox: { width: 260, height: 160, borderWidth: 3, borderColor: "#fff", borderRadius: 12 },
  hint: { color: "#fff", marginTop: 16, fontSize: 13, backgroundColor: "rgba(0,0,0,0.5)", padding: 8, borderRadius: 6 },
  rescanButton: { position: "absolute", bottom: 40, alignSelf: "center", backgroundColor: colors.primary, borderRadius: 8, padding: 14, paddingHorizontal: 24 },
});