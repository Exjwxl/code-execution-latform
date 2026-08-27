import { NextResponse } from "next/server";
import { getQueueMetrics } from "../../../lib/queue";

export async function GET() {
  const queue = await getQueueMetrics();
  return NextResponse.json({ queue, workers: [{ id: "worker-01", status: "busy", job: "sub_8fa21c1d", runtime: "Python 3.12" }, { id: "worker-02", status: "idle", job: null, runtime: "Node 20" }, { id: "worker-03", status: "idle", job: null, runtime: "GCC 13.2" }, { id: "worker-04", status: "idle", job: null, runtime: "OpenJDK 21" }], sandboxes: { active: 1, total: 4, network: "blocked", imagePolicy: "allowlisted" } });
}
