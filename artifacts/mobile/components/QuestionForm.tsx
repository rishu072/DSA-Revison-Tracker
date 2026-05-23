import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ALL_TAGS,
  PLATFORMS,
  Platform as PlatformType,
  QuestionInput,
  todayString,
} from "@/context/QuestionsContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  initial?: Partial<QuestionInput>;
  onSubmit: (q: QuestionInput) => Promise<void>;
  submitLabel: string;
}

export default function QuestionForm({ initial, onSubmit, submitLabel }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState(initial?.name ?? "");
  const [platform, setPlatform] = useState<PlatformType>(initial?.platform ?? "LeetCode");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [approach, setApproach] = useState(initial?.approach ?? "");
  const [timeComplexity, setTimeComplexity] = useState(initial?.timeComplexity ?? "");
  const [confidenceLevel, setConfidenceLevel] = useState<1 | 2 | 3 | 4 | 5>(
    initial?.confidenceLevel ?? 3
  );
  const [lastRevisedDate, setLastRevisedDate] = useState(
    initial?.lastRevisedDate ?? todayString()
  );
  const [mistakeNotes, setMistakeNotes] = useState(initial?.mistakeNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSubmit() {
    if (!name.trim()) {
      setError("Question name is required.");
      return;
    }
    if (!lastRevisedDate) {
      setError("Last revised date is required.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await onSubmit({
        name: name.trim(),
        platform,
        tags,
        approach: approach.trim(),
        timeComplexity: timeComplexity.trim(),
        confidenceLevel,
        lastRevisedDate,
        mistakeNotes: mistakeNotes.trim(),
      });
      router.back();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = [
    styles.input,
    { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground },
  ];

  const labelStyle = [styles.label, { color: colors.mutedForeground }];

  const confColors: Record<number, string> = {
    1: colors.danger,
    2: colors.danger,
    3: colors.warning,
    4: colors.success,
    5: colors.success,
  };

  const webTopPad = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.container,
          { paddingTop: 16 + webTopPad, paddingBottom: 16 },
        ]}
        keyboardShouldPersistTaps="handled"
        bottomOffset={16}
      >
        <View style={styles.field}>
          <Text style={labelStyle}>Question Name *</Text>
          <TextInput
            style={inputStyle}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Longest Common Subsequence"
            placeholderTextColor={colors.mutedForeground}
            returnKeyType="next"
          />
        </View>

        <View style={styles.field}>
          <Text style={labelStyle}>Platform</Text>
          <View style={styles.chips}>
            {PLATFORMS.map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.chip,
                  {
                    backgroundColor: platform === p ? colors.primary : colors.muted,
                    borderColor: platform === p ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setPlatform(p)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: platform === p ? colors.primaryForeground : colors.mutedForeground },
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={labelStyle}>Topic Tags</Text>
          <View style={styles.chips}>
            {ALL_TAGS.map((tag) => {
              const selected = tags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? colors.accent : colors.muted,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: selected ? colors.accentForeground : colors.mutedForeground },
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={labelStyle}>Approach</Text>
          <TextInput
            style={[inputStyle, styles.textarea]}
            value={approach}
            onChangeText={setApproach}
            placeholder="Describe your approach..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.field}>
          <Text style={labelStyle}>Time Complexity</Text>
          <TextInput
            style={inputStyle}
            value={timeComplexity}
            onChangeText={setTimeComplexity}
            placeholder="e.g. O(n log n)"
            placeholderTextColor={colors.mutedForeground}
            returnKeyType="next"
          />
        </View>

        <View style={styles.field}>
          <Text style={labelStyle}>Confidence Level</Text>
          <View style={styles.chips}>
            {([1, 2, 3, 4, 5] as const).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.confChip,
                  {
                    backgroundColor: confidenceLevel === level ? confColors[level] : colors.muted,
                    borderColor: confColors[level],
                    borderWidth: 1.5,
                  },
                ]}
                onPress={() => setConfidenceLevel(level)}
              >
                <Text
                  style={[
                    styles.confChipText,
                    { color: confidenceLevel === level ? "#fff" : confColors[level] },
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            1-2 = Weak · 3 = Medium · 4-5 = Strong
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={labelStyle}>Last Revised Date</Text>
          <TextInput
            style={inputStyle}
            value={lastRevisedDate}
            onChangeText={setLastRevisedDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.mutedForeground}
            returnKeyType="next"
          />
        </View>

        <View style={[styles.field, { marginBottom: 0 }]}>
          <Text style={labelStyle}>Mistake Notes</Text>
          <TextInput
            style={[inputStyle, styles.textarea]}
            value={mistakeNotes}
            onChangeText={setMistakeNotes}
            placeholder="What did you get wrong? What tripped you up?"
            placeholderTextColor={colors.mutedForeground}
            multiline
            textAlignVertical="top"
          />
        </View>
      </KeyboardAwareScrollView>

      {/* Fixed footer — always visible above keyboard */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 16),
          },
        ]}
      >
        {error ? (
          <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
        ) : null}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
          onPress={handleSubmit}
          disabled={saving}
        >
          <Feather name="save" size={18} color={colors.primaryForeground} />
          <Text style={[styles.submitText, { color: colors.primaryForeground }]}>
            {saving ? "Saving..." : submitLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    padding: 16,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  textarea: {
    height: 110,
    paddingTop: 12,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  confChip: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  confChipText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  hint: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 6,
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
