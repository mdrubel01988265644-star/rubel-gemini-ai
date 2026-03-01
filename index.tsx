import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
  withDelay,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const C = Colors.dark;
const { width } = Dimensions.get("window");

function AnimatedShield() {
  const pulse = useSharedValue(0);
  const ring1 = useSharedValue(0);
  const ring2 = useSharedValue(0);
  const ring3 = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
    ring1.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.out(Easing.quad) }),
      -1,
      false
    );
    ring2.value = withDelay(
      800,
      withRepeat(
        withTiming(1, { duration: 2400, easing: Easing.out(Easing.quad) }),
        -1,
        false
      )
    );
    ring3.value = withDelay(
      1600,
      withRepeat(
        withTiming(1, { duration: 2400, easing: Easing.out(Easing.quad) }),
        -1,
        false
      )
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.7, 1]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.96, 1.04]) }],
  }));

  const ringStyle1 = useAnimatedStyle(() => ({
    opacity: interpolate(ring1.value, [0, 0.7, 1], [0.6, 0.2, 0]),
    transform: [{ scale: interpolate(ring1.value, [0, 1], [1, 2.2]) }],
  }));
  const ringStyle2 = useAnimatedStyle(() => ({
    opacity: interpolate(ring2.value, [0, 0.7, 1], [0.5, 0.15, 0]),
    transform: [{ scale: interpolate(ring2.value, [0, 1], [1, 2.2]) }],
  }));
  const ringStyle3 = useAnimatedStyle(() => ({
    opacity: interpolate(ring3.value, [0, 0.7, 1], [0.4, 0.1, 0]),
    transform: [{ scale: interpolate(ring3.value, [0, 1], [1, 2.2]) }],
  }));

  return (
    <View style={styles.shieldContainer}>
      <Animated.View style={[styles.ring, ringStyle1]} />
      <Animated.View style={[styles.ring, ringStyle2]} />
      <Animated.View style={[styles.ring, ringStyle3]} />
      <Animated.View style={[styles.shieldInner, pulseStyle]}>
        <LinearGradient
          colors={["#00D4FF22", "#00FF8822"]}
          style={styles.shieldGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="shield-checkmark" size={72} color={C.accent} />
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

function ScoreBar({ score }: { score: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(400, withTiming(score / 100, { duration: 1600 }));
  }, [score]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const color =
    score >= 80 ? C.green : score >= 50 ? C.amber : C.red;

  return (
    <View style={styles.scoreBarTrack}>
      <Animated.View style={[styles.scoreBarFill, barStyle, { backgroundColor: color }]} />
    </View>
  );
}

interface QuickAction {
  icon: string;
  label: string;
  labelBn: string;
  color: string;
  active: boolean;
}

const QUICK_ACTIONS: QuickAction[] = [
  { icon: "eye-off", label: "Stealth Mode", labelBn: "স্টেলথ মোড", color: C.accent, active: false },
  { icon: "camera", label: "Face Guard", labelBn: "ফেস গার্ড", color: C.green, active: true },
  { icon: "volume-high", label: "Siren", labelBn: "সাইরেন", color: C.red, active: false },
  { icon: "lock-closed", label: "Lock Now", labelBn: "লক করুন", color: C.amber, active: false },
];

interface QuickActionCardProps {
  item: QuickAction;
  lang: "en" | "bn";
  onToggle: () => void;
  index: number;
}

function QuickActionCard({ item, lang, onToggle, index }: QuickActionCardProps) {
  const [active, setActive] = useState(item.active);
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.92, { duration: 80 }),
      withTiming(1, { duration: 120 })
    );
    setActive((v) => !v);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  return (
    <Animated.View style={animStyle}>
      <Pressable onPress={handlePress} style={[styles.qaCard, active && { borderColor: item.color + "80" }]}>
        <View style={[styles.qaIconWrap, { backgroundColor: item.color + (active ? "22" : "11") }]}>
          <Ionicons name={item.icon as any} size={22} color={active ? item.color : C.textMuted} />
        </View>
        <Text style={[styles.qaLabel, { color: active ? item.color : C.textSecondary }]}>
          {lang === "bn" ? item.labelBn : item.label}
        </Text>
        <View style={[styles.qaDot, { backgroundColor: active ? item.color : C.textMuted }]} />
      </Pressable>
    </Animated.View>
  );
}

interface StatusRowProps {
  icon: string;
  label: string;
  value: string;
  color: string;
}

