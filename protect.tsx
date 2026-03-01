import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Platform,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const C = Colors.dark;
const { width } = Dimensions.get("window");

interface FeatureModule {
  id: string;
  icon: string;
  iconLib: "ion" | "mci" | "fa5";
  label: string;
  labelBn: string;
  category: string;
  enabled: boolean;
  color: string;
  isPro?: boolean;
}

const MODULES: FeatureModule[] = [
  { id: "face-id", icon: "scan-circle", iconLib: "ion", label: "Smart Face ID", labelBn: "স্মার্ট ফেস আইডি", category: "biometric", enabled: true, color: C.accent },
  { id: "intruder", icon: "camera-reverse", iconLib: "ion", label: "Intruder Photo", labelBn: "অনুপ্রবেশকারী ছবি", category: "biometric", enabled: true, color: C.accent },
  { id: "anti-theft", icon: "shield-lock", iconLib: "mci", label: "Anti-Theft", labelBn: "চুরি বিরোধী", category: "device", enabled: true, color: C.green },
  { id: "factory-block", icon: "shield-alert", iconLib: "mci", label: "Factory Reset Block", labelBn: "ফ্যাক্টরি রিসেট ব্লক", category: "device", enabled: true, color: C.green },
  { id: "sim-alert", icon: "sim", iconLib: "mci", label: "SIM Change Alert", labelBn: "সিম পরিবর্তন সতর্কতা", category: "device", enabled: true, color: C.amber },
  { id: "pocket-alert", icon: "hand-left", iconLib: "ion", label: "Pocket Alert", labelBn: "পকেট সতর্কতা", category: "motion", enabled: false, color: C.amber },
  { id: "motion-alarm", icon: "motion-sensor", iconLib: "mci", label: "Motion Alarm", labelBn: "মোশন এলার্ম", category: "motion", enabled: true, color: C.amber },
  { id: "fake-power", icon: "power", iconLib: "ion", label: "Fake Power Off", labelBn: "ভুয়া পাওয়ার অফ", category: "stealth", enabled: false, color: "#9B59B6", isPro: true },
  { id: "remote-siren", icon: "megaphone", iconLib: "ion", label: "Remote Siren", labelBn: "রিমোট সাইরেন", category: "remote", enabled: false, color: C.red },
  { id: "remote-wipe", icon: "trash", iconLib: "ion", label: "Remote Wipe", labelBn: "রিমোট ওয়াইপ", category: "remote", enabled: false, color: C.red, isPro: true },
  { id: "remote-lock", icon: "lock-closed", iconLib: "ion", label: "Remote Lock", labelBn: "রিমোট লক", category: "remote", enabled: true, color: C.accent },
  { id: "gps-track", icon: "navigate", iconLib: "ion", label: "GPS Tracking", labelBn: "জিপিএস ট্র্যাকিং", category: "remote", enabled: true, color: C.accent },
  { id: "mic-spy", icon: "mic", iconLib: "ion", label: "Remote Mic", labelBn: "রিমোট মাইক", category: "remote", enabled: false, color: C.red, isPro: true },
  { id: "cam-spy", icon: "videocam", iconLib: "ion", label: "Remote Camera", labelBn: "রিমোট ক্যামেরা", category: "remote", enabled: false, color: C.red, isPro: true },
  { id: "call-log", icon: "call", iconLib: "ion", label: "Call Log Guard", labelBn: "কল লগ গার্ড", category: "privacy", enabled: true, color: "#9B59B6" },
  { id: "app-lock", icon: "apps", iconLib: "ion", label: "App Lock", labelBn: "অ্যাপ লক", category: "privacy", enabled: true, color: "#9B59B6" },
  { id: "vault", icon: "folder-lock", iconLib: "mci", label: "Secret Vault", labelBn: "গোপন ভল্ট", category: "privacy", enabled: false, color: "#9B59B6", isPro: true },
  { id: "fake-call", icon: "phone-cancel", iconLib: "mci", label: "Fake Call", labelBn: "ভুয়া কল", category: "stealth", enabled: false, color: "#E67E22" },
  { id: "stealth-mode", icon: "incognito", iconLib: "mci", label: "Stealth Mode", labelBn: "স্টেলথ মোড", category: "stealth", enabled: false, color: "#E67E22", isPro: true },
  { id: "screen-lock", icon: "phone-lock", iconLib: "mci", label: "Screen Timeout Lock", labelBn: "স্ক্রিন টাইমআউট লক", category: "device", enabled: true, color: C.green },
  { id: "network-mon", icon: "wifi-lock", iconLib: "mci", label: "Network Monitor", labelBn: "নেটওয়ার্ক মনিটর", category: "network", enabled: true, color: C.accent },
  { id: "vpn", icon: "vpn", iconLib: "mci", label: "Auto VPN", labelBn: "অটো ভিপিএন", category: "network", enabled: false, color: C.accent, isPro: true },
  { id: "safe-browse", icon: "security", iconLib: "mci", label: "Safe Browsing", labelBn: "নিরাপদ ব্রাউজিং", category: "network", enabled: true, color: C.accent },
  { id: "call-record", icon: "record-circle", iconLib: "mci", label: "Call Recording", labelBn: "কল রেকর্ডিং", category: "privacy", enabled: false, color: "#9B59B6", isPro: true },
  { id: "anti-spy", icon: "eye-off", iconLib: "ion", label: "Anti-Spyware", labelBn: "অ্যান্টি-স্পাইওয়্যার", category: "security", enabled: true, color: C.green },
  { id: "anti-malware", icon: "bug", iconLib: "ion", label: "Anti-Malware", labelBn: "অ্যান্টি-ম্যালওয়্যার", category: "security", enabled: true, color: C.green },
  { id: "anti-phish", icon: "fish", iconLib: "ion", label: "Anti-Phishing", labelBn: "অ্যান্টি-ফিশিং", category: "security", enabled: true, color: C.green },
  { id: "sms-guard", icon: "chatbubble", iconLib: "ion", label: "SMS Guard", labelBn: "এসএমএস গার্ড", category: "privacy", enabled: false, color: "#9B59B6" },
  { id: "contact-backup", icon: "people", iconLib: "ion", label: "Contact Backup", labelBn: "কন্টাক্ট ব্যাকআপ", category: "backup", enabled: true, color: "#1ABC9C" },
  { id: "photo-backup", icon: "images", iconLib: "ion", label: "Photo Backup", labelBn: "ফটো ব্যাকআপ", category: "backup", enabled: false, color: "#1ABC9C" },
];

