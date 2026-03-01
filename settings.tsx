import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  TextInput,
  Platform,
  Alert,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const C = Colors.dark;

interface SettingRow {
  icon: string;
  iconLib: "ion" | "mci";
  label: string;
  labelBn: string;
  desc?: string;
  descBn?: string;
  type: "toggle" | "nav" | "info";
  value?: boolean;
  color?: string;
}

const SETTINGS_GROUPS: { title: string; titleBn: string; rows: SettingRow[] }[] = [
  {
    title: "Security",
    titleBn: "নিরাপত্তা",
    rows: [
      { icon: "key", iconLib: "ion", label: "Master Password", labelBn: "মাস্টার পাসওয়ার্ড", desc: "Set your master protection key", descBn: "আপনার মাস্টার কী সেট করুন", type: "nav", color: C.accent },
      { icon: "finger-print", iconLib: "ion", label: "Biometric Auth", labelBn: "বায়োমেট্রিক অথ", type: "toggle", value: true, color: C.green },
      { icon: "shield-lock", iconLib: "mci", label: "Device Admin Rights", labelBn: "ডিভাইস অ্যাডমিন রাইট", desc: "Block uninstall & factory reset", descBn: "আনইন্সটল ও ফ্যাক্টরি রিসেট ব্লক", type: "toggle", value: true, color: C.green },
      { icon: "accessibility", iconLib: "mci", label: "Accessibility Service", labelBn: "অ্যাক্সেসিবিলিটি সেবা", desc: "Required for advanced protection", descBn: "উন্নত সুরক্ষার জন্য প্রয়োজন", type: "toggle", value: true, color: C.amber },
    ],
  },
  {
    title: "Notifications",
    titleBn: "বিজ্ঞপ্তি",
    rows: [
      { icon: "notifications", iconLib: "ion", label: "Security Alerts", labelBn: "নিরাপত্তা সতর্কতা", type: "toggle", value: true, color: C.accent },
      { icon: "warning", iconLib: "ion", label: "Threat Warnings", labelBn: "হুমকি সতর্কতা", type: "toggle", value: true, color: C.red },
      { icon: "phone-portrait", iconLib: "ion", label: "Remote Commands", labelBn: "রিমোট কমান্ড", type: "toggle", value: true, color: C.amber },
    ],
  },
  {
    title: "Account",
    titleBn: "অ্যাকাউন্ট",
    rows: [
      { icon: "logo-google", iconLib: "ion", label: "Google Sync", labelBn: "গুগল সিঙ্ক", desc: "Sync across all your devices", descBn: "সব ডিভাইসে সিঙ্ক করুন", type: "nav", color: "#E74C3C" },
      { icon: "cloud-upload", iconLib: "ion", label: "Backup & Restore", labelBn: "ব্যাকআপ ও পুনরুদ্ধার", type: "nav", color: C.accent },
      { icon: "language", iconLib: "ion", label: "Language", labelBn: "ভাষা", type: "nav", color: "#9B59B6" },
    ],
  },
  {
    title: "About",
    titleBn: "সম্পর্কে",
    rows: [
      { icon: "information-circle", iconLib: "ion", label: "Version", labelBn: "ভার্সন", desc: "1.0.0 — Production Build", descBn: "১.০.০ — প্রোডাকশন বিল্ড", type: "info" },
      { icon: "document-text", iconLib: "ion", label: "Privacy Policy", labelBn: "গোপনীয়তা নীতি", type: "nav" },
      { icon: "help-circle", iconLib: "ion", label: "Support", labelBn: "সাপোর্ট", type: "nav" },
    ],
  },
];

interface PasswordModalProps {
  visible: boolean;
  onClose: () => void;
  lang: "en" | "bn";
}

