import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

import QuestionForm from "@/components/QuestionForm";
import { useQuestions } from "@/context/QuestionsContext";
import { useColors } from "@/hooks/useColors";

export default function EditQuestionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { questions, updateQuestion } = useQuestions();

  const question = questions.find((q) => q.id === id);

  if (!question) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium" }}>
          Question not found.
        </Text>
      </View>
    );
  }

  return (
    <QuestionForm
      initial={question}
      onSubmit={(data) => updateQuestion(id, data)}
      submitLabel="Update Question"
    />
  );
}
