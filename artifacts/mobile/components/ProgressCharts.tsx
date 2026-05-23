import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Polyline, Rect, Text as SvgText } from "react-native-svg";

import { RevisionEntry, todayString } from "@/context/QuestionsContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  revisionHistory: RevisionEntry[];
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][d.getDay()];
}

function calcStreak(revisionHistory: RevisionEntry[]): number {
  const today = todayString();
  const datesWithRevisions = new Set(revisionHistory.map((e) => e.date));

  let streak = 0;
  let cursor = new Date(today + "T00:00:00");

  while (true) {
    const dateStr = cursor.toISOString().split("T")[0];
    if (datesWithRevisions.has(dateStr)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export default function ProgressCharts({ revisionHistory }: Props) {
  const colors = useColors();
  const days = useMemo(() => getLast7Days(), []);

  const { dailyCounts, dailyAvgConfidence, weekTotal, streak } = useMemo(() => {
    const countMap: Record<string, number> = {};
    const confidenceMap: Record<string, number[]> = {};

    for (const entry of revisionHistory) {
      if (days.includes(entry.date)) {
        countMap[entry.date] = (countMap[entry.date] ?? 0) + 1;
        if (!confidenceMap[entry.date]) confidenceMap[entry.date] = [];
        confidenceMap[entry.date].push(entry.confidence);
      }
    }

    const dailyCounts = days.map((d) => countMap[d] ?? 0);
    const dailyAvgConfidence = days.map((d) => {
      const vals = confidenceMap[d];
      if (!vals || vals.length === 0) return null;
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    });

    const weekTotal = dailyCounts.reduce((a, b) => a + b, 0);
    const streak = calcStreak(revisionHistory);

    return { dailyCounts, dailyAvgConfidence, weekTotal, streak };
  }, [revisionHistory, days]);

  const CHART_W = 300;
  const BAR_H = 100;
  const BAR_PADDING = 8;
  const barSlotW = CHART_W / 7;
  const barWidth = barSlotW - BAR_PADDING * 2;
  const maxCount = Math.max(...dailyCounts, 1);

  const LINE_H = 90;
  const LINE_PADDING_X = 16;
  const LINE_PADDING_Y = 12;
  const lineW = CHART_W - LINE_PADDING_X * 2;
  const lineH = LINE_H - LINE_PADDING_Y * 2;

  const hasConfidenceData = dailyAvgConfidence.some((v) => v !== null);

  const linePoints = days
    .map((_, i) => {
      const val = dailyAvgConfidence[i];
      if (val === null) return null;
      const x = LINE_PADDING_X + (i / 6) * lineW;
      const y = LINE_PADDING_Y + lineH - ((val - 1) / 4) * lineH;
      return { x, y, val };
    });

  const validPoints = linePoints.filter((p): p is { x: number; y: number; val: number } => p !== null);
  const polylineStr = validPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionDot, { backgroundColor: colors.primary }]} />
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Progress</Text>
      </View>

      <View style={styles.miniStatsRow}>
        <View style={[styles.miniStat, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.miniStatIcon, { backgroundColor: colors.secondary }]}>
            <Feather name="calendar" size={14} color={colors.primary} />
          </View>
          <Text style={[styles.miniStatValue, { color: colors.foreground }]}>{weekTotal}</Text>
          <Text style={[styles.miniStatLabel, { color: colors.mutedForeground }]}>This week</Text>
        </View>
        <View style={[styles.miniStat, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.miniStatIcon, { backgroundColor: colors.warningLight }]}>
            <Feather name="zap" size={14} color={colors.warning} />
          </View>
          <Text style={[styles.miniStatValue, { color: colors.foreground }]}>
            {streak}
            <Text style={[styles.miniStatUnit, { color: colors.mutedForeground }]}> d</Text>
          </Text>
          <Text style={[styles.miniStatLabel, { color: colors.mutedForeground }]}>Streak</Text>
        </View>
      </View>

      <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.chartTitle, { color: colors.foreground }]}>Revisions per Day</Text>
        <Text style={[styles.chartSubtitle, { color: colors.mutedForeground }]}>Last 7 days</Text>
        <View style={styles.chartContainer}>
          <Svg width={CHART_W} height={BAR_H + 24}>
            {days.map((day, i) => {
              const count = dailyCounts[i];
              const barH = count === 0 ? 2 : (count / maxCount) * BAR_H;
              const x = i * barSlotW + BAR_PADDING;
              const y = BAR_H - barH;
              const isToday = day === todayString();
              return (
                <React.Fragment key={day}>
                  <Rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barH}
                    rx={4}
                    fill={count === 0 ? colors.border : isToday ? colors.primary : colors.secondary}
                    opacity={count === 0 ? 0.5 : 1}
                  />
                  {count > 0 && (
                    <SvgText
                      x={x + barWidth / 2}
                      y={y - 3}
                      fontSize={9}
                      fill={colors.mutedForeground}
                      textAnchor="middle"
                    >
                      {count}
                    </SvgText>
                  )}
                  <SvgText
                    x={x + barWidth / 2}
                    y={BAR_H + 16}
                    fontSize={10}
                    fill={isToday ? colors.primary : colors.mutedForeground}
                    textAnchor="middle"
                    fontWeight={isToday ? "700" : "400"}
                  >
                    {getDayLabel(day)}
                  </SvgText>
                </React.Fragment>
              );
            })}
          </Svg>
        </View>
      </View>

      <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.chartTitle, { color: colors.foreground }]}>Avg Confidence</Text>
        <Text style={[styles.chartSubtitle, { color: colors.mutedForeground }]}>Last 7 days · scale 1–5</Text>
        <View style={styles.chartContainer}>
          {!hasConfidenceData ? (
            <View style={[styles.emptyChart, { height: LINE_H + 24 }]}>
              <Text style={[styles.emptyChartText, { color: colors.mutedForeground }]}>
                Mark questions revised to see confidence trends
              </Text>
            </View>
          ) : (
            <Svg width={CHART_W} height={LINE_H + 24}>
              {[1, 2, 3, 4, 5].map((level) => {
                const y = LINE_PADDING_Y + lineH - ((level - 1) / 4) * lineH;
                return (
                  <React.Fragment key={level}>
                    <Line
                      x1={LINE_PADDING_X}
                      y1={y}
                      x2={CHART_W - LINE_PADDING_X}
                      y2={y}
                      stroke={colors.border}
                      strokeWidth={1}
                      strokeDasharray="3,4"
                    />
                    <SvgText
                      x={LINE_PADDING_X - 4}
                      y={y + 3}
                      fontSize={8}
                      fill={colors.mutedForeground}
                      textAnchor="end"
                    >
                      {level}
                    </SvgText>
                  </React.Fragment>
                );
              })}

              {validPoints.length > 1 && (
                <Polyline
                  points={polylineStr}
                  fill="none"
                  stroke={colors.primary}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )}

              {validPoints.map((p, idx) => (
                <React.Fragment key={idx}>
                  <Circle cx={p.x} cy={p.y} r={4} fill={colors.primary} />
                  <Circle cx={p.x} cy={p.y} r={2} fill={colors.card} />
                </React.Fragment>
              ))}

              {days.map((day, i) => {
                const isToday = day === todayString();
                const x = LINE_PADDING_X + (i / 6) * lineW;
                return (
                  <SvgText
                    key={day}
                    x={x}
                    y={LINE_H + 16}
                    fontSize={10}
                    fill={isToday ? colors.primary : colors.mutedForeground}
                    textAnchor="middle"
                    fontWeight={isToday ? "700" : "400"}
                  >
                    {getDayLabel(day)}
                  </SvgText>
                );
              })}
            </Svg>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
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
  miniStatsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  miniStat: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    alignItems: "flex-start",
    gap: 4,
  },
  miniStatIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  miniStatValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  miniStatUnit: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  miniStatLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  chartCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
    overflow: "hidden",
  },
  chartTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  chartSubtitle: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
  },
  chartContainer: {
    alignItems: "center",
  },
  emptyChart: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  emptyChartText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
