export type ImportActionState = {
  success: boolean;
  message: string;
  imported: { lessons: number; modules: number; exams: number };
};

export const initialImportState: ImportActionState = {
  success: false,
  message: "",
  imported: { lessons: 0, modules: 0, exams: 0 },
};
