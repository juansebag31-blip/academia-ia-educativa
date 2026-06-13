export type ExamActionState = {
  submitted: boolean;
  correct: number;
  incorrect: number;
  unanswered: number;
  total: number;
  percent: number;
  passed: boolean;
  message: string;
  answers: Record<string, string>;
};

export const initialExamState: ExamActionState = {
  submitted: false,
  correct: 0,
  incorrect: 0,
  unanswered: 0,
  total: 0,
  percent: 0,
  passed: false,
  message: "",
  answers: {},
};
