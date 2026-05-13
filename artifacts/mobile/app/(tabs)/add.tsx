import React from "react";

import QuestionForm from "@/components/QuestionForm";
import { useQuestions } from "@/context/QuestionsContext";

export default function AddQuestionScreen() {
  const { addQuestion } = useQuestions();

  return <QuestionForm onSubmit={addQuestion} submitLabel="Save Question" />;
}