function StatusRow({ icon, label, value, color }: StatusRowProps) {
  return (
    <View style={styles.statusRow}>
      <Ionicons name={icon as any} size={16} color={color} />
      <Text style={styles.statusLabel}>{label}</Text>
      <View style={{ flex: 1 }} />
      <Text style={[styles.statusValue, { color }]}>{value}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const [lang, setLang] = useState<"en" | "bn">("en");
  const [protectionScore] = useState(87);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const toggleLang = () => {
    setLang((v) => (v === "en" ? "bn" : "en"));
    Haptics.selectionAsync();
  };

  const title = lang === "bn" ? "রুবেল জেমিনি এআই সিকিউরিটি" : "Rubel Gemini AI Security";
  const subtitle = lang === "bn" ? "আপনার ডিভাইস সুরক্ষিত আছে" : "Your device is protected";
  const scoreLabel = lang === "bn" ? "নিরাপত্তা স্কোর" : "Protection Score";

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 120 : 100 }}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.brand}>RUBEL × GEMINI</Text>
            <Text style={styles.title}>{title}</Text>
          </View>
          <Pressable onPress={toggleLang} style={styles.langBtn}>
            <Text style={styles.langBtnText}>{lang === "en" ? "বাং" : "EN"}</Text>
          </Pressable>
        </View>

        <AnimatedShield />

        <View style={styles.scoreCard}>
          <LinearGradient
            colors={["#0D1A35", "#0A1228"]}
            style={styles.scoreCardInner}
          >
            <View style={styles.scoreTop}>
              <View>
                <Text style={styles.scoreLabel}>{scoreLabel}</Text>
                <Text style={styles.scoreValue}>{protectionScore}%</Text>
              </View>
              <View style={styles.scoreStatus}>
                <View style={styles.activeIndicator} />
                <Text style={styles.activeText}>
                  {lang === "bn" ? "সক্রিয়" : "Active"}
                </Text>
              </View>
            </View>
            <ScoreBar score={protectionScore} />
            <Text style={styles.scoreHint}>
              {lang === "bn"
                ? "৭৫+ সুরক্ষা মডিউল সক্রিয়"
                : "75+ protection modules active"}
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.sectionTitle}>
            {lang === "bn" ? "সিস্টেম স্ট্যাটাস" : "System Status"}
          </Text>
          <StatusRow icon="shield-checkmark" label={lang === "bn" ? "এন্টি-থেফট" : "Anti-Theft"} value={lang === "bn" ? "চালু" : "ON"} color={C.green} />
          <StatusRow icon="camera" label={lang === "bn" ? "ফেস আইডি" : "Face ID Guard"} value={lang === "bn" ? "চালু" : "ON"} color={C.green} />
          <StatusRow icon="wifi" label={lang === "bn" ? "নেটওয়ার্ক" : "Network"} value={lang === "bn" ? "সংযুক্ত" : "Connected"} color={C.accent} />
          <StatusRow icon="battery-full" label={lang === "bn" ? "ব্যাটারি" : "Battery"} value="84%" color={C.green} />
          <StatusRow icon="cellular" label={lang === "bn" ? "সিম কার্ড" : "SIM Card"} value={lang === "bn" ? "নিরাপদ" : "Secured"} color={C.green} />
        </View>

        <Text style={styles.sectionTitle2}>
          {lang === "bn" ? "দ্রুত অ্যাকশন" : "Quick Actions"}
        </Text>
        <View style={styles.qaGrid}>
          {QUICK_ACTIONS.map((item, i) => (
            <QuickActionCard
              key={item.label}
              item={item}
              lang={lang}
              index={i}
              onToggle={() => {}}
            />
          ))}
        </View>

        <View style={styles.threatCard}>
          <LinearGradient
            colors={["#1A0A0A", "#150808"]}
            style={styles.threatInner}
          >
            <Ionicons name="warning" size={20} color={C.amber} />
            <View style={styles.threatText}>
              <Text style={styles.threatTitle}>
                {lang === "bn" ? "হুমকি সনাক্ত হয়নি" : "No Threats Detected"}
              </Text>
              <Text style={styles.threatSub}>
                {lang === "bn"
                  ? "সর্বশেষ স্ক্যান: এইমাত্র"
                  : "Last scan: Just now"}
              </Text>
            </View>
            <View style={[styles.threatBadge, { backgroundColor: C.green + "22" }]}>
              <Text style={[styles.threatBadgeText, { color: C.green }]}>
                {lang === "bn" ? "নিরাপদ" : "SAFE"}
              </Text>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  headerLeft: { flex: 1 },
  brand: {
    fontFamily: "Rajdhani_600SemiBold",
    fontSize: 11,
    color: C.accent,
    letterSpacing: 3,
    marginBottom: 2,
  },
  title: {
    fontFamily: "Rajdhani_700Bold",
    fontSize: 18,
    color: C.text,
    letterSpacing: 0.3,
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
  shieldContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 200,
    marginVertical: 8,
  },
  ring: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: C.accent + "60",
  },
  shieldInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  shieldGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.accent + "40",
  },
  scoreCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    overflow: "hidden",
    marginBottom: 12,
  },
  scoreCardInner: {
    padding: 18,
  },
  scoreTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  scoreLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: C.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  scoreValue: {
    fontFamily: "Rajdhani_700Bold",
    fontSize: 42,
    color: C.green,
    lineHeight: 44,
  },
  scoreStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.green,
  },
  activeText: {
    fontFamily: "Rajdhani_600SemiBold",
    fontSize: 14,
    color: C.green,
    letterSpacing: 1,
  },
  scoreBarTrack: {
    height: 6,
    backgroundColor: C.cardBorder,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 10,
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  scoreHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textMuted,
  },
  statusCard: {
    marginHorizontal: 16,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: "Rajdhani_700Bold",
    fontSize: 14,
    color: C.textSecondary,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: C.textSecondary,
  },
  statusValue: {
    fontFamily: "Rajdhani_600SemiBold",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  sectionTitle2: {
    fontFamily: "Rajdhani_700Bold",
    fontSize: 14,
    color: C.textSecondary,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginHorizontal: 20,
    marginBottom: 12,
  },
  qaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 12,
    gap: 10,
    marginBottom: 16,
  },
  qaCard: {
    width: (width - 54) / 2,
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 14,
    alignItems: "flex-start",
    gap: 10,
  },
  qaIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  qaLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  qaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    alignSelf: "flex-end",
  },
  threatCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.amber + "30",
    overflow: "hidden",
    marginBottom: 8,
  },
  threatInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  threatText: { flex: 1 },
  threatTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: C.text,
  },
  threatSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textMuted,
    marginTop: 2,
  },
  threatBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  threatBadgeText: {
    fontFamily: "Rajdhani_700Bold",
    fontSize: 12,
    letterSpacing: 1,
  },
});
