import { NextResponse } from "next/server";
import { suiteSummary, suites } from "../../../../lib/suites";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const suite = suites.get(params.id);
  return suite ? NextResponse.json(suiteSummary(suite)) : NextResponse.json({ error: "Suite not found" }, { status: 404 });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!suites.has(params.id)) return NextResponse.json({ error: "Suite not found" }, { status: 404 });
  suites.delete(params.id);
  return new NextResponse(null, { status: 204 });
}