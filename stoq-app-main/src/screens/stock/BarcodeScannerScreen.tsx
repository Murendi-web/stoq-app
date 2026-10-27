import React, { useRef, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Linking, Alert, StatusBar,
} from "react-native";
import {
  CameraView, useCameraPermissions, BarcodeScanningResult,
} from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme, commonStyles as c } from "../../theme/styles";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const Icon = ({ name, size = 23, color = theme.black }: {
  name: IconName; size?: number; color?: string;
}) => <Ionicons name={name} size={size} color={color} />;

const corners = [
  { top: 0, left: 0, borderTopWidth: 6, borderLeftWidth: 6 },
  { top: 0, right: 0, borderTopWidth: 6, borderRightWidth: 6 },
  { bottom: 0, left: 0, borderBottomWidth: 6, borderLeftWidth: 6 },
  { bottom: 0, right: 0, borderBottomWidth: 6, borderRightWidth: 6 },
] as const;

export default function BarcodeScannerScreen({ navigation, route }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [lastBarcode, setLastBarcode] = useState("");
  const scanLock = useRef(false);
  const insets = useSafeAreaInsets();

  const returnScreen = route.params?.returnScreen ?? "ProductForm";

  const onScanned = (result: BarcodeScanningResult) => {
    if (scanLock.current) return;

    scanLock.current = true;
    setScanned(true);
    setLastBarcode(result.data);

    navigation.navigate({
      name: returnScreen,
      params: { scannedBarcode: result.data },
      merge: true,
    });
  };

  const handlePermission = async () => {
    try {
      if (permission?.canAskAgain === false) {
        await Linking.openSettings();
        return;
      }

      const result = await requestPermission();

      if (!result.granted && !result.canAskAgain) {
        Alert.alert(
          "Camera Permission Required",
          "Please enable camera access for STOQ in your phone settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => {
              Linking.openSettings();
            }},
          ]
        );
      }
    } catch {
      Alert.alert(
        "Camera Error",
        "Unable to request camera permission. Please try again."
      );
    }
  };

  if (!permission) {
    return (
      <View style={s.permissionScreen}>
        <ActivityIndicator size="large" color={theme.black} />
        <Text style={s.title}>Getting Camera Ready</Text>
        <Text style={s.description}>
          Preparing your STOQ barcode scanner...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={s.permissionScreen}>
        <View style={s.brand}>
          <View style={[c.iconBox, { backgroundColor: theme.purple }]}>
            <Icon name="cube-outline" size={27} />
          </View>
          <Text style={s.brandText}>
            STOQ<Text style={{ color: theme.pink }}>.</Text>
          </Text>
        </View>

        <View style={[c.card, c.shadow, s.permissionCard]}>
          <View style={[c.iconBox, s.cameraIcon]}>
            <Icon name="camera-outline" size={43} />
          </View>

          <Text style={s.badge}>CAMERA ACCESS</Text>
          <Text style={s.title}>Let's Scan Some Stock!</Text>
          <Text style={s.description}>
            STOQ needs permission to use your camera
            so you can scan product barcodes quickly.
          </Text>

          <View style={s.permissionInfo}>
            <Icon name="shield-checkmark-outline" />
            <Text style={{ flex: 1, fontSize: 12, color: theme.black }}>
              Camera access is used to scan barcodes inside the app.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={c.button}
          onPress={handlePermission}
          activeOpacity={0.8}
        >
          <Icon name="camera-outline" />
          <Text style={c.buttonText}>
            {permission.canAskAgain
              ? "Grant Camera Access"
              : "Open Camera Settings"}
          </Text>
          <Icon name="arrow-forward" size={21} />
        </TouchableOpacity>

        <TouchableOpacity
          style={s.backLink}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={19} />
          <Text style={s.bold}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={theme.black} />

      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: [
            "ean13", "ean8", "upc_a", "upc_e", "code128", "qr",
          ],
        }}
        onBarcodeScanned={scanned ? undefined : onScanned}
      />

      <View style={[s.top, {
        paddingTop: Math.max(insets.top, 15) + 10,
      }]}>
        <TouchableOpacity
          style={[c.iconBox, s.backButton]}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
        >
          <Icon name="arrow-back" />
        </TouchableOpacity>

        <View style={s.topTitle}>
          <Icon name="scan-outline" size={20} />
          <Text style={s.bold}>Scan Barcode</Text>
        </View>

        <View style={{ width: 46 }} />
      </View>

      <View style={s.overlay} pointerEvents="none">
        <View style={s.scanLabel}>
          <View style={s.liveDot} />
          <Text style={s.badgeText}>
            {scanned ? "SCANNED" : "READY TO SCAN"}
          </Text>
        </View>

        <View style={s.frame}>
          {corners.map((corner, index) => (
            <View key={index} style={[s.corner, corner]} />
          ))}
          <Icon
            name="barcode-outline"
            size={95}
            color="rgba(255,255,255,0.38)"
          />
        </View>

        <Text style={s.hint}>
          Position the barcode inside the frame
        </Text>
      </View>

      <View style={[s.bottom, {
        paddingBottom: Math.max(insets.bottom, 15) + 12,
      }]}>
        <View style={s.instructions}>
          <View style={[c.iconBox, s.instructionsIcon]}>
            <Icon name="scan-outline" size={26} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.bold}>
              {scanned ? "Barcode Captured!" : "Ready to Scan"}
            </Text>
            <Text style={c.subtitle}>
              {scanned
                ? lastBarcode
                : "Hold your phone steady and point the camera at a product barcode."}
            </Text>
          </View>
        </View>

        {scanned && (
          <TouchableOpacity
            style={s.rescan}
            onPress={() => {
              scanLock.current = false;
              setScanned(false);
              setLastBarcode("");
            }}
          >
            <Icon name="refresh-outline" />
            <Text style={s.bold}>Scan Again</Text>
          </TouchableOpacity>
        )}

        <View style={s.bottomBadge}>
          <Icon name="flash-outline" size={15} color={theme.white} />
          <Text style={s.bottomText}>
            AUTOMATIC BARCODE DETECTION
          </Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.black },
  permissionScreen: {
    flex: 1, backgroundColor: theme.background,
    padding: 22, justifyContent: "center",
  },
  brand: {
    flexDirection: "row", alignItems: "center",
    gap: 10, marginBottom: 35,
  },
  brandText: {
    fontSize: 28, fontWeight: "900", color: theme.black,
  },
  permissionCard: {
    backgroundColor: theme.yellow, borderRadius: 17,
    padding: 22, alignItems: "center", marginBottom: 27,
  },
  cameraIcon: {
    width: 85, height: 85, backgroundColor: theme.white,
    borderWidth: 2.5, borderRadius: 20, marginBottom: 19,
  },
  badge: {
    backgroundColor: theme.white, borderWidth: 2,
    borderColor: theme.black, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 7,
    fontSize: 10, fontWeight: "900", overflow: "hidden",
    marginBottom: 17,
  },
  title: {
    fontSize: 23, fontWeight: "900",
    color: theme.black, textAlign: "center", marginTop: 12,
  },
  description: {
    fontSize: 13, color: theme.black,
    lineHeight: 20, textAlign: "center", marginTop: 12,
  },
  permissionInfo: {
    flexDirection: "row", alignItems: "center", gap: 11,
    backgroundColor: theme.white, borderWidth: 2,
    borderColor: theme.black, borderRadius: 11,
    padding: 12, marginTop: 23, width: "100%",
  },
  backLink: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8, marginTop: 26,
  },
  bold: { fontSize: 15, fontWeight: "900", color: theme.black },
  top: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingHorizontal: 18,
    paddingBottom: 14, backgroundColor: "rgba(0,0,0,0.52)",
  },
  backButton: {
    width: 46, height: 46, backgroundColor: theme.white,
  },
  topTitle: {
    flexDirection: "row", alignItems: "center", gap: 9,
    backgroundColor: theme.yellow, borderWidth: 2,
    borderColor: theme.black, borderRadius: 11,
    paddingHorizontal: 15, paddingVertical: 11,
  },
  overlay: {
    position: "absolute", top: "29%",
    left: 0, right: 0, alignItems: "center",
  },
  scanLabel: {
    backgroundColor: theme.green, borderWidth: 2,
    borderColor: theme.black, borderRadius: 9,
    paddingHorizontal: 12, paddingVertical: 8,
    flexDirection: "row", alignItems: "center",
    gap: 8, marginBottom: 22,
  },
  liveDot: {
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: theme.black,
  },
  badgeText: {
    fontSize: 11, fontWeight: "900",
    color: theme.black, letterSpacing: 0.7,
  },
  frame: {
    width: "78%", maxWidth: 310, height: 205,
    borderRadius: 15, alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  corner: {
    position: "absolute", width: 45, height: 45,
    borderColor: theme.yellow,
  },
  hint: {
    fontSize: 13, fontWeight: "700",
    color: theme.white, textAlign: "center",
    marginTop: 22, backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 15, paddingVertical: 10,
    borderRadius: 9, overflow: "hidden",
  },
  bottom: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.82)",
    paddingHorizontal: 18, paddingTop: 17,
    alignItems: "center",
  },
  instructions: {
    backgroundColor: theme.white, borderWidth: 2.5,
    borderColor: theme.black, borderRadius: 14,
    padding: 14, flexDirection: "row",
    alignItems: "center", gap: 12, width: "100%",
  },
  instructionsIcon: {
    width: 48, height: 48, backgroundColor: theme.purple,
  },
  rescan: {
    backgroundColor: theme.green, borderWidth: 2,
    borderColor: theme.black, borderRadius: 12,
    padding: 13, flexDirection: "row",
    alignItems: "center", justifyContent: "center",
    gap: 10, width: "100%", marginTop: 12,
  },
  bottomBadge: {
    flexDirection: "row", alignItems: "center",
    gap: 7, marginTop: 17,
  },
  bottomText: {
    fontSize: 10, fontWeight: "800",
    color: theme.white, letterSpacing: 0.6,
  },
});
