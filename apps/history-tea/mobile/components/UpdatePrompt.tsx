import { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Platform,
  StyleSheet,
} from "react-native";
import Constants from "expo-constants";
import { api } from "@/lib/api";

const APP_STORE_URL = "https://apps.apple.com/app/history-tea-history-storycast/id6741391523";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=app.historytea";

function compareVersions(current: string, minimum: string): boolean {
  const c = current.split(".").map(Number);
  const m = minimum.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const cv = c[i] || 0;
    const mv = m[i] || 0;
    if (cv < mv) return true;
    if (cv > mv) return false;
  }
  return false;
}

export function UpdatePrompt() {
  const [visible, setVisible] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);

  useEffect(() => {
    api.getConfig().then((config) => {
      const currentVersion = Constants.expoConfig?.version || "0.0.0";
      const isIOS = Platform.OS === "ios";
      const minVersion = isIOS
        ? (config.min_ios_version || config.min_app_version)
        : (config.min_android_version || config.min_app_version);
      const needsUpdate = compareVersions(currentVersion, minVersion);
      if (needsUpdate) {
        const platformForce = isIOS ? config.force_update_ios : config.force_update_android;
        setForceUpdate(platformForce ?? config.force_update);
        setVisible(true);
      }
    }).catch(() => {});
  }, []);

  if (!visible) return null;

  const storeUrl = Platform.OS === "ios" ? APP_STORE_URL : PLAY_STORE_URL;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {!forceUpdate && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.icon}>🔄</Text>
          <Text style={styles.title}>Update Available</Text>
          <Text style={styles.message}>
            A new version of History Tea is available with important improvements. Please update to continue enjoying the best experience.
          </Text>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => Linking.openURL(storeUrl)}
          >
            <Text style={styles.updateText}>Update Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#1a1a2e",
    borderRadius: 20,
    padding: 32,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  icon: { fontSize: 48, marginBottom: 16 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    color: "#aaa",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  updateButton: {
    backgroundColor: "#d97706",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  updateText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    position: "absolute" as const,
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  closeText: {
    color: "#999",
    fontSize: 16,
    fontWeight: "600" as const,
  },
});
