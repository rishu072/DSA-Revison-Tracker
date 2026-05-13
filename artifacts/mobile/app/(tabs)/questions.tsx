import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import QuestionCard from "@/components/QuestionCard";
import { ALL_TAGS, PLATFORMS, Platform as PType, useQuestions } from "@/context/QuestionsContext";
import { useColors } from "@/hooks/useColors";

type SortKey = "nextRevision" | "lastRevised" | "name" | "confidence";

export default function QuestionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { questions } = useQuestions();

  const [search, setSearch] = useState("");
  const [filterPlatform, setFilterPlatform] = useState<PType | "All">("All");
  const [filterConfidence, setFilterConfidence] = useState<number | "All">("All");
  const [filterTag, setFilterTag] = useState<string | "All">("All");
  const [sortKey, setSortKey] = useState<SortKey>("nextRevision");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = [...questions];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((item) => item.name.toLowerCase().includes(q));
    }
    if (filterPlatform !== "All") {
      list = list.filter((item) => item.platform === filterPlatform);
    }
    if (filterConfidence !== "All") {
      list = list.filter((item) => item.confidenceLevel === filterConfidence);
    }
    if (filterTag !== "All") {
      list = list.filter((item) => item.tags.includes(filterTag));
    }

    list.sort((a, b) => {
      if (sortKey === "nextRevision") return a.nextRevisionDate.localeCompare(b.nextRevisionDate);
      if (sortKey === "lastRevised") return b.lastRevisedDate.localeCompare(a.lastRevisedDate);
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "confidence") return a.confidenceLevel - b.confidenceLevel;
      return 0;
    });

    return list;
  }, [questions, search, filterPlatform, filterConfidence, filterTag, sortKey]);

  const webTopPad = Platform.OS === "web" ? 67 : 0;
  const webBottomPad = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16 + webTopPad }}>
        <View
          style={[
            styles.searchRow,
            { backgroundColor: colors.muted, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            value={search}
            onChangeText={setSearch}
            placeholder="Search questions..."
            placeholderTextColor={colors.mutedForeground}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterToggleBtn,
              {
                backgroundColor: showFilters ? colors.primary : colors.muted,
                borderColor: showFilters ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Feather
              name="filter"
              size={14}
              color={showFilters ? colors.primaryForeground : colors.mutedForeground}
            />
            <Text
              style={[
                styles.filterToggleText,
                { color: showFilters ? colors.primaryForeground : colors.mutedForeground },
              ]}
            >
              Filters
            </Text>
          </TouchableOpacity>

          <Text style={[styles.countText, { color: colors.mutedForeground }]}>
            {filtered.length} of {questions.length}
          </Text>

          <View style={styles.sortRow}>
            <Text style={[styles.sortLabel, { color: colors.mutedForeground }]}>Sort:</Text>
            {(["nextRevision", "lastRevised", "confidence", "name"] as SortKey[]).map((key) => {
              const labels: Record<SortKey, string> = {
                nextRevision: "Due",
                lastRevised: "Recent",
                confidence: "Level",
                name: "Name",
              };
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.sortChip,
                    {
                      backgroundColor: sortKey === key ? colors.primary : colors.muted,
                      borderColor: sortKey === key ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSortKey(key)}
                >
                  <Text
                    style={[
                      styles.sortChipText,
                      { color: sortKey === key ? colors.primaryForeground : colors.mutedForeground },
                    ]}
                  >
                    {labels[key]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {showFilters && (
          <View
            style={[
              styles.filtersPanel,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: colors.mutedForeground }]}>
                Platform
              </Text>
              <View style={styles.chips}>
                {(["All", ...PLATFORMS] as const).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: filterPlatform === p ? colors.primary : colors.muted,
                        borderColor: filterPlatform === p ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setFilterPlatform(p as any)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color:
                            filterPlatform === p
                              ? colors.primaryForeground
                              : colors.mutedForeground,
                        },
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: colors.mutedForeground }]}>
                Confidence
              </Text>
              <View style={styles.chips}>
                {(["All", 1, 2, 3, 4, 5] as const).map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: filterConfidence === c ? colors.primary : colors.muted,
                        borderColor: filterConfidence === c ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setFilterConfidence(c as any)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color:
                            filterConfidence === c
                              ? colors.primaryForeground
                              : colors.mutedForeground,
                        },
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: colors.mutedForeground }]}>
                Topic
              </Text>
              <View style={styles.chips}>
                {(["All", ...ALL_TAGS] as const).map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: filterTag === tag ? colors.accent : colors.muted,
                        borderColor: filterTag === tag ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setFilterTag(tag)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color:
                            filterTag === tag ? colors.accentForeground : colors.mutedForeground,
                        },
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                setFilterPlatform("All");
                setFilterConfidence("All");
                setFilterTag("All");
              }}
            >
              <Text style={[styles.clearText, { color: colors.destructive }]}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <QuestionCard question={item} />}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: insets.bottom + 100 + webBottomPad,
        }}
        scrollEnabled={!!filtered.length}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="inbox" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {questions.length === 0 ? "No questions yet" : "No results found"}
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {questions.length === 0
                ? "Tap + to add your first question"
                : "Try adjusting your search or filters"}
            </Text>
            {questions.length === 0 && (
              <TouchableOpacity
                style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/(tabs)/add")}
              >
                <Feather name="plus" size={16} color={colors.primaryForeground} />
                <Text style={[styles.emptyBtnText, { color: colors.primaryForeground }]}>
                  Add Question
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  filterToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterToggleText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  countText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  sortLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  sortChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  sortChipText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  filtersPanel: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  filterSection: {
    gap: 6,
  },
  filterSectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  clearText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginTop: 8,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    maxWidth: 240,
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
