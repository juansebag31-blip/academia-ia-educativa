import { normalizeForComparison } from "./corpus";
import type {
  RagEvaluationCase,
  RagEvaluationTarget,
} from "./evaluation-cases";
import type { RagSearchResult } from "./retrieval";

export type RagEvaluationResultItem = {
  rank: number;
  correct: boolean;
  similarity: number;
  moduleSlug: string | null;
  moduleNumber: number | null;
  moduleTitle: string | null;
  sourceKind: RagSearchResult["sourceKind"];
  sectionTitle: string | null;
  subsectionTitle: string | null;
  pages: [number, number];
  chunkIndex: number;
  wordCount: number;
  sourceFile: string;
  contentSha256: string;
  preview: string;
};

export type RagEvaluationCaseResult = {
  id: string;
  kind: RagEvaluationCase["kind"];
  question: string;
  answerable: boolean;
  expectedLabel: string;
  correctRank: number | null;
  top1: boolean;
  top3: boolean;
  top5: boolean;
  firstCorrectSimilarity: number | null;
  top1Similarity: number | null;
  top1Top2Gap: number | null;
  results: RagEvaluationResultItem[];
};

function targetMatches(result: RagSearchResult, target: RagEvaluationTarget) {
  if (result.moduleSlug !== target.moduleSlug) return false;
  if (target.sourceKind && result.sourceKind !== target.sourceKind) return false;
  if (!target.sectionNeedles || target.sectionNeedles.length === 0) return true;

  const haystack = normalizeForComparison([
    result.sectionTitle,
    result.subsectionTitle,
    ...result.sectionPath,
    result.content.slice(0, 500),
  ].filter(Boolean).join(" "));
  return target.sectionNeedles.some((needle) =>
    haystack.includes(normalizeForComparison(needle)));
}

export function isExpectedRagResult(testCase: RagEvaluationCase, result: RagSearchResult) {
  if (!testCase.answerable) return false;
  return testCase.expectedTargets.some((target) => targetMatches(result, target));
}

export function evaluateRagCase(
  testCase: RagEvaluationCase,
  results: RagSearchResult[],
): RagEvaluationCaseResult {
  const evaluated = results.map((result, index): RagEvaluationResultItem => ({
    rank: index + 1,
    correct: isExpectedRagResult(testCase, result),
    similarity: result.similarity,
    moduleSlug: result.moduleSlug,
    moduleNumber: result.moduleNumber,
    moduleTitle: result.moduleTitle,
    sourceKind: result.sourceKind,
    sectionTitle: result.sectionTitle,
    subsectionTitle: result.subsectionTitle,
    pages: [result.pageStart, result.pageEnd],
    chunkIndex: result.chunkIndex,
    wordCount: result.wordCount,
    sourceFile: result.sourceFile,
    contentSha256: result.contentSha256,
    preview: result.content.replace(/\s+/g, " ").slice(0, 280),
  }));
  const correct = evaluated.find((result) => result.correct) ?? null;
  const correctRank = correct?.rank ?? null;
  const top1Similarity = evaluated[0]?.similarity ?? null;
  const top1Top2Gap = evaluated.length >= 2
    ? evaluated[0].similarity - evaluated[1].similarity
    : null;

  return {
    id: testCase.id,
    kind: testCase.kind,
    question: testCase.question,
    answerable: testCase.answerable,
    expectedLabel: testCase.expectedLabel,
    correctRank,
    top1: correctRank === 1,
    top3: correctRank !== null && correctRank <= 3,
    top5: correctRank !== null && correctRank <= 5,
    firstCorrectSimilarity: correct?.similarity ?? null,
    top1Similarity,
    top1Top2Gap,
    results: evaluated,
  };
}

function round(value: number) {
  return Number(value.toFixed(6));
}

function ratio(count: number, total: number) {
  return total === 0 ? 0 : round(count / total);
}