const CATEGORIES = [
  { id: "all", label: "All", labelBn: "সব" },
  { id: "biometric", label: "Face/Bio", labelBn: "বায়ো" },
  { id: "device", label: "Device", labelBn: "ডিভাইস" },
  { id: "remote", label: "Remote", labelBn: "রিমোট" },
  { id: "stealth", label: "Stealth", labelBn: "স্টেলথ" },
  { id: "privacy", label: "Privacy", labelBn: "গোপনীয়তা" },
  { id: "security", label: "Security", labelBn: "নিরাপত্তা" },
  { id: "network", label: "Network", labelBn: "নেটওয়ার্ক" },
];

function IconRenderer({ lib, name, size, color }: { lib: "ion" | "mci" | "fa5"; name: string; size: number; color: string }) {
  if (lib === "ion") return <Ionicons name={name as any} size={size} color={color} />;
  if (lib === "mci") return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
  return <FontAwesome5 name={name as any} size={size} color={color} />;
}

interface ModuleTileProps {
  item: FeatureModule;
  lang: "en" | "bn";
}

function ModuleTile({ item, lang }: ModuleTileProps) {
  const [enabled, setEnabled] = useState(item.enabled);
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const toggle = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 60 }),
      withTiming(1, { duration: 100 })
    );
    setEnabled((v) => !v);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Animated.View style={[styles.tile, animStyle]}>
      <Pressable onPress={toggle} style={[styles.tileInner, enabled && { borderColor: item.color + "40" }]}>
        <View style={styles.tileBadgeRow}>
          {item.isPro && (
            <View style={styles.proBadge}>
              <Text style={styles.proText}>PRO</Text>
            </View>
          )}
          <View style={[styles.tileStatusDot, { backgroundColor: enabled ? item.color : C.textMuted }]} />
        </View>
        <View style={[styles.tileIcon, { backgroundColor: enabled ? item.color + "20" : C.surfaceAlt }]}>
          <IconRenderer lib={item.iconLib} name={item.icon} size={24} color={enabled ? item.color : C.textMuted} />
        </View>
        <Text style={[styles.tileLabel, { color: enabled ? C.text : C.textSecondary }]} numberOfLines={2}>
          {lang === "bn" ? item.labelBn : item.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function ProtectScreen() {
  const insets = useSafeAreaInsets();
  const [lang, setLang] = useState<"en" | "bn">("en");
  const [category, setCategory] = useState("all");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = MODULES.filter((m) => category === "all" || m.category === category);
  const enabledCount = MODULES.filter((m) => m.enabled).length;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.screenTitle}>
            {lang === "bn" ? "সুরক্ষা কেন্দ্র" : "Protection Center"}
          </Text>
          <Text style={styles.moduleCount}>
            {enabledCount}/{MODULES.length} {lang === "bn" ? "মডিউল সক্রিয়" : "modules active"}
          </Text>
        </View>
        <Pressable onPress={() => setLang((v) => v === "en" ? "bn" : "en")} style={styles.langBtn}>
          <Text style={styles.langBtnText}>{lang === "en" ? "বাং" : "EN"}</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => { setCategory(cat.id); Haptics.selectionAsync(); }}
            style={[styles.catChip, category === cat.id && styles.catChipActive]}
          >
            <Text style={[styles.catLabel, category === cat.id && styles.catLabelActive]}>
              {lang === "bn" ? cat.labelBn : cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.grid}
      >
        {filtered.map((item) => (
          <ModuleTile key={item.id} item={item} lang={lang} />
        ))}
        <View style={{ height: Platform.OS === "web" ? 120 : 90 }} />
      </ScrollView>
    </View>
  );
}

const TILE_SIZE = (width - 48) / 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  screenTitle: {
    fontFamily: "Rajdhani_700Bold",
    fontSize: 22,
    color: C.text,
    letterSpacing: 0.3,
  },
  moduleCount: {
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
  catScroll: {
    maxHeight: 44,
    marginBottom: 14,
  },
  catContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: "center",
  },
  catChip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  catChipActive: {
    backgroundColor: C.accent + "22",
    borderColor: C.accent + "80",
  },
  catLabel: {
    fontFamily: "Rajdhani_600SemiBold",
    fontSize: 13,
    color: C.textSecondary,
    letterSpacing: 0.3,
  },
  catLabelActive: {
    color: C.accent,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 10,
  },
  tile: {
    width: TILE_SIZE,
  },
  tileInner: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 12,
    minHeight: 100,
    position: "relative",
  },
  tileBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  proBadge: {
    backgroundColor: "#9B59B622",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  proText: {
    fontFamily: "Rajdhani_700Bold",
    fontSize: 9,
    color: "#9B59B6",
    letterSpacing: 1,
  },
  tileStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: "auto",
  },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  tileLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    lineHeight: 15,
  },
});
