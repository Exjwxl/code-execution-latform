"use client";

import { useEffect, useState } from "react";
import { Activity, ChevronDown, Clock3, Code2, Cpu, Database, ExternalLink, FileCode2, FlaskConical, GitBranch, Layers3, Play, Plus, RotateCcw, Server, ShieldCheck, TerminalSquare, TimerReset, UploadCloud, Zap } from "lucide-react";

type Language = "Python" | "JavaScript" | "C++" | "Java";
type View = "playground" | "jobs" | "suites" | "workers" | "queue" | "sandboxes";
type Status = "idle" | "queued" | "running" | "passed" | "failed";
type Job = { id: string; language: Language; status: string; createdAt: string; durationMs?: number };

const codeByLanguage: Record<Language, string> = {
  Python: `def two_sum(numbers, target):
    seen = {}
    for index, number in enumerate(numbers):
        complement = target - number
        if complement in seen:
            return [seen[complement], index]
        seen[number] = index
    return []`,
  JavaScript: `function twoSum(numbers, target) {
  const seen = new Map();
  for (let index = 0; index < numbers.length; index++) {
    const complement = target - numbers[index];
    if (seen.has(complement)) return [seen.get(complement), index];
    seen.set(numbers[index], index);
  }
  return [];
}`,
  "C++": `vector<int> twoSum(vector<int>& numbers, int target) {
    unordered_map<int, int> seen;
    for (int index = 0; index < numbers.size(); index++) {
        int complement = target - numbers[index];
        if (seen.count(complement)) return {seen[complement], index};
        seen[numbers[index]] = index;
    }
    return {};
}`,
  Java: `public int[] twoSum(int[] numbers, int target) {
    Map<Integer, Integer> seen = new HashMap<>();
    for (int index = 0; index < numbers.length; index++) {
        int complement = target - numbers[index];
        if (seen.containsKey(complement))
            return new int[] { seen.get(complement), index };
        seen.put(numbers[index], index);
    }
    return new int[] {};
}`
};
const tests = [{ input: "[2, 7, 11, 15], 9", expected: "[0, 1]" }, { input: "[3, 2, 4], 6", expected: "[1, 2]" }, { input: "[3, 3], 6", expected: "[0, 1]" }];
const navItems: [View, string, typeof Code2][] = [["playground", "Playground", Code2], ["jobs", "Job monitor", Activity], ["suites", "Test suites", FlaskConical], ["workers", "Workers", Server], ["queue", "Redis queue", Database], ["sandboxes", "Sandboxes", ShieldCheck]];

