import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const C = Colors.dark;

interface DeviceStatus {
  id: string;
  name: string;
  battery: number;
  signal: number;
  isOnline: boolean;
  location: string;
  lastSeen: string;
  isLost: boolean;
}

const DEVICES: DeviceStatus[] = [
  {
    id: "1",
    name: "My Phone",
    battery: 84,
    signal: 4,
    isOnline: true,
    location: "Dhaka, Bangladesh",
    lastSeen: "Now",
    isLost: false,
  },
  {
    id: "2",
    name: "Old Device",
    battery: 23,
    signal: 2,
    isOnline: false,
    location: "Chittagong, Bangladesh",
    lastSeen: "2h ago",
    isLost: true,
  },
];

function PulsingDot({ color }: { color: string }) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 900, easing: Easing.in(Easing.quad) })
      ),
      -1,
      false
    );
  }, []);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.4, 1]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.8, 1.2]) }],
  }));

  return <Animated.View style={[styles.dot, { backgroundColor: color }, dotStyle]} />;
}

function BatteryIcon({ level }: { level: number }) {
  const color = level > 50 ? C.green : level > 20 ? C.amber : C.red;
  const icon =
    level > 80
      ? "battery-full"
      : level > 60
      ? "battery-high"
      : level > 40
      ? "battery-half"
      : level > 20
      ? "battery-low"
      : "battery-dead";

  return <Ionicons name={icon as any} size={18} color={color} />;
}

function SignalBars({ level }: { level: number }) {
  return (
    <View style={styles.signalBars}>
      {[1, 2, 3, 4].map((bar) => (
        <View
          key={bar}
          style={[
            styles.signalBar,
            {
              height: 6 + bar * 3,
              backgroundColor: bar <= level ? C.accent : C.textMuted,
            },
          ]}
        />
      ))}
    </View>
  );
}

interface RemoteActionBtnProps {
  icon: string;
  label: string;
  color: string;
  dangerous?: boolean;
  onPress: () => void;
}

