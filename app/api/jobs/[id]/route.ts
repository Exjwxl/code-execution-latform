import { NextResponse } from "next/server";
import { submissions } from "../../../../lib/platform";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const submission = submissions.get(params.id);
  return submission ? NextResponse.json(submission) : NextResponse.json({ error: "Submission not found" }, { status: 404 });
}
