import type { CourseSeed, ExamQuestion } from "./course";

export type ExamAnswers = Record<string, string | undefined>;

export type ExamResult = {
  correct: number;
  incorrect: number;
  unanswered: number;
  total: number;
  percent: number;
  passed: boolean;
};

export function hasPassedExam(correct: number, total: number) {
  if (total === 0) {
    return false;
  }

  return Math.round((correct / total) * 100) >= 80;
}

export function gradeExam(questions: ExamQuestion[], answers: ExamAnswers): ExamResult {
  let correct = 0;
  let unanswered = 0;

  for (const question of questions) {
    const answer = answers[question.id];
    if (!answer) {
      unanswered += 1;
      continue;
    }

    if (answer === question.correctOptionId) {
      correct += 1;
    }
  }

  const total = questions.length;
  const incorrect = total - correct - unanswered;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);

  return {
    correct,
    incorrect,
    unanswered,
    total,
    percent,
    passed: hasPassedExam(correct, total),
  };
}

export function validateExamSeed(course: CourseSeed) {
  const invalidModules = course.modules
    .filter((courseModule) => courseModule.examQuestions.length !== 20)
    .map((courseModule) => courseModule.slug);

  return {
    moduleCount: course.modules.length,
    totalQuestions: course.modules.reduce((total, courseModule) => total + courseModule.examQuestions.length, 0),
    invalidModules,
  };
}
