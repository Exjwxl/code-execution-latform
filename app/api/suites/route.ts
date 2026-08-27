import { NextResponse } from "next/server";
import { suiteSummary, suites } from "../../../lib/suites";

export async function GET() { return NextResponse.json({ suites: Array.from(suites.values()).map(suiteSummary) }); }

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.name !== "string" || body.name.trim().length < 2 || body.name.length > 80) return NextResponse.json({ error: "A suite name between 2 and 80 characters is required" }, { status: 400 });
  const now = new Date().toISOString();
  const suite = { id: `suite-${crypto.randomUUID().slice(0, 8)}`, name: body.name.trim(), cases: [], createdAt: now, updatedAt: now };
  suites.set(suite.id, suite);
  return NextResponse.json(suiteSummary(suite), { status: 201 });
}
