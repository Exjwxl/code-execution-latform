import { NextResponse } from "next/server";
import { createSubmission, runDevelopmentJob, type Language, type TestCase } from "../../../lib/platform";
import { enqueueSubmission } from "../../../lib/queue";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const languages: Language[] = ["Python", "JavaScript", "C++", "Java"];
  if (!body || !languages.includes(body.language) || typeof body.source !== "string" || body.source.length === 0 || body.source.length > 100_000 || !Array.isArray(body.tests) || body.tests.length > 100) {
    return NextResponse.json({ error: "language, source, and up to 100 test cases are required" }, { status: 400 });
  }
  if (body.tests.some((test: unknown) => !test || typeof test !== "object" || typeof (test as TestCase).input !== "string" || typeof (test as TestCase).expected !== "string")) {
    return NextResponse.json({ error: "Each test case needs string input and expected values" }, { status: 400 });
  }
  const submission = createSubmission({
    language: body.language as Language,
    source: String(body.source ?? ""),
    tests: (body.tests ?? []) as TestCase[]
  });
  const queue = await enqueueSubmission(submission);
  runDevelopmentJob(submission);

  return NextResponse.json(
    {
      id: submission.id,
      status: submission.status,
      queue: "code-execution",
      enqueuedAt: submission.createdAt,
      adapter: queue.adapter,
      payload: {
        language: submission.language,
        sourceLength: submission.source.length,
        testCount: submission.tests.length
      }
    },
    { status: 202 }
  );
}
