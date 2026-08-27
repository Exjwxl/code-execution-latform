export type Language = "Python" | "JavaScript" | "C++" | "Java";
export type JobStatus = "queued" | "running" | "passed" | "failed" | "timeout";

export type TestCase = { input: string; expected: string };
export type Submission = {
  id: string;
  language: Language;
  source: string;
  tests: TestCase[];
  status: JobStatus;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  result?: string;
  error?: string;
};

const globalStore = globalThis as typeof globalThis & { forgeStore?: Map<string, Submission> };
export const submissions = globalStore.forgeStore ?? new Map<string, Submission>();
globalStore.forgeStore = submissions;

export const queueStats = { waiting: 3, active: 1, completed: 1284, failed: 12 };

export function createSubmission(input: { language: Language; source: string; tests: TestCase[] }) {
  const submission: Submission = {
    id: `sub_${crypto.randomUUID().slice(0, 8)}`,
    language: input.language,
    source: input.source,
    tests: input.tests,
    status: "queued",
    createdAt: new Date().toISOString()
  };
  submissions.set(submission.id, submission);
  return submission;
}

export function runDevelopmentJob(submission: Submission) {
  setTimeout(() => {
    const current = submissions.get(submission.id);
    if (!current || current.status !== "queued") return;
    current.status = "running";
    current.startedAt = new Date().toISOString();
    submissions.set(current.id, current);
  }, 400);
  setTimeout(() => {
    const current = submissions.get(submission.id);
    if (!current || current.status !== "running") return;
    current.status = "passed";
    current.finishedAt = new Date().toISOString();
    current.durationMs = 842;
    current.result = `All ${current.tests.length} test cases passed.`;
    submissions.set(current.id, current);
  }, 1500);
}
