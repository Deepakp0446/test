import { useEffect, useMemo, useState } from "react";
import { Upload, Plus, Sparkles, ChevronRight, Database, ShieldCheck, Loader2 } from "lucide-react";
import { api } from "./api";

type Role = "CEO" | "CFO" | "CMO" | "COO" | "CSO" | "CHAIR";
type Message = { _id?: string; role: Role; content: string; phase: string; createdAt?: string };
type Session = { _id: string; title: string; companyName: string; messages: Message[]; boardData: any[] };

const personaMeta: Record<string, { title: string; initials: string; description: string }> = {
  CFO: { title: "CFO", initials: "CF", description: "P&L · Cash · Risk" },
  CMO: { title: "CMO", initials: "CM", description: "Demand · Brand · Share" },
  COO: { title: "COO", initials: "CO", description: "Execution · Efficiency" },
  CSO: { title: "CSO", initials: "CS", description: "Strategy · Competition" }
};

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/10 bg-white/[.045] backdrop-blur ${className}`}>{children}</div>;
}

function MessageCard({ message }: { message: Message }) {
  const meta = personaMeta[message.role];
  if (message.role === "CEO") {
    return (
      <div className="ml-auto max-w-3xl rounded-2xl rounded-br-md border border-blue-400/20 bg-blue-500/10 p-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-300">CEO</div>
        <div className="whitespace-pre-wrap text-sm leading-6 text-slate-100">{message.content}</div>
      </div>
    );
  }

  if (message.phase === "debate" || message.phase === "synthesis") {
    return (
      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-300">
          <Sparkles size={15} /> {message.phase === "debate" ? "Board Debate" : "Chair Decision Memo"}
        </div>
        <div className="whitespace-pre-wrap text-sm leading-6 text-slate-200">{message.content}</div>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-xs font-bold">{meta?.initials}</div>
        <div>
          <div className="font-semibold">{meta?.title || message.role}</div>
          <div className="text-xs text-slate-500">{meta?.description}</div>
        </div>
      </div>
      <div className="whitespace-pre-wrap text-sm leading-6 text-slate-300">{message.content}</div>
    </Card>
  );
}

export default function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState("");

  const boardMessages = useMemo(() => session?.messages || [], [session]);

  async function refreshSessions() {
    const data = await api.sessions();
    setSessions(data);
    return data;
  }

  async function create() {
    setError("");
    const s = await api.createSession();
    setSession(s);
    await refreshSessions();
  }

  async function open(id: string) {
    setError("");
    setSession(await api.session(id));
  }

  useEffect(() => {
    (async () => {
      try {
        const list = await refreshSessions();
        if (list.length) setSession(await api.session(list[0]._id));
        else {
          const s = await api.createSession();
          setSession(s);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  async function ask() {
    if (!session || !question.trim() || loading) return;
    setLoading(true);
    setError("");
    const q = question.trim();
    setQuestion("");

    try {
      const result = await api.ask(session._id, q);
      const updated = await api.session(session._id);
      setSession(updated);
      await refreshSessions();
      // result is intentionally not rendered separately; the transcript is the source of truth.
      void result;
    } catch (e: any) {
      setError(e.message);
      setQuestion(q);
    } finally {
      setLoading(false);
    }
  }

  async function loadDemo() {
    if (!session) return;
    try {
      const updated = await api.demoData(session._id);
      setSession(updated);
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!session || !e.target.files?.[0]) return;
    try {
      const updated = await api.upload(session._id, e.target.files[0]);
      setSession(updated);
    } catch (e: any) {
      setError(e.message);
    } finally {
      e.target.value = "";
    }
  }

  if (booting) return <div className="grid min-h-screen place-items-center text-slate-400">Loading Boardroom…</div>;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07101f]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 shadow-lg shadow-blue-900/30">
              <Sparkles size={19} />
            </div>
            <div>
              <div className="font-bold tracking-tight">Boardroom AI</div>
              <div className="text-xs text-slate-500">Virtual Executive Leadership Team</div>
            </div>
          </div>
          <div className="hidden items-center gap-5 text-xs text-slate-500 md:flex">
            <span className="flex items-center gap-1"><ShieldCheck size={14}/> Grounded board</span>
            <span className="flex items-center gap-1"><Database size={14}/> Persistent sessions</span>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1500px] grid-cols-1 gap-5 p-5 lg:grid-cols-[250px_1fr_300px]">
        <aside className="space-y-4">
          <button onClick={create} className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950 hover:bg-slate-200">
            <Plus size={17}/> New board session
          </button>

          <Card className="overflow-hidden">
            <div className="border-b border-white/10 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Sessions</div>
            <div className="max-h-[60vh] overflow-auto p-2">
              {sessions.map(s => (
                <button key={s._id} onClick={() => open(s._id)} className={`mb-1 flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm ${session?._id === s._id ? "bg-white/10" : "hover:bg-white/5"}`}>
                  <span className="truncate">{s.title || "Untitled"}</span>
                  <ChevronRight size={14} className="shrink-0 text-slate-600"/>
                </button>
              ))}
            </div>
          </Card>
        </aside>

        <section className="min-w-0">
          <div className="mb-5">
            <div className="text-xs font-semibold uppercase tracking-[.18em] text-blue-300">CEO Workspace</div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">{session?.companyName || "Your Company"} Boardroom</h1>
            <p className="mt-1 text-sm text-slate-500">Ask a business question. The board analyzes, challenges, and synthesizes a decision.</p>
          </div>

          {error && <div className="mb-4 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

          <div className="space-y-4">
            {boardMessages.length === 0 && (
              <Card className="p-8 text-center">
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-white/10"><Sparkles size={22}/></div>
                <h2 className="text-lg font-semibold">Bring a real business question</h2>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                  Example: “Our Q3 gross margin dropped four points while revenue grew 21%. Should we cut marketing spend or invest to regain growth?”
                </p>
              </Card>
            )}
            {boardMessages.map((m, i) => <MessageCard key={m._id || i} message={m} />)}
          </div>

          <div className="sticky bottom-4 mt-5">
            <Card className="p-3 shadow-2xl shadow-black/30">
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); } }}
                placeholder="Ask the board a business question…"
                className="min-h-24 w-full resize-none bg-transparent p-2 text-sm outline-none placeholder:text-slate-600"
              />
              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <div className="text-xs text-slate-600">Enter to send · Shift+Enter for new line</div>
                <button disabled={loading || !question.trim()} onClick={ask} className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">
                  {loading ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16}/>}
                  {loading ? "Board is debating…" : "Ask board"}
                </button>
              </div>
            </Card>
          </div>
        </section>

        <aside className="space-y-4">
          <Card className="p-4">
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Executive board</div>
            <div className="space-y-2">
              {Object.entries(personaMeta).map(([key, p]) => (
                <div key={key} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[.025] p-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-xs font-bold">{p.initials}</div>
                  <div><div className="text-sm font-semibold">{p.title}</div><div className="text-xs text-slate-500">{p.description}</div></div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Database size={16}/> Grounding data</div>
            <div className="text-xs leading-5 text-slate-500">
              Upload a CSV/JSON containing P&L, KPI or market data. The board receives this data as its factual context.
            </div>
            <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 px-3 py-3 text-sm hover:bg-white/5">
              <Upload size={16}/> Upload CSV / JSON
              <input className="hidden" type="file" accept=".csv,.json" onChange={upload}/>
            </label>
            <button onClick={loadDemo} className="mt-2 w-full rounded-xl bg-white/5 px-3 py-3 text-sm hover:bg-white/10">
              Load demo company data
            </button>
            <div className="mt-3 text-xs text-slate-600">{session?.boardData?.length || 0} data source(s) attached</div>
          </Card>

          <Card className="p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Product judgment</div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              The board intentionally separates analysis, debate and synthesis. This makes disagreement visible instead of hiding it inside one generic answer.
            </p>
          </Card>
        </aside>
      </main>
    </div>
  );
}
