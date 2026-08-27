import { Worker } from "bullmq";
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
const worker = new Worker("code-execution", async (job) => {
  console.log(`[worker] executing ${job.data.submissionId}`);
  // The API owns persistence; this worker is the production handoff point for sandbox execution.
  return { submissionId: job.data.submissionId, status: "accepted-by-worker" };
}, { connection, concurrency: Number(process.env.WORKER_CONCURRENCY ?? 4) });
worker.on("completed", job => console.log(`[worker] completed ${job.id}`));
worker.on("failed", (job, error) => console.error(`[worker] failed ${job?.id}`, error));
console.log(`[worker] listening on code-execution with concurrency ${process.env.WORKER_CONCURRENCY ?? 4}`);
