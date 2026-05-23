import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ProgressCharts from "@/components/ProgressCharts";
import QuestionCard from "@/components/QuestionCard";
import StatCard from "@/components/StatCard";
import { isDueForRevision, useQuestions } from "@/context/QuestionsContext";
import { useColors } from "@/hooks/useColors";

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { questions, revisionHistory, loaded } = useQuestions();

  const stats = useMemo(() => {
    const total = questions.length;
    const weak = questions.filter((q) => q.confidenceLevel <= 2).length;
    const strong = questions.filter((q) => q.confidenceLevel >= 4).length;
    const dueNow = questions.filter((q) => isDueForRevision(q.nextRevisionDate)).length;

    const tagCounts: Record<string, number> = {};
    questions
      .filter((q) => q.confidenceLevel <= 2)
      .forEach((q) => q.tags.forEach((t) => (tagCounts[t] = (tagCounts[t] ?? 0) + 1)));
    const topWeakTopic =
      Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    return { total, weak, strong, dueNow, topWeakTopic };
  }, [questions]);

  const dueQuestions = useMemo(
    () =>
      questions
        .filter((q) => isDueForRevision(q.nextRevisionDate))
        .sort((a, b) => a.nextRevisionDate.localeCompare(b.nextRevisionDate)),
    [questions]
  );

  const recentQuestions = useMemo(
    () => [...questions].sort((a, b) => b.lastRevisedDate.localeCompare(a.lastRevisedDate)).slice(0, 5),
    [questions]
  );

  if (!loaded) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const webTopPad = Platform.OS === "web" ? 67 : 0;
  const webBottomPad = Platform.OS === "web" ? 34 : 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        padding: 16,
        paddingTop: 16 + webTopPad,
        paddingBottom: insets.bottom + 100 + webBottomPad,
      }}
    >
      <View style={styles.titleRow}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            Welcome back
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>DSA Tracker</Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/(tabs)/add")}
        >
          <Feather name="plus" size={20} color={colors.primaryForeground} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <StatCard label="Total Questions" value={stats.total} icon="book" />
        <StatCard
          label="Due for Revision"
          value={stats.dueNow}
          icon="clock"
          accent={colors.danger}
          accentBg={colors.dangerLight}
        />
      </View>
      <View style={[styles.statsGrid, { marginTop: 8 }]}>
        <StatCard
          label="Weak (≤2)"
          value={stats.weak}
          icon="alert-circle"
          accent={colors.danger}
          accentBg={colors.dangerLight}
        />
        <StatCard
          label="Strong (≥4)"
          value={stats.strong}
          icon="check-circle"
          accent={colors.success}
          accentBg={colors.successLight}
        />
      </View>

      <View
        style={[styles.weakTopicCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={[styles.weakTopicIcon, { backgroundColor: colors.warningLight }]}>
          <Feather name="trending-down" size={16} color={colors.warning} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.weakTopicLabel, { color: colors.mutedForeground }]}>
            Most Frequent Weak Topic
          </Text>
          <Text style={[styles.weakTopicValue, { color: colors.foreground }]}>
            {stats.topWeakTopic}
          </Text>
        </View>
      </View>

      <ProgressCharts revisionHistory={revisionHistory} />

      {dueQuestions.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: colors.danger }]} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Revise Now ({dueQuestions.length})
            </Text>
          </View>
          {dueQuestions.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </>
      )}

      {questions.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="book-open" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No questions yet</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Start adding DSA questions to track your revision progress.
          </Text>
          <TouchableOpacity
            style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)/add")}
          >
            <Feather name="plus" size={16} color={colors.primaryForeground} />
            <Text style={[styles.emptyBtnText, { color: colors.primaryForeground }]}>
              Add First Question
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Recent Activity
            </Text>
          </View>
          {recentQuestions.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  greeting: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 8,
  },
  weakTopicCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginTop: 8,
    marginBottom: 4,
  },
  weakTopicIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  weakTopicLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
  },
  weakTopicValue: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    marginTop: 8,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    maxWidth: 260,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  emptyBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
