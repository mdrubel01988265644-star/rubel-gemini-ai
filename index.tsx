import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// সরাসরি কালার কোড (কোনো ফাইল থেকে লোড হবে না, তাই সুপার ফাস্ট)
const C = {
  accent: "#00D4FF",
  green: "#00FF88",
  background: "#050B18",
  card: "#0D1A35",
  text: "#FFFFFF",
  textSecondary: "#A0A0A0"
};

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const [lang, setLang] = useState<"en" | "bn">("bn"); // আপনার জন্য ডিফল্ট বাংলা
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>RUBEL × GEMINI</Text>
            <Text style={styles.title}>{lang === "bn" ? "জেমিনি এআই সিকিউরিটি" : "Gemini AI Security"}</Text>
          </View>
          <Pressable onPress={() => setLang(lang === "en" ? "bn" : "en")} style={styles.langBtn}>
            <Text style={styles.langBtnText}>{lang === "en" ? "বাং" : "EN"}</Text>
          </Pressable>
        </View>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>{lang === "bn" ? "নিরাপত্তা স্কোর" : "Security Score"}</Text>
          <Text style={styles.scoreValue}>100%</Text>
          <Text style={styles.scoreHint}>{lang === "bn" ? "আপনার ডিভাইস সম্পূর্ণ নিরাপদ" : "Device is fully secured"}</Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.sectionTitle}>{lang === "bn" ? "সিস্টেম স্ট্যাটাস" : "System Status"}</Text>
          <View style={styles.statusRow}><Ionicons name="shield-checkmark" size={18} color={C.green} /><Text style={styles.statusLabel}>{lang === "bn" ? "এন্টি-থেফট: চালু" : "Anti-Theft: ON"}</Text></View>
          <View style={styles.statusRow}><Ionicons name="lock-closed" size={18} color={C.green} /><Text style={styles.statusLabel}>{lang === "bn" ? "লক গার্ড: সক্রিয়" : "Lock Guard: Active"}</Text></View>
          <View style={styles.statusRow}><Ionicons name="wifi" size={18} color={C.accent} /><Text style={styles.statusLabel}>{lang === "bn" ? "নেটওয়ার্ক: নিরাপদ" : "Network: Secured"}</Text></View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: { flexDirection: "row", justifyContent: "space-between", padding: 20 },
  brand: { fontSize: 10, color: C.accent, letterSpacing: 2 },
  title: { fontSize: 20, color: C.text, fontWeight: "bold" },
  langBtn: { padding: 8, borderRadius: 8, backgroundColor: C.card },
  langBtnText: { color: C.accent, fontWeight: "bold" },
  scoreCard: { margin: 20, padding: 25, backgroundColor: C.card, borderRadius: 15, alignItems: 'center' },
  scoreLabel: { color: C.textSecondary, fontSize: 14 },
  scoreValue: { color: C.green, fontSize: 55, fontWeight: "bold", marginVertical: 5 },
  scoreHint: { color: C.textSecondary, fontSize: 12 },
  statusCard: { marginHorizontal: 20, padding: 20, backgroundColor: C.card, borderRadius: 15 },
  sectionTitle: { color: C.accent, fontSize: 12, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
  statusRow: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 10 },
  statusLabel: { color: C.text, fontSize: 16 }
});
