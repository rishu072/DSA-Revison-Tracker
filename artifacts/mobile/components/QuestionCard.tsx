import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import {
  Question,
  confidenceBg,
  confidenceColor,
  isDueForRevision,
  useQuestions,
} from "@/context/QuestionsContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  question: Question;
}

const CONFIDENCE_LABELS = ["", "Weak", "Weak", "Medium", "Strong", "Strong"];

export default function QuestionCard({ question }: Props) {
  const colors = useColors();
  const { deleteQuestion, markRevised } = useQuestions();
  const due = isDueForRevision(question.nextRevisionDate);

  const confColor = confidenceColor(question.confidenceLevel, colors as any);
  const confBg = confidenceBg(question.confidenceLevel, colors as any);

  function handleDelete() {
    if (Platform.OS === "web") {
      if (confirm(`Delete "${question.name}"?`)) {
        deleteQuestion(question.id);
      }
      return;
    }
    Alert.alert("Delete Question", `Are you sure you want to delete "${question.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          deleteQuestion(question.id);
        },
      },
    ]);
  }

  async function handleMarkRevised() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    markRevised(question.id);
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/question/${question.id}` as any)}
      activeOpacity={0.75}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {question.name}
          </Text>
          {due && (
            <View style={[styles.badge, { backgroundColor: colors.danger }]}>
              <Text style={styles.badgeText}>Revise Now</Text>
            </View>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push(`/question/edit/${question.id}` as any)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="edit-2" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="trash-2" size={16} color={colors.destructive} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.meta}>
        <View style={[styles.pill, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.pillText, { color: colors.secondaryForeground }]}>
            {question.platform}
          </Text>
        </View>
        <View style={[styles.pill, { backgroundColor: confBg }]}>
          <Text style={[styles.pillText, { color: confColor }]}>
            {CONFIDENCE_LABELS[question.confidenceLevel]} · {question.confidenceLevel}/5
          </Text>
        </View>
      </View>

      {question.tags.length > 0 && (
        <View style={styles.tags}>
          {question.tags.slice(0, 4).map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: colors.accent }]}>
              <Text style={[styles.tagText, { color: colors.accentForeground }]}>{tag}</Text>
            </View>
          ))}
          {question.tags.length > 4 && (
            <Text style={[styles.tagMore, { color: colors.mutedForeground }]}>
              +{question.tags.length - 4}
            </Text>
          )}
        </View>
      )}

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.dates}>
          <Feather name="calendar" size={12} color={colors.mutedForeground} />
          <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
            Next: {question.nextRevisionDate}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.revisedBtn, { backgroundColor: colors.secondary }]}
          onPress={handleMarkRevised}
        >
          <Feather name="check" size={12} color={colors.secondaryForeground} />
          <Text style={[styles.revisedText, { color: colors.secondaryForeground }]}>
            Mark Revised
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  titleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 8,
  },
  actionBtn: {
    padding: 4,
  },
  meta: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  tags: {
    flexDirection: "row",
    gap: 4,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  tag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  tagText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  tagMore: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    alignSelf: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 2,
  },
  dates: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  revisedBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  revisedText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
});
