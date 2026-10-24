"use client";
import { useEffect, useState } from "react";

export default function VconDashboard() {
  const [role, setRole] = useState<"JUDGE_DEMO" | "CREATOR" | "REVIEWER" | "APPROVER">("JUDGE_DEMO");
  const [brandKits, setBrandKits] = useState<any[]>([]);
  const [samplePosts, setSamplePosts] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [evalSummary, setEvalSummary] = useState<any>(null);

  const [selectedBrand, setSelectedBrand] = useState("fintech-pro");
  const [channel, setChannel] = useState("Instagram / LinkedIn");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchState = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/state");
      const data = await res.json();
      setBrandKits(data.brand_kits || []);
      setSamplePosts(data.sample_posts || []);
      setSubmissions(data.submissions || []);
      setEvalSummary(data.eval_summary || null);
    } catch (e) {
      console.error("Backend unreachable", e);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    await fetch("http://localhost:8000/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand_id: selectedBrand,
        creator: role,
        channel,
        content,
      }),
    });
    setContent("");
    await fetchState();
    setLoading(false);
  };

  const handleDecision = async (id: string, status: string) => {
    let note = `Status set to ${status} by ${role}`;
    if (status === "OVERRIDDEN") {
      const reason = window.prompt("Enter mandatory legal override justification:", "Campaign pre-cleared by Legal Counsel (#LC-402)");
      if (!reason) return;
      note = `OVERRIDE REASON: ${reason}`;
    }
    await fetch(`http://localhost:8000/api/submissions/${id}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reviewer_note: note }),
    });
    await fetchState();
  };

  const copyCertificate = (sub: any) => {
    const text = `[vcon COMPLIANCE CERTIFICATE #${sub.id}]\nStatus: ${sub.status} | Score: ${sub.compliance_score}/100\nApproved Copy: "${sub.content}"\nAudit Note: ${sub.reviewer_note}`;
    navigator.clipboard.writeText(text);
    setCopiedId(sub.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeBrand = brandKits.find((b) => b.id === selectedBrand);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Top 1-Line Judge Guide Banner */}
      <div className="bg-indigo-950/80 border-b border-indigo-800/60 px-6 py-2.5 text-xs text-indigo-200 flex flex-wrap justify-between items-center gap-2">
        <span>
          <b>👋 Judge Quick-Start Guide:</b> 1) Click a <b>Demo Preset</b> on the left → 2) Click <b>Run Compliance Scan</b> → 3) Try <b>Load Auto-Fixed Copy</b> or <b>Override Flag</b> on the right.
        </span>
        {evalSummary && (
          <span className="font-mono bg-indigo-900/60 px-2.5 py-1 rounded border border-indigo-700/50 text-emerald-300">
            Eval Benchmark: {evalSummary.detection_rate} | False Flags: {evalSummary.false_positive_rate}
          </span>
        )}
      </div>

      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        {/* Header & 4-Role Switcher */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-white">vcon</h1>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Hybrid Rule + Grounded AI Engine
              </span>
            </div>
            <p className="text-zinc-400 text-sm mt-1">
              Brand & Regulatory Compliance Workflow Engine
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-900 p-1.5 rounded-lg border border-zinc-800">
            {(["JUDGE_DEMO", "CREATOR", "REVIEWER", "APPROVER"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                  role === r ? "bg-indigo-600 text-white shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                {r.replace("_", " ")}
              </button>
            ))}
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          {/* Left Column: Submission Studio & Brand Kit */}
          <section className="lg:col-span-5 space-y-6">
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Submit Content for Scan</h2>

              <div className="mb-4">
                <p className="text-xs text-zinc-400 mb-2">1-Click Sample Content:</p>
                <div className="flex flex-col gap-2">
                  {samplePosts.map((sp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedBrand(sp.brand_id);
                        setChannel(sp.channel);
                        setContent(sp.content);
                      }}
                      className="text-left text-xs px-3 py-2 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-indigo-300 border border-zinc-700 transition"
                    >
                      ⚡ {sp.title}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Select Brand Kit</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm"
                  >
                    {brandKits.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Target Channel</label>
                  <input
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Marketing Copy / Post</label>
                  <textarea
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste marketing post here..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg text-sm transition"
                >
                  {loading ? "Scanning Rules & Citations..." : "Run AI & Rule Compliance Scan"}
                </button>
              </form>
            </div>

            {/* Active Brand Kit Inspector */}
            {activeBrand && (
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 text-xs space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-zinc-200 uppercase tracking-wider">
                    Brand Kit: {activeBrand.name}
                  </h3>
                  <div className="flex gap-1.5">
                    {activeBrand.colors?.map((hex: string) => (
                      <span
                        key={hex}
                        title={hex}
                        style={{ backgroundColor: hex }}
                        className="w-4 h-4 rounded-full border border-white/20 inline-block"
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-zinc-400">Mandatory Disclaimer: </span>
                  <span className="text-emerald-400 font-mono">{activeBrand.required_disclaimer}</span>
                </div>
                <div>
                  <span className="text-zinc-400">Banned Phrases: </span>
                  <span className="text-rose-400 font-mono">
                    {Object.keys(activeBrand.banned_terms).join(", ")}
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* Right Column: Findings, Auto-Fix & Approval Workflow */}
          <section className="lg:col-span-7 space-y-4">
            <h2 className="text-lg font-semibold">
              Compliance Review & Audit Queue ({submissions.length})
            </h2>

            {submissions.length === 0 ? (
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-10 text-center text-zinc-500 text-sm">
                Queue is empty. Click <b>⚡ 1. Failing FinTech Ad</b> on the left and press <b>Run AI & Rule Compliance Scan</b>!
              </div>
            ) : (
              submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 space-y-4"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <span className="text-xs font-mono text-zinc-400">
                        #{sub.id} • Role: {sub.creator} • {sub.channel} • {sub.created_at}
                      </span>
                      <p className="mt-2 text-sm text-zinc-100 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                        "{sub.content}"
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          sub.status === "APPROVED"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : sub.status === "OVERRIDDEN"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {sub.status}
                      </span>
                      <div className="text-xs text-zinc-400 mt-1">
                        Score: <b className="text-white">{sub.compliance_score}/100</b>
                      </div>
                    </div>
                  </div>

                  {/* Findings with Rule ID, Citation & Suggested Fix */}
                  {sub.findings.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-semibold text-rose-400">
                          Flags Detected ({sub.findings.length}):
                        </p>
                        <button
                          onClick={() => {
                            setSelectedBrand(sub.brand_id);
                            setContent(sub.suggested_copy);
                          }}
                          className="text-xs px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition"
                        >
                          ✨ Load Auto-Fixed Copy into Editor
                        </button>
                      </div>

                      {sub.findings.map((f: any, i: number) => (
                        <div
                          key={i}
                          className="text-xs bg-rose-950/25 border border-rose-900/50 text-rose-200 p-3 rounded-lg space-y-1"
                        >
                          <div className="flex justify-between font-semibold">
                            <span>
                              [{f.rule_id} • {f.type}] {f.message}
                            </span>
                            <span className="font-mono text-rose-400">{f.severity}</span>
                          </div>
                          <div className="text-emerald-300">
                            <b>Suggested Fix:</b> {f.suggestion}
                          </div>
                          <div className="text-zinc-400 font-mono text-[11px]">
                            <b>Citation / Source:</b> {f.citation}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs bg-emerald-950/30 border border-emerald-900/50 text-emerald-300 px-3 py-2.5 rounded-lg">
                      ✓ Passed all deterministic lexicon rules, disclaimer requirements, and claim verifications.
                    </div>
                  )}

                  {/* Reviewer / Approver Actions & Certificate Export */}
                  <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-zinc-400 font-mono">
                      {sub.reviewer_note}
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {(sub.status === "APPROVED" || sub.status === "OVERRIDDEN") && (
                        <button
                          onClick={() => copyCertificate(sub)}
                          className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
                        >
                          {copiedId === sub.id ? "✓ Certificate Copied!" : "📋 Copy Approved Post & Certificate"}
                        </button>
                      )}

                      {(role === "REVIEWER" || role === "APPROVER" || role === "JUDGE_DEMO") && (
                        <>
                          <button
                            onClick={() => handleDecision(sub.id, "APPROVED")}
                            className="px-3 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-600/40 text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleDecision(sub.id, "OVERRIDDEN")}
                            className="px-3 py-1 rounded bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-600/40 text-xs"
                          >
                            Override with Reason
                          </button>
                          <button
                            onClick={() => handleDecision(sub.id, "REJECTED")}
                            className="px-3 py-1 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-600/40 text-xs"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>
        </main>
      </div>
    </div>
  );
}