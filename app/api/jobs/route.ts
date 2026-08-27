import { NextResponse } from "next/server";
import { submissions } from "../../../lib/platform";

export async function GET() {
  return NextResponse.json({ jobs: Array.from(submissions.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), source: process.env.REDIS_URL ? "redis" : "memory" });
}
