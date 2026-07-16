import { getAiEngineeringModule } from "./modules";

const moduleOne = getAiEngineeringModule("modulo-01");
if (!moduleOne) throw new Error("Prepared AI Engineering Module 1 is unavailable.");

export const aiEngineeringModuleOne = moduleOne;