export default function Home() {
  const [view, setView] = useState<View>("playground");
  const [language, setLanguage] = useState<Language>("Python");
  const [source, setSource] = useState(codeByLanguage.Python);
  const [status, setStatus] = useState<Status>("idle");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [runId, setRunId] = useState("local");
  const [activeTab, setActiveTab] = useState<"tests" | "output">("tests");
  const [runError, setRunError] = useState("");
  const [infra, setInfra] = useState<any>(null);
  const [suites, setSuites] = useState<any[]>([]);

  const refresh = async () => {
    const [jobsResponse, infraResponse, suitesResponse] = await Promise.all([fetch("/api/jobs"), fetch("/api/infrastructure"), fetch("/api/suites")]);
    setJobs((await jobsResponse.json()).jobs); setInfra(await infraResponse.json()); setSuites((await suitesResponse.json()).suites);
  };
  useEffect(() => { refresh(); const timer = window.setInterval(refresh, 1000); return () => window.clearInterval(timer); }, []);
  const selectLanguage = (next: Language) => { setLanguage(next); setSource(codeByLanguage[next]); setStatus("idle"); };
  const runCode = async () => {
    setStatus("queued"); setRunError("");
    try {
      const response = await fetch("/api/submissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ language, source, tests }) });
      const submission = await response.json();
      if (!response.ok) throw new Error(submission.error ?? "Submission rejected");
      setRunId(submission.id);
      let currentStatus = submission.status;
      let currentError = "";
      for (let attempt = 0; attempt < 20 && (currentStatus === "queued" || currentStatus === "running"); attempt++) {
        await new Promise(resolve => window.setTimeout(resolve, 250));
        const jobResponse = await fetch(`/api/jobs/${submission.id}`, { cache: "no-store" });
        const job = await jobResponse.json(); currentStatus = job.status; currentError = job.error ?? "";
      }
      setRunError(currentError);
      setStatus(currentStatus === "passed" ? "passed" : "failed");
      await refresh();
    } catch (error) { setStatus("failed"); setRunError(error instanceof Error ? error.message : "Unable to submit job"); }
  };
  return <main className="app-shell"><header className="topbar"><div className="brand-lockup"><div className="brand-mark"><TerminalSquare size={19} /></div><span className="brand-name">forge<span>/</span>runner</span><span className="env-pill">DEV ENVIRONMENT</span></div><div className="topbar-actions"><div className="system-state"><span className="pulse-dot" /> All systems operational</div><button className="icon-button" aria-label="Documentation"><ExternalLink size={16} /></button><div className="avatar">JD</div></div></header><div className="workspace"><aside className="sidebar"><div className="sidebar-section"><div className="section-label">Workspace</div>{navItems.slice(0, 3).map(([key, label, Icon]) => <button key={key} className={`nav-item ${view === key ? "active" : ""}`} onClick={() => setView(key)}><Icon size={16} /> {label}{key === "jobs" && <span className="count-badge">{jobs.length}</span>}</button>)}</div><div className="sidebar-section"><div className="section-label">Infrastructure</div>{navItems.slice(3).map(([key, label, Icon]) => <button key={key} className={`nav-item ${view === key ? "active" : ""}`} onClick={() => setView(key)}><Icon size={16} /> {label}{key === "workers" && <span className="status-text">4 online</span>}</button>)}</div><div className="sidebar-bottom"><div className="quota-label"><span>Monthly compute</span><span>68%</span></div><div className="quota-track"><div /></div><div className="quota-sub">6h 24m remaining</div><button className="upgrade-button">Upgrade capacity <Zap size={14} /></button></div></aside><section className="main-content"><div className="page-heading"><div><div className="breadcrumb"><span>Workspace</span><span>/</span><strong>{view[0].toUpperCase() + view.slice(1)}</strong></div><h1>{view === "playground" ? "Run code in a sandbox" : view === "jobs" ? "Job monitor" : view === "suites" ? "Test suites" : view === "workers" ? "Worker fleet" : view === "queue" ? "Redis queue" : "Sandbox control plane"}</h1><p>{view === "playground" ? "Submit isolated workloads and inspect every stage of execution." : "Observe the execution platform in real time."}</p></div>{view === "playground" && <button className="secondary-button"><UploadCloud size={15} /> Import snippet</button>}</div>{view === "playground" ? <Playground language={language} source={source} setSource={setSource} selectLanguage={selectLanguage} status={status} runCode={runCode} activeTab={activeTab} setActiveTab={setActiveTab} runId={runId} /> : <OperationsView view={view} jobs={jobs} infra={infra} suites={suites} refresh={refresh} />}</section></div></main>;
}

function Playground({ language, source, setSource, selectLanguage, status, runCode, activeTab, setActiveTab, runId }: { language: Language; source: string; setSource: (value: string) => void; selectLanguage: (value: Language) => void; status: Status; runCode: () => void; activeTab: "tests" | "output"; setActiveTab: (value: "tests" | "output") => void; runId: string }) {
  const runtime = language === "C++" ? "GCC 13.2" : language === "Java" ? "OpenJDK 21" : language === "JavaScript" ? "Node 20" : "Python 3.12";
  return <><div className="metrics-row"><div className="metric"><span className="metric-icon cyan"><Layers3 size={16} /></span><div><span className="metric-label">Queue depth</span><strong>03 <small>jobs</small></strong></div><span className="metric-trend up">↓ 12%</span></div><div className="metric"><span className="metric-icon lime"><TimerReset size={16} /></span><div><span className="metric-label">Avg. runtime</span><strong>842 <small>ms</small></strong></div><span className="metric-trend up">↓ 8%</span></div><div className="metric"><span className="metric-icon amber"><Cpu size={16} /></span><div><span className="metric-label">Worker utilization</span><strong>41 <small>%</small></strong></div><span className="metric-trend neutral">4 / 4 online</span></div></div><div className="workspace-grid"><section className="editor-panel panel"><div className="panel-header editor-header"><div className="file-tab"><FileCode2 size={15} /> solution.{language === "Python" ? "py" : language === "JavaScript" ? "js" : language === "C++" ? "cpp" : "java"}</div><button className="reset-button" onClick={() => setSource(codeByLanguage[language])}><RotateCcw size={15} /></button></div><div className="language-tabs">{(Object.keys(codeByLanguage) as Language[]).map(item => <button key={item} className={language === item ? "selected" : ""} onClick={() => selectLanguage(item)}>{item}</button>)}</div><div className="editor-wrap"><div className="line-numbers">{source.split("\n").map((_, index) => <span key={index}>{String(index + 1).padStart(2, "0")}</span>)}</div><textarea value={source} onChange={event => setSource(event.target.value)} spellCheck={false} aria-label="Source code" /></div><div className="editor-footer"><span><GitBranch size={13} /> main</span><span>UTF-8</span><span>{source.length} chars</span></div></section><section className="right-column"><div className="panel run-panel"><div className="panel-header"><div className="panel-title"><span className="eyebrow">Execution profile</span><strong>Standard sandbox</strong></div></div><div className="profile-grid"><div><span>Runtime</span><strong>{runtime}</strong></div><div><span>Memory limit</span><strong>256 MB</strong></div><div><span>Time limit</span><strong>2.0 sec</strong></div><div><span>Network</span><strong className="blocked"><ShieldCheck size={13} /> blocked</strong></div></div><button className={`run-button ${status}`} onClick={runCode} disabled={status === "queued" || status === "running"}><Play size={16} fill="currentColor" /> {status === "queued" ? "Enqueuing job..." : status === "running" ? "Executing..." : status === "passed" ? "Run again" : "Run test suite"}</button></div><div className="panel test-panel"><div className="panel-header tabs-header"><div className="panel-tabs"><button className={activeTab === "tests" ? "active" : ""} onClick={() => setActiveTab("tests")}>Test cases <span>3</span></button><button className={activeTab === "output" ? "active" : ""} onClick={() => setActiveTab("output")}>Output</button></div><button className="add-button"><Plus size={14} /> Add case</button></div>{activeTab === "tests" ? <div>{tests.map((test, index) => <div className="test-case" key={test.input}><div className={`case-status ${status === "passed" ? "pass" : ""}`}>{status === "passed" ? "✓" : index + 1}</div><div className="case-data"><span>Input</span><code>{test.input}</code></div><div className="case-data expected"><span>Expected</span><code>{test.expected}</code></div><ChevronDown size={15} /></div>)}</div> : <div className="output-view"><span className="output-prompt">$ forge run --id {runId}</span><p>{status === "passed" ? "All 3 test cases passed in 842ms." : "Run the suite to stream sandbox output here."}</p></div>}</div></section></div><div className="execution-strip"><div className="strip-heading"><span className={`live-indicator ${status}`} /><strong>Execution pipeline</strong><span className="run-id">{runId}</span></div><div className="pipeline">{["API accepted", "Queue", "Worker", "Sandbox", "Result"].map((step, index) => <div className={`pipeline-step ${status === "passed" || index < (status === "running" ? 4 : status === "queued" ? 2 : 1) ? "done" : ""}`} key={step}><span className="step-number">{status === "passed" || index < (status === "running" ? 4 : status === "queued" ? 2 : 1) ? "✓" : String(index + 1)}</span><span>{step}</span>{index < 4 && <i />}</div>)}</div><span className="last-run"><Clock3 size={13} /> {status === "idle" ? "No runs yet" : status === "passed" ? "Passed" : status === "running" ? "Executing" : "Queued"}</span></div></>;
}

function OperationsView({ view, jobs, infra, suites, refresh }: { view: View; jobs: Job[]; infra: any; suites: any[]; refresh: () => void }) {
  if (view === "suites") return <div className="operations-grid">{suites.map(suite => <div className="operation-card" key={suite.id}><div className="card-icon cyan"><FlaskConical size={17} /></div><div className="card-main"><strong>{suite.name}</strong><span>{suite.cases} test cases · updated {suite.updated}</span></div><span className={suite.status === "passing" ? "state-good" : "state-warn"}>{suite.passRate}% passing</span></div>)}<button className="empty-action"><Plus size={16} /> Create test suite</button></div>;
  if (view === "jobs") return <div className="operations-table"><div className="table-head"><span>Job ID</span><span>Language</span><span>Status</span><span>Created</span><span>Duration</span></div>{jobs.length === 0 ? <div className="empty-state">No submissions yet. Run a test suite from Playground.</div> : jobs.map(job => <div className="table-row" key={job.id}><code>{job.id}</code><span>{job.language}</span><span className={`job-state ${job.status}`}>{job.status}</span><span>{new Date(job.createdAt).toLocaleTimeString()}</span><span>{job.durationMs ? `${job.durationMs} ms` : "--"}</span></div>)}</div>;
  if (!infra) return <div className="empty-state">Loading platform telemetry...</div>;
  if (view === "workers") return <div className="operations-grid">{infra.workers.map((worker: any) => <div className="operation-card" key={worker.id}><div className={`card-icon ${worker.status === "busy" ? "amber" : "lime"}`}><Server size={17} /></div><div className="card-main"><strong>{worker.id}</strong><span>{worker.runtime} · {worker.job ?? "available for work"}</span></div><span className={worker.status === "busy" ? "state-warn" : "state-good"}>{worker.status}</span></div>)}</div>;
  if (view === "queue") return <div className="queue-board"><div className="queue-connection"><Database size={18} /><div><strong>code-execution</strong><span>Connected via {infra.queue.connection}</span></div><span className="state-good">healthy</span></div><div className="queue-stats">{[["Waiting", infra.queue.waiting], ["Active", infra.queue.active], ["Completed", infra.queue.completed], ["Failed", infra.queue.failed]].map(([label, value]) => <div key={label as string}><span>{label}</span><strong>{value}</strong></div>)}</div><button className="secondary-button" onClick={refresh}><RotateCcw size={15} /> Refresh queue</button></div>;
  return <div className="sandbox-board"><div className="sandbox-hero"><ShieldCheck size={27} /><div><strong>Isolation policy active</strong><span>Every job runs with no network, read-only filesystem, 256 MB memory, 1 CPU, and 64 process limit.</span></div></div><div className="queue-stats"><div><span>Active sandboxes</span><strong>{infra.sandboxes.active} / {infra.sandboxes.total}</strong></div><div><span>Network access</span><strong>{infra.sandboxes.network}</strong></div><div><span>Images</span><strong>{infra.sandboxes.imagePolicy}</strong></div></div></div>;
}
