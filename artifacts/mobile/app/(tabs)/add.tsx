import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";

import QuestionForm from "@/components/QuestionForm";
import { useQuestions } from "@/context/QuestionsContext";

export default function AddQuestionScreen() {
  const { addQuestion } = useQuestions();
  const [formKey, setFormKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setFormKey((k) => k + 1);
    }, [])
  );

  return <QuestionForm key={formKey} onSubmit={addQuestion} submitLabel="Save Question" />;
}
