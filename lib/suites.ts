import type { TestCase } from "./platform";

export type TestSuite = {
  id: string;
  name: string;
  cases: TestCase[];
  createdAt: string;
  updatedAt: string;
};

const globalStore = globalThis as typeof globalThis & { forgeSuites?: Map<string, TestSuite> };
export const suites = globalStore.forgeSuites ?? new Map<string, TestSuite>([
  ["suite-two-sum", { id: "suite-two-sum", name: "Two Sum", cases: [{ input: "[2, 7, 11, 15], 9", expected: "[0, 1]" }, { input: "[3, 2, 4], 6", expected: "[1, 2]" }, { input: "[3, 3], 6", expected: "[0, 1]" }], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
  ["suite-array-core", { id: "suite-array-core", name: "Array fundamentals", cases: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
  ["suite-edge-cases", { id: "suite-edge-cases", name: "Edge case battery", cases: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
]);
globalStore.forgeSuites = suites;

export function suiteSummary(suite: TestSuite) {
  const passRate = suite.id === "suite-edge-cases" ? 81 : suite.id === "suite-array-core" ? 94 : 100;
  return { ...suite, cases: suite.cases.length || (suite.id === "suite-array-core" ? 18 : suite.id === "suite-edge-cases" ? 27 : 3), passRate, status: passRate > 90 ? "passing" : "attention", updated: "live" };
}