export function summarizeDistribution(values: number[]) {
  if (values.length === 0) {
    return { count: 0, minimum: null, p25: null, median: null, mean: null, p75: null, maximum: null };
  }
  const sorted = [...values].sort((left, right) => left - right);
  const percentile = (fraction: number) => {
    const index = (sorted.length - 1) * fraction;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    if (lower === upper) return sorted[lower];
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
  };
  return {
    count: sorted.length,
    minimum: round(sorted[0]),
    p25: round(percentile(0.25)),
    median: round(percentile(0.5)),
    mean: round(sorted.reduce((sum, value) => sum + value, 0) / sorted.length),
    p75: round(percentile(0.75)),
    maximum: round(sorted.at(-1)!),
  };
}

export function summarizeRagEvaluation(results: RagEvaluationCaseResult[]) {
  const answerable = results.filter((result) => result.answerable);
  const unanswerable = results.filter((result) => !result.answerable);
  const firstCorrectSimilarities = answerable
    .map((result) => result.firstCorrectSimilarity)
    .filter((value): value is number => value !== null);
  const answerableTop1Similarities = answerable
    .map((result) => result.top1Similarity)
    .filter((value): value is number => value !== null);
  const unanswerableTop1Similarities = unanswerable
    .map((result) => result.top1Similarity)
    .filter((value): value is number => value !== null);

  const thresholdCandidates = Array.from({ length: 15 }, (_, index) => 0.45 + index * 0.025)
    .map((threshold) => ({
      threshold: round(threshold),
      answerableFirstCorrectRetained: ratio(
        firstCorrectSimilarities.filter((value) => value >= threshold).length,
        answerable.length,
      ),
      answerableCorrectTop1Retained: ratio(
        answerable.filter((result) =>
          result.top1 && (result.top1Similarity ?? -1) >= threshold).length,
        answerable.length,
      ),
      unanswerableAboveThreshold: ratio(
        unanswerableTop1Similarities.filter((value) => value >= threshold).length,
        unanswerable.length,
      ),
      unanswerableRejected: ratio(
        unanswerableTop1Similarities.filter((value) => value < threshold).length,
        unanswerable.length,
      ),
    }));

  const allReturned = results.flatMap((result) => result.results.map((item) => ({
    ...item,
    queryId: result.id,
  })));
  const smallReturned = allReturned.filter((result) => result.wordCount < 80);
  const smallTop1 = smallReturned.filter((result) => result.rank === 1);
  const smallIncorrectTop1 = smallTop1.filter((result) => !result.correct);

  return {
    totalQueries: results.length,
    answerableQueries: answerable.length,
    unanswerableQueries: unanswerable.length,
    top1Accuracy: ratio(answerable.filter((result) => result.top1).length, answerable.length),
    top3Recall: ratio(answerable.filter((result) => result.top3).length, answerable.length),
    top5Recall: ratio(answerable.filter((result) => result.top5).length, answerable.length),
    missingFromTop8: answerable.filter((result) => result.correctRank === null).map((result) => result.id),
    failedTop5: answerable.filter((result) => !result.top5).map((result) => result.id),
    similarityDistributions: {
      firstCorrect: summarizeDistribution(firstCorrectSimilarities),
      answerableTop1: summarizeDistribution(answerableTop1Similarities),
      unanswerableTop1: summarizeDistribution(unanswerableTop1Similarities),
    },
    top1Top2Gap: summarizeDistribution(
      results.map((result) => result.top1Top2Gap).filter((value): value is number => value !== null),
    ),
    thresholdCandidates,
    smallChunkAnalysis: {
      definition: "wordCount < 80",
      returnedInTop8: smallReturned.length,
      distinctQueries: new Set(smallReturned.map((result) => result.queryId)).size,
      top1Occurrences: smallTop1.length,
      incorrectTop1Occurrences: smallIncorrectTop1.length,
      correctOccurrences: smallReturned.filter((result) => result.correct).length,
      averageSimilarity: smallReturned.length === 0
        ? null
        : round(smallReturned.reduce((sum, result) => sum + result.similarity, 0) / smallReturned.length),
    },
  };
}