function RemoteActionBtn({ icon, label, color, dangerous, onPress }: RemoteActionBtnProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.93, { duration: 70 }),
      withTiming(1, { duration: 120 })
    );
    Haptics.impactAsync(dangerous ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={handlePress}
        style={[styles.actionBtn, { borderColor: color + "50", backgroundColor: color + "11" }]}
      >
        <Ionicons name={icon as any} size={22} color={color} />
        <Text style={[styles.actionLabel, { color }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

interface DeviceCardProps {
  device: DeviceStatus;
  lang: "en" | "bn";
}

function DeviceCard({ device, lang }: DeviceCardProps) {
  const [selected, setSelected] = useState(false);

  const showAlert = (action: string) => {
    Alert.alert(
      lang === "bn" ? "নিশ্চিত করুন" : "Confirm",
      lang === "bn"
        ? `আপনি কি সত্যিই "${action}" চালাতে চান?`
        : `Are you sure you want to "${action}"?`,
      [
        { text: lang === "bn" ? "বাতিল" : "Cancel", style: "cancel" },
        {
          text: lang === "bn" ? "হ্যাঁ" : "Yes",
          style: action.includes("Wipe") ? "destructive" : "default",
          onPress: () => {},
        },
      ]
    );
  };

  return (
    <View style={[styles.deviceCard, device.isLost && { borderColor: C.red + "40" }]}>
      <Pressable onPress={() => setSelected((v) => !v)}>
        <View style={styles.deviceHeader}>
          <View style={styles.deviceIcon}>
            <Ionicons name="phone-portrait" size={28} color={device.isOnline ? C.accent : C.textMuted} />
          </View>
          <View style={styles.deviceInfo}>
            <View style={styles.deviceNameRow}>
              <Text style={styles.deviceName}>{device.name}</Text>
              {device.isLost && (
                <View style={styles.lostBadge}>
                  <Text style={styles.lostText}>{lang === "bn" ? "হারিয়েছে" : "LOST"}</Text>
                </View>
              )}
            </View>
            <Text style={styles.deviceLocation}>
              <Ionicons name="location" size={11} color={C.textMuted} /> {device.location}
            </Text>
            <Text style={styles.deviceLastSeen}>
              {lang === "bn" ? "সর্বশেষ দেখা:" : "Last seen:"} {device.lastSeen}
            </Text>
          </View>
          <View style={styles.deviceRight}>
            {device.isOnline ? (
              <PulsingDot color={C.green} />
            ) : (
              <View style={[styles.dot, { backgroundColor: C.textMuted }]} />
            )}
          </View>
        </View>

        <View style={styles.deviceStats}>
          <View style={styles.statItem}>
            <BatteryIcon level={device.battery} />
            <Text style={styles.statValue}>{device.battery}%</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <SignalBars level={device.signal} />
            <Text style={styles.statValue}>{device.signal}/4</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons
              name={device.isOnline ? "wifi" : "wifi-outline"}
              size={16}
              color={device.isOnline ? C.accent : C.textMuted}
            />
            <Text style={[styles.statValue, { color: device.isOnline ? C.green : C.textMuted }]}>
              {device.isOnline
                ? lang === "bn" ? "অনলাইন" : "Online"
                : lang === "bn" ? "অফলাইন" : "Offline"}
            </Text>
          </View>
        </View>
      </Pressable>

      {selected && (
        <View style={styles.actionsGrid}>
          <RemoteActionBtn
            icon="volume-high"
            label={lang === "bn" ? "সাইরেন" : "Siren"}
            color={C.amber}
            onPress={() => showAlert(lang === "bn" ? "সাইরেন" : "Siren")}
          />
          <RemoteActionBtn
            icon="lock-closed"
            label={lang === "bn" ? "লক" : "Lock"}
            color={C.accent}
            onPress={() => showAlert(lang === "bn" ? "লক" : "Lock")}
          />
          <RemoteActionBtn
            icon="location"
            label={lang === "bn" ? "লোকেশন" : "Locate"}
            color={C.green}
            onPress={() => showAlert(lang === "bn" ? "লোকেশন" : "Locate")}
          />
          <RemoteActionBtn
            icon="mic"
            label={lang === "bn" ? "মাইক" : "Mic"}
            color="#9B59B6"
            onPress={() => showAlert(lang === "bn" ? "মাইক" : "Mic")}
          />
          <RemoteActionBtn
            icon="phone-portrait"
            label={lang === "bn" ? "ভাইব্রেট" : "Vibrate"}
            color={C.accent}
            onPress={() => showAlert(lang === "bn" ? "ভাইব্রেট" : "Vibrate")}
          />
          <RemoteActionBtn
            icon="trash"
            label={lang === "bn" ? "ওয়াইপ" : "Wipe"}
            color={C.red}
            dangerous
            onPress={() => showAlert(lang === "bn" ? "ওয়াইপ" : "Wipe")}
          />
        </View>
      )}
    </View>
  );
}

export default function RemoteScreen() {
  const insets = useSafeAreaInsets();
  const [lang, setLang] = useState<"en" | "bn">("en");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 120 : 100 }}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.screenTitle}>
              {lang === "bn" ? "রিমোট কন্ট্রোল" : "Remote Control"}
            </Text>
            <Text style={styles.screenSub}>
              {lang === "bn" ? "হারানো ডিভাইস ট্র্যাক করুন" : "Track & control lost devices"}
            </Text>
          </View>
          <Pressable onPress={() => setLang((v) => v === "en" ? "bn" : "en")} style={styles.langBtn}>
            <Text style={styles.langBtnText}>{lang === "en" ? "বাং" : "EN"}</Text>
          </Pressable>
        </View>

        <View style={styles.mapCard}>
          <LinearGradient
            colors={["#0A1228", "#070D1E"]}
            style={styles.mapInner}
          >
            <View style={styles.mapGrid}>
              {Array.from({ length: 80 }).map((_, i) => (
                <View key={i} style={styles.mapDot} />
              ))}
            </View>
            <View style={styles.mapOverlay}>
              <View style={styles.locationPin}>
                <Ionicons name="location" size={32} color={C.red} />
                <View style={styles.pingCircle} />
              </View>
            </View>
            <LinearGradient
              colors={["transparent", C.background]}
              style={styles.mapFade}
            />
          </LinearGradient>
          <View style={styles.mapLabel}>
            <Ionicons name="navigate" size={14} color={C.accent} />
            <Text style={styles.mapLabelText}>
              {lang === "bn" ? "ঢাকা, বাংলাদেশ — এইমাত্র আপডেট" : "Dhaka, Bangladesh — Just updated"}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          {lang === "bn" ? "সংযুক্ত ডিভাইস" : "Connected Devices"}
        </Text>

        {DEVICES.map((device) => (
          <DeviceCard key={device.id} device={device} lang={lang} />
        ))}

        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="google" size={20} color={C.accent} />
          <Text style={styles.infoText}>
            {lang === "bn"
              ? "গুগল ওয়ান-ট্যাপ দিয়ে আপনার সব ডিভাইস সিঙ্ক করুন"
              : "Sync all your devices via Google One-Tap login"}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  screenTitle: {
    fontFamily: "Rajdhani_700Bold",
    fontSize: 22,
    color: C.text,
  },
  screenSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 2,
  },
  langBtn: {
    borderWidth: 1,
    borderColor: C.accent + "60",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: C.accent + "11",
  },
  langBtnText: {
    fontFamily: "Rajdhani_700Bold",
    fontSize: 12,
    color: C.accent,
    letterSpacing: 1,
  },
  mapCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    overflow: "hidden",
    marginBottom: 20,
  },
  mapInner: {
    height: 160,
    position: "relative",
    overflow: "hidden",
  },
  mapGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
    opacity: 0.3,
  },
  mapDot: {
    width: "12.5%",
    height: 18,
    borderWidth: 0.5,
    borderColor: C.accent + "30",
  },
  mapOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  locationPin: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  pingCircle: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: C.red + "40",
  },
  mapFade: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    height: 40,
  },
  mapLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: C.card,
  },
  mapLabelText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textSecondary,
  },
  sectionTitle: {
    fontFamily: "Rajdhani_700Bold",
    fontSize: 14,
    color: C.textSecondary,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginHorizontal: 20,
    marginBottom: 12,
  },
  deviceCard: {
    marginHorizontal: 16,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    marginBottom: 12,
    overflow: "hidden",
    padding: 16,
  },
  deviceHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  deviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  deviceInfo: { flex: 1 },
  deviceNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  deviceName: {
    fontFamily: "Rajdhani_700Bold",
    fontSize: 17,
    color: C.text,
  },
  lostBadge: {
    backgroundColor: C.red + "22",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  lostText: {
    fontFamily: "Rajdhani_700Bold",
    fontSize: 9,
    color: C.red,
    letterSpacing: 1,
  },
  deviceLocation: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textSecondary,
  },
  deviceLastSeen: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: C.textMuted,
    marginTop: 2,
  },
  deviceRight: { alignItems: "center", paddingTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  deviceStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.cardBorder,
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  statValue: {
    fontFamily: "Rajdhani_600SemiBold",
    fontSize: 13,
    color: C.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: C.cardBorder,
  },
  signalBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
  },
  signalBar: {
    width: 4,
    borderRadius: 2,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.cardBorder,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionLabel: {
    fontFamily: "Rajdhani_600SemiBold",
    fontSize: 13,
    letterSpacing: 0.3,
  },
  infoCard: {
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.accent + "30",
    padding: 16,
    marginTop: 4,
  },
  infoText: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 18,
  },
});
