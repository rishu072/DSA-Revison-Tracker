import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  confidenceBg,
  confidenceColor,
  isDueForRevision,
  useQuestions,
} from "@/context/QuestionsContext";
import { useColors } from "@/hooks/useColors";

const CONFIDENCE_LABELS: Record<number, string> = {
  1: "Very Weak",
  2: "Weak",
  3: "Medium",
  4: "Strong",
  5: "Very Strong",
};

function InfoRow({ icon, label, value, colors }: { icon: keyof typeof Feather.glyphMap; label: string; value: string; colors: any }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, { backgroundColor: colors.muted }]}>
        <Feather name={icon} size={14} color={colors.mutedForeground} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
      </View>
    </View>
  );
}

export default function QuestionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { questions, deleteQuestion, markRevised } = useQuestions();

  const question = questions.find((q) => q.id === id);

  if (!question) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.foreground }]}>Question not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.primary }]}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const due = isDueForRevision(question.nextRevisionDate);
  const confColor = confidenceColor(question.confidenceLevel, colors as any);
  const confBg = confidenceBg(question.confidenceLevel, colors as any);

  const webTopPad = Platform.OS === "web" ? 67 : 0;

  function handleDelete() {
    if (Platform.OS === "web") {
      if (confirm(`Delete "${question!.name}"?`)) {
        deleteQuestion(question!.id);
        router.back();
      }
      return;
    }
    Alert.alert("Delete Question", `Delete "${question!.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          deleteQuestion(question!.id);
          router.back();
        },
      },
    ]);
  }

  async function handleMarkRevised() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    markRevised(question!.id);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        padding: 16,
        paddingTop: 16 + webTopPad,
        paddingBottom: insets.bottom + 32,
      }}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.qName, { color: colors.foreground }]}>{question.name}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.muted }]}
            onPress={() => router.push(`/question/edit/${question.id}` as any)}
          >
            <Feather name="edit-2" size={16} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.dangerLight }]}
            onPress={handleDelete}
          >
            <Feather name="trash-2" size={16} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.badges}>
        <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.badgeText, { color: colors.secondaryForeground }]}>
            {question.platform}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: confBg }]}>
          <Text style={[styles.badgeText, { color: confColor }]}>
            {CONFIDENCE_LABELS[question.confidenceLevel]} · {question.confidenceLevel}/5
          </Text>
        </View>
        {due && (
          <View style={[styles.badge, { backgroundColor: colors.danger }]}>
            <Text style={[styles.badgeText, { color: "#fff" }]}>Revise Now</Text>
          </View>
        )}
      </View>

      {question.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {question.tags.map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: colors.accent }]}>
              <Text style={[styles.tagText, { color: colors.accentForeground }]}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <InfoRow icon="calendar" label="Last Revised" value={question.lastRevisedDate} colors={colors} />
        <InfoRow icon="clock" label="Next Revision" value={question.nextRevisionDate} colors={colors} />
        {question.timeComplexity ? (
          <InfoRow icon="zap" label="Time Complexity" value={question.timeComplexity} colors={colors} />
        ) : null}
      </View>

      {question.approach ? (
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Feather name="cpu" size={14} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Approach</Text>
          </View>
          <Text style={[styles.sectionBody, { color: colors.foreground }]}>
            {question.approach}
          </Text>
        </View>
      ) : null}

      {question.mistakeNotes ? (
        <View
          style={[
            styles.section,
            { backgroundColor: colors.dangerLight, borderColor: colors.danger },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Feather name="alert-triangle" size={14} color={colors.danger} />
            <Text style={[styles.sectionTitle, { color: colors.danger }]}>Mistake Notes</Text>
          </View>
          <Text style={[styles.sectionBody, { color: colors.foreground }]}>
            {question.mistakeNotes}
          </Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.markRevisedBtn, { backgroundColor: colors.success }]}
        onPress={handleMarkRevised}
      >
        <Feather name="check-circle" size={18} color="#fff" />
        <Text style={styles.markRevisedText}>Mark as Revised Today</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFound: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  backLink: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  qName: {
    flex: 1,
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    lineHeight: 28,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badges: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 14,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    gap: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  sectionBody: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  markRevisedBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  markRevisedText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
});