function PasswordModal({ visible, onClose, lang }: PasswordModalProps) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSave = () => {
    if (next.length < 6) {
      Alert.alert(
        lang === "bn" ? "ত্রুটি" : "Error",
        lang === "bn" ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে" : "Password must be at least 6 characters"
      );
      return;
    }
    if (next !== confirm) {
      Alert.alert(
        lang === "bn" ? "ত্রুটি" : "Error",
        lang === "bn" ? "পাসওয়ার্ড মিলছে না" : "Passwords do not match"
      );
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>
            {lang === "bn" ? "মাস্টার পাসওয়ার্ড" : "Master Password"}
          </Text>
          <Text style={styles.modalSub}>
            {lang === "bn"
              ? "এই পাসওয়ার্ড সব সুরক্ষা মডিউল আনলক করে"
              : "This password unlocks all protection modules"}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={lang === "bn" ? "বর্তমান পাসওয়ার্ড" : "Current Password"}
            placeholderTextColor={C.textMuted}
            secureTextEntry
            value={current}
            onChangeText={setCurrent}
          />
          <TextInput
            style={styles.input}
            placeholder={lang === "bn" ? "নতুন পাসওয়ার্ড" : "New Password"}
            placeholderTextColor={C.textMuted}
            secureTextEntry
            value={next}
            onChangeText={setNext}
          />
          <TextInput
            style={styles.input}
            placeholder={lang === "bn" ? "পাসওয়ার্ড নিশ্চিত করুন" : "Confirm Password"}
            placeholderTextColor={C.textMuted}
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />
          <View style={styles.modalBtns}>
            <Pressable onPress={onClose} style={[styles.modalBtn, styles.cancelBtn]}>
              <Text style={styles.cancelBtnText}>{lang === "bn" ? "বাতিল" : "Cancel"}</Text>
            </Pressable>
            <Pressable onPress={handleSave} style={[styles.modalBtn, styles.saveBtn]}>
              <Text style={styles.saveBtnText}>{lang === "bn" ? "সংরক্ষণ" : "Save"}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SettingItem({
  row,
  lang,
  onPress,
}: {
  row: SettingRow;
  lang: "en" | "bn";
  onPress?: () => void;
}) {
  const [enabled, setEnabled] = useState(row.value ?? false);

  const toggle = () => {
    setEnabled((v) => !v);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Pressable
      onPress={row.type === "toggle" ? toggle : onPress}
      style={styles.settingRow}
    >
      <View style={[styles.settingIcon, { backgroundColor: (row.color || C.textMuted) + "18" }]}>
        {row.iconLib === "ion" ? (
          <Ionicons name={row.icon as any} size={18} color={row.color || C.textSecondary} />
        ) : (
          <MaterialCommunityIcons name={row.icon as any} size={18} color={row.color || C.textSecondary} />
        )}
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{lang === "bn" ? row.labelBn : row.label}</Text>
        {(row.desc || row.descBn) && (
          <Text style={styles.settingDesc}>{lang === "bn" ? row.descBn : row.desc}</Text>
        )}
      </View>
      {row.type === "toggle" ? (
        <Switch
          value={enabled}
          onValueChange={toggle}
          trackColor={{ false: C.cardBorder, true: C.accent + "80" }}
          thumbColor={enabled ? C.accent : C.textMuted}
        />
      ) : row.type === "nav" ? (
        <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
      ) : (
        <Text style={styles.settingValue}>{lang === "bn" ? row.descBn : row.desc}</Text>
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [lang, setLang] = useState<"en" | "bn">("en");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleRowPress = (row: SettingRow) => {
    if (row.label === "Master Password") {
      setShowPasswordModal(true);
    } else if (row.label === "Language") {
      setLang((v) => (v === "en" ? "bn" : "en"));
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 120 : 100 }}
      >
        <View style={styles.header}>
          <Text style={styles.screenTitle}>
            {lang === "bn" ? "সেটিংস" : "Settings"}
          </Text>
          <Pressable onPress={() => setLang((v) => v === "en" ? "bn" : "en")} style={styles.langBtn}>
            <Text style={styles.langBtnText}>{lang === "en" ? "বাং" : "EN"}</Text>
          </Pressable>
        </View>

        <LinearGradient
          colors={["#0A1428", "#070E1F"]}
          style={styles.brandCard}
        >
          <View style={styles.brandIcon}>
            <Ionicons name="shield-checkmark" size={40} color={C.accent} />
          </View>
          <Text style={styles.brandTitle}>RUBEL × GEMINI</Text>
          <Text style={styles.brandSub}>AI Security — Joint Venture</Text>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>
              {lang === "bn" ? "প্রোডাকশন বিল্ড" : "PRODUCTION BUILD"}
            </Text>
          </View>
        </LinearGradient>

        {SETTINGS_GROUPS.map((group) => (
          <View key={group.title} style={styles.group}>
            <Text style={styles.groupTitle}>
              {lang === "bn" ? group.titleBn : group.title}
            </Text>
            <View style={styles.groupCard}>
              {group.rows.map((row, idx) => (
                <View key={row.label}>
                  <SettingItem
                    row={row}
                    lang={lang}
                    onPress={() => handleRowPress(row)}
                  />
                  {idx < group.rows.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        <Pressable
          style={styles.dangerBtn}
          onPress={() =>
            Alert.alert(
              lang === "bn" ? "লগআউট" : "Log Out",
              lang === "bn" ? "আপনি কি নিশ্চিত?" : "Are you sure?",
              [
                { text: lang === "bn" ? "বাতিল" : "Cancel", style: "cancel" },
                { text: lang === "bn" ? "লগআউট" : "Log Out", style: "destructive" },
              ]
            )
          }
        >
          <Ionicons name="log-out" size={18} color={C.red} />
          <Text style={styles.dangerBtnText}>
            {lang === "bn" ? "লগআউট" : "Log Out"}
          </Text>
        </Pressable>
      </ScrollView>

      <PasswordModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        lang={lang}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  screenTitle: {
    fontFamily: "Rajdhani_700Bold",
    fontSize: 22,
    color: C.text,
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
  brandCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.accent + "30",
    marginBottom: 24,
  },
  brandIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: C.accent + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.accent + "30",
  },
  brandTitle: {
    fontFamily: "Rajdhani_700Bold",
    fontSize: 18,
    color: C.text,
    letterSpacing: 3,
  },
  brandSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 4,
    marginBottom: 12,
  },
  brandBadge: {
    backgroundColor: C.green + "18",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: C.green + "40",
  },
  brandBadgeText: {
    fontFamily: "Rajdhani_700Bold",
    fontSize: 11,
    color: C.green,
    letterSpacing: 1.5,
  },
  group: { marginBottom: 20 },
  groupTitle: {
    fontFamily: "Rajdhani_700Bold",
    fontSize: 13,
    color: C.textMuted,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginHorizontal: 20,
    marginBottom: 8,
  },
  groupCard: {
    marginHorizontal: 16,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingContent: { flex: 1 },
  settingLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: C.text,
  },
  settingDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textMuted,
    marginTop: 2,
  },
  settingValue: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textMuted,
    textAlign: "right",
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: C.cardBorder,
    marginLeft: 64,
  },
  dangerBtn: {
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: C.red + "40",
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: C.red + "0A",
    marginTop: 4,
  },
  dangerBtnText: {
    fontFamily: "Rajdhani_600SemiBold",
    fontSize: 16,
    color: C.red,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  modalTitle: {
    fontFamily: "Rajdhani_700Bold",
    fontSize: 22,
    color: C.text,
    marginBottom: 6,
  },
  modalSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: C.textSecondary,
    marginBottom: 20,
  },
  input: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: C.text,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginBottom: 12,
  },
  modalBtns: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  cancelBtnText: {
    fontFamily: "Rajdhani_600SemiBold",
    fontSize: 15,
    color: C.textSecondary,
  },
  saveBtn: {
    backgroundColor: C.accent,
  },
  saveBtnText: {
    fontFamily: "Rajdhani_700Bold",
    fontSize: 15,
    color: C.background,
  },
});
