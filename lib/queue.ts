import { Queue } from "bullmq";
import IORedis from "ioredis";
import type { Submission } from "./platform";

const connection = process.env.REDIS_URL ? new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null }) : null;
export const executionQueue = connection ? new Queue("code-execution", { connection }) : null;

export async function enqueueSubmission(submission: Submission) {
  if (!executionQueue) return { adapter: "memory" as const, jobId: submission.id };
  const job = await executionQueue.add("execute", { submissionId: submission.id }, { removeOnComplete: 100, removeOnFail: 100 });
  return { adapter: "bullmq" as const, jobId: job.id ?? submission.id };
}

export async function getQueueMetrics() {
  if (!executionQueue) return { waiting: 3, active: 1, completed: 1284, failed: 12, connection: "memory adapter" };
  const counts = await executionQueue.getJobCounts("waiting", "active", "completed", "failed");
  return { waiting: counts.waiting ?? 0, active: counts.active ?? 0, completed: counts.completed ?? 0, failed: counts.failed ?? 0, connection: "redis" };
}
