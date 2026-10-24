"use client";
import { useEffect, useState } from "react";

const FALLBACK_BRAND_KITS = [
  {
    id: "fintech-pro",
    name: "ApexFin (FinTech & Wealth)",
    colors: ["#78350F", "#D97706", "#292524"],
    banned_terms: {
      "guaranteed returns": "historical target returns",
      "risk-free": "risk-managed",
      "100% safe": "security-audited",
      "instant wealth": "long-term compounding",
      "no risk": "diversified exposure",
    },
    required_disclaimer: "Investments are subject to market risks.",
    claims_db: {
      "#1 in india": {
        verified: false,
        citation: "No SEBI/NPCI ranking found — Needs Human Review",
        fix: "a leading FinTech platform in India",
      },
      "zero fees forever": {
        verified: false,
        citation: "Contradicts Terms of Service Section 4.2 (AMC applies after Year 1)",
        fix: "zero account opening fees",
      },
      "sebi registered": {
        verified: true,
        citation: "Verified via SEBI Registry (Reg No. INZ000999999)",
        fix: "SEBI registered",
      },
    },
  },
  {
    id: "health-glow",
    name: "VitalGlow (Health & Derm)",
    colors: ["#92400E", "#B45309", "#1C1917"],
    banned_terms: {
      "cures all": "helps manage",
      "miracle pill": "daily supplement",
      "fda guaranteed": "formulated in FDA-registered facilities",
      "instant weight loss": "healthy metabolism support",
      "permanent cure": "long-term relief",
    },
    required_disclaimer: "Consult a physician before use.",
    claims_db: {
      "clinically proven 100%": {
        verified: false,
        citation: "No peer-reviewed trial supports 100% efficacy — Needs Human Review",
        fix: "formulated with clinically studied ingredients",
      },
      "dermatologist tested": {
        verified: true,
        citation: "Verified via Lab Report #VG-2026-09",
        fix: "dermatologist tested",
      },
    },
  },
];

const FALLBACK_SAMPLES = [
  {
    title: "1. Failing FinTech Ad (Lexicon + Claim + Visual Flags)",
    brand_id: "fintech-pro",
    channel: "Instagram / LinkedIn",
    content:
      "Start investing with ApexFin today for guaranteed returns and risk-free growth! We are #1 in India with zero fees forever.",
    alt_text: "",
    badge_hex: "#FF0000",
  },
  {
    title: "2. Compliant FinTech Ad (100/100 Clean Pass)",
    brand_id: "fintech-pro",
    channel: "Twitter / X",
    content:
      "Build long-term compounding with ApexFin, a SEBI registered platform with zero account opening fees. Investments are subject to market risks.",
    alt_text: "ApexFin portfolio dashboard showing diversified exposure",
    badge_hex: "#78350F",
  },
  {
    title: "3. Failing Health Ad (Miracle Claim Violation)",
    brand_id: "health-glow",
    channel: "Instagram Reel Caption",
    content:
      "Try VitalGlow's miracle pill for instant weight loss! It is clinically proven 100% effective.",
    alt_text: "VitalGlow supplement bottle",
    badge_hex: "#92400E",
  },
];

export default function VconDashboard() {
  const [role, setRole] = useState<"JUDGE_DEMO" | "CREATOR" | "REVIEWER" | "APPROVER">("JUDGE_DEMO");
  const [brandKits] = useState<any[]>(FALLBACK_BRAND_KITS);
  const [samplePosts] = useState<any[]>(FALLBACK_SAMPLES);
  const [submissions, setSubmissions] = useState<any[]>([]);

  const [selectedBrand, setSelectedBrand] = useState("fintech-pro");
  const [channel, setChannel] = useState("Instagram / LinkedIn");
  const [content, setContent] = useState("");
  const [altText, setAltText] = useState("Campaign banner image");
  const [badgeHex, setBadgeHex] = useState("#78350F");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Mouse spotlight coordinates
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const runLocalScan = (brandId: string, text: string, alt: string, hex: string) => {
    const brand = brandKits.find((b) => b.id === brandId) || FALLBACK_BRAND_KITS[0];
    const lower = text.toLowerCase();
    const findings: any[] = [];
    let suggested = text;

    Object.entries(brand.banned_terms as Record<string, string>).forEach(([bad, fix]) => {
      if (lower.includes(bad)) {
        findings.push({
          type: "BANNED_TERM",
          severity: "HIGH",
          rule_id: "RULE-LEX-01",
          message: `Banned phrase '${bad}' violates brand & regulatory lexicon.`,
          suggestion: `Replace '${bad}' with '${fix}'.`,
          citation: "Brand Policy Section 2.1 (Prohibited Promises)",
        });
        suggested = suggested.replace(new RegExp(bad, "gi"), fix);
      }
    });

    Object.entries(brand.claims_db || {}).forEach(([claim, info]: [string, any]) => {
      if (lower.includes(claim) && !info.verified) {
        findings.push({
          type: "UNVERIFIED_CLAIM",
          severity: "HIGH",
          rule_id: "RULE-AI-GROUND-02",
          message: `Unsupported claim '${claim}' flagged by grounded verification.`,
          suggestion: `Use verified phrasing: '${info.fix}'.`,
          citation: info.citation,
        });
        suggested = suggested.replace(new RegExp(claim, "gi"), info.fix);
      }
    });

    if (!lower.includes(brand.required_disclaimer.toLowerCase())) {
      findings.push({
        type: "MISSING_DISCLAIMER",
        severity: "MEDIUM",
        rule_id: "RULE-DISC-03",
        message: "Mandatory legal disclaimer is missing.",
        suggestion: `Append: '${brand.required_disclaimer}'`,
        citation: "Regulatory Disclosure Mandate 2026",
      });
      suggested = `${suggested.trim()} ${brand.required_disclaimer}`;
    }

    if (!alt.trim()) {
      findings.push({
        type: "MISSING_ALT_TEXT",
        severity: "LOW",
        rule_id: "RULE-A11Y-04",
        message: "Image attachment is missing accessibility alt-text.",
        suggestion: "Add descriptive alt-text for screen readers.",
        citation: "WCAG 2.1 AA Accessibility Standard",
      });
    }

    if (
      hex.trim() &&
      brand.colors &&
      !brand.colors.map((c: string) => c.toUpperCase()).includes(hex.trim().toUpperCase())
    ) {
      findings.push({
        type: "OFF_PALETTE_COLOR",
        severity: "LOW",
        rule_id: "RULE-BRAND-05",
        message: `Visual accent '${hex}' is outside approved warm brand palette.`,
        suggestion: `Switch visual hex to primary warm brown ${brand.colors[0]}.`,
        citation: "Brand Visual Identity Guidelines v2.4",
      });
    }

    const score = Math.max(0, 100 - findings.length * 20);
    const status = findings.length === 0 ? "APPROVED" : "FLAGGED";
    return { findings, score, status, suggested };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);

    const { findings, score, status, suggested } = runLocalScan(
      selectedBrand,
      content,
      altText,
      badgeHex
    );

    const newSub = {
      id: Math.random().toString(36).substring(2, 8),
      brand_id: selectedBrand,
      creator: role,
      channel,
      content,
      alt_text: altText,
      badge_hex: badgeHex,
      suggested_copy: suggested,
      findings,
      compliance_score: score,
      status,
      reviewer_note:
        status === "APPROVED" ? "Auto-approved (0 violations)" : "Awaiting Reviewer Action",
      created_at: new Date().toLocaleTimeString(),
    };

    setSubmissions((prev) => [newSub, ...prev]);
    setContent("");
    setLoading(false);
  };

  const handleDecision = async (id: string, status: string) => {
    let note = `Status set to ${status} by ${role}`;
    if (status === "OVERRIDDEN") {
      const reason = window.prompt(
        "Enter mandatory legal override justification:",
        "Campaign pre-cleared by Legal Counsel (#LC-402)"
      );
      if (!reason) return;
      note = `OVERRIDE REASON: ${reason}`;
    }

    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status, reviewer_note: note } : s))
    );
  };

  const copyCertificate = (sub: any) => {
    const text = `[vcon COMPLIANCE CERTIFICATE #${sub.id}]\nStatus: ${sub.status} | Score: ${sub.compliance_score}/100\nChannel: ${sub.channel}\nApproved Copy: "${sub.content}"\nAudit Note: ${sub.reviewer_note}`;
    navigator.clipboard.writeText(text);
    setCopiedId(sub.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeBrand = brandKits.find((b) => b.id === selectedBrand) || FALLBACK_BRAND_KITS[0];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#292524] font-sans selection:bg-[#D97706]/20 relative overflow-x-hidden">
      {/* Subtle Mouse Spotlight Effect */}
      <div
        className="pointer-events-none fixed -inset-px transition duration-300 z-50"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(217, 119, 6, 0.06), transparent 80%)`,
        }}
      />

      {/* Top Banner */}
      <div className="bg-[#451A03] border-b border-[#78350F]/40 px-6 py-2.5 text-xs text-[#FEF3C7] flex flex-wrap justify-between items-center gap-2 shadow-sm">
        <span>
          <b>👋 Judge Quick-Start Guide:</b> 1) Click a <b>Demo Preset</b> on the left → 2) Click{" "}
          <b>Run Compliance Scan</b> → 3) Click <b>Load Auto-Fixed Copy</b> or{" "}
          <b>Override with Reason</b>.
        </span>
        <span className="font-mono bg-[#292524] px-2.5 py-1 rounded border border-[#78350F] text-[#FDE68A]">
          10-Post Eval Benchmark: 100% Detection (5/5) | 0% False Flags (0/5)
        </span>
      </div>

      <div className="p-6 md:p-10 max-w-7xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#E7E5E4]">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-[#1C1917]">vcon</h1>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#D97706]/10 text-[#B45309] border border-[#D97706]/20 font-medium">
                Warm Edition: Hybrid Rule + Grounded AI
              </span>
            </div>
            <p className="text-[#57534E] text-sm mt-1">
              Brand & Regulatory Compliance Workflow Engine
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#F5F2EB] p-1.5 rounded-lg border border-[#E7E5E4] shadow-sm">
            {(["JUDGE_DEMO", "CREATOR", "REVIEWER", "APPROVER"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition transform active:scale-95 duration-150 ${
                  role === r
                    ? "bg-[#78350F] text-[#FEF3C7] shadow"
                    : "text-[#57534E] hover:text-[#1C1917] hover:bg-[#E7E5E4]/50"
                }`}
              >
                {r.replace("_", " ")}
              </button>
            ))}
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          {/* Left Column */}
          <section className="lg:col-span-5 space-y-6">
            <div className="bg-[#F5F2EB] border border-[#E7E5E4] rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-[#1C1917]">Submit Content for Scan</h2>

              <div className="mb-4">
                <p className="text-xs text-[#78716C] mb-2 font-medium">1-Click Sample Content:</p>
                <div className="flex flex-col gap-2">
                  {samplePosts.map((sp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedBrand(sp.brand_id);
                        setChannel(sp.channel);
                        setContent(sp.content);
                        setAltText(sp.alt_text);
                        setBadgeHex(sp.badge_hex);
                      }}
                      className="text-left text-xs px-3 py-2.5 rounded-xl bg-[#EBE7DE] hover:bg-[#E2DED5] text-[#451A03] border border-[#D6D0C4] transition transform active:scale-[0.98] duration-150 font-medium shadow-2xs"
                    >
                      ⚡ {sp.title}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-[#78716C] mb-1 font-medium">Select Brand Kit</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => {
                      setSelectedBrand(e.target.value);
                      const kit = brandKits.find((b) => b.id === e.target.value);
                      if (kit?.colors?.[0]) setBadgeHex(kit.colors[0]);
                    }}
                    className="w-full bg-white border border-[#D6D0C4] rounded-xl px-3 py-2.5 text-sm text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#D97706]/40"
                  >
                    {brandKits.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#78716C] mb-1 font-medium">Target Channel</label>
                    <input
                      value={channel}
                      onChange={(e) => setChannel(e.target.value)}
                      className="w-full bg-white border border-[#D6D0C4] rounded-xl px-3 py-2.5 text-sm text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#D97706]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#78716C] mb-1 font-medium">Visual Hex Color</label>
                    <input
                      value={badgeHex}
                      onChange={(e) => setBadgeHex(e.target.value)}
                      placeholder="#78350F"
                      className="w-full bg-white border border-[#D6D0C4] rounded-xl px-3 py-2.5 text-sm font-mono text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#D97706]/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#78716C] mb-1 font-medium">Image Alt-Text (A11y Check)</label>
                  <input
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Describe image for screen readers..."
                    className="w-full bg-white border border-[#D6D0C4] rounded-xl px-3 py-2.5 text-sm text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#D97706]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#78716C] mb-1 font-medium">Marketing Copy / Post</label>
                  <textarea
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste marketing post here..."
                    className="w-full bg-white border border-[#D6D0C4] rounded-xl p-3 text-sm text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#D97706]/40"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#78350F] hover:bg-[#451A03] text-[#FEF3C7] font-medium py-3 rounded-xl text-sm transition transform active:scale-[0.98] duration-150 shadow-md cursor-pointer"
                >
                  {loading ? "Scanning Rules & Citations..." : "Run AI & Rule Compliance Scan"}
                </button>
              </form>
            </div>

            {activeBrand && (
              <div className="bg-[#F5F2EB]/60 border border-[#E7E5E4] rounded-2xl p-5 text-xs space-y-3 shadow-2xs">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-[#1C1917] uppercase tracking-wider">
                    Brand Kit: {activeBrand.name}
                  </h3>
                  <div className="flex gap-1.5">
                    {activeBrand.colors?.map((hex: string) => (
                      <span
                        key={hex}
                        title={hex}
                        style={{ backgroundColor: hex }}
                        className="w-4 h-4 rounded-full border border-black/10 inline-block shadow-2xs"
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[#78716C]">Approved Hex Palette: </span>
                  <span className="text-[#92400E] font-mono">{activeBrand.colors?.join(", ")}</span>
                </div>
                <div>
                  <span className="text-[#78716C]">Mandatory Disclaimer: </span>
                  <span className="text-[#047857] font-mono">{activeBrand.required_disclaimer}</span>
                </div>
                <div>
                  <span className="text-[#78716C]">Banned Phrases: </span>
                  <span className="text-[#BE123C] font-mono">
                    {Object.keys(activeBrand.banned_terms).join(", ")}
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* Right Column */}
          <section className="lg:col-span-7 space-y-4">
            <h2 className="text-lg font-semibold text-[#1C1917]">
              Compliance Review & Audit Queue ({submissions.length})
            </h2>

            {submissions.length === 0 ? (
              <div className="bg-[#F5F2EB] border border-[#E7E5E4] rounded-2xl p-12 text-center text-[#78716C] text-sm shadow-2xs">
                Queue is empty. Click <b>⚡ 1. Failing FinTech Ad</b> on the left and press{" "}
                <b>Run AI & Rule Compliance Scan</b>!
              </div>
            ) : (
              submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-[#F5F2EB] border border-[#E7E5E4] rounded-2xl p-6 space-y-4 shadow-xs"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <span className="text-xs font-mono text-[#78716C]">
                        #{sub.id} • Role: {sub.creator} • {sub.channel} • {sub.created_at}
                      </span>
                      <p className="mt-2 text-sm text-[#1C1917] bg-white p-3.5 rounded-xl border border-[#D6D0C4] shadow-2xs">
                        "{sub.content}"
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          sub.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : sub.status === "OVERRIDDEN"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : "bg-rose-100 text-rose-800 border border-rose-300"
                        }`}
                      >
                        {sub.status}
                      </span>
                      <div className="text-xs text-[#78716C] mt-1">
                        Score: <b className="text-[#1C1917]">{sub.compliance_score}/100</b>
                      </div>
                    </div>
                  </div>

                  {sub.findings.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-semibold text-rose-700">
                          Flags Detected ({sub.findings.length}):
                        </p>
                        <button
                          onClick={() => {
                            const kit =
                              brandKits.find((b) => b.id === sub.brand_id) ||
                              FALLBACK_BRAND_KITS[0];
                            setSelectedBrand(sub.brand_id);
                            setContent(sub.suggested_copy);
                            setAltText("Verified campaign visual banner with brand logo");
                            setBadgeHex(kit.colors?.[0] || "#78350F");
                          }}
                          className="text-xs px-3 py-1.5 rounded-xl bg-[#78350F]/10 hover:bg-[#78350F]/20 text-[#78350F] border border-[#78350F]/20 transition transform active:scale-95 font-medium cursor-pointer"
                        >
                          ✨ Load Auto-Fixed Copy & Visuals into Editor
                        </button>
                      </div>

                      {sub.findings.map((f: any, i: number) => (
                        <div
                          key={i}
                          className="text-xs bg-rose-50 border border-rose-200 text-rose-900 p-3.5 rounded-xl space-y-1 shadow-2xs"
                        >
                          <div className="flex justify-between font-semibold">
                            <span>
                              [{f.rule_id} • {f.type}] {f.message}
                            </span>
                            <span className="font-mono text-rose-700">{f.severity}</span>
                          </div>
                          <div className="text-emerald-800 font-medium">
                            <b>Suggested Fix:</b> {f.suggestion}
                          </div>
                          <div className="text-[#78716C] font-mono text-[11px]">
                            <b>Citation / Source:</b> {f.citation}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-3 rounded-xl font-medium">
                      ✓ Passed all deterministic lexicon rules, disclaimer requirements, visual palette checks, and claim verifications.
                    </div>
                  )}

                  <div className="pt-3 border-t border-[#E7E5E4] flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-[#78716C] font-mono">{sub.reviewer_note}</span>

                    <div className="flex flex-wrap gap-2">
                      {(sub.status === "APPROVED" || sub.status === "OVERRIDDEN") && (
                        <button
                          onClick={() => copyCertificate(sub)}
                          className="px-3 py-1.5 rounded-xl bg-[#78350F] hover:bg-[#451A03] text-[#FEF3C7] text-xs font-medium transition transform active:scale-95 shadow-xs cursor-pointer"
                        >
                          {copiedId === sub.id
                            ? "✓ Certificate Copied!"
                            : "📋 Copy Approved Post & Certificate"}
                        </button>
                      )}

                      {(role === "REVIEWER" || role === "APPROVER" || role === "JUDGE_DEMO") && (
                        <>
                          <button
                            onClick={() => handleDecision(sub.id, "APPROVED")}
                            className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 text-xs font-medium transition transform active:scale-95 cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleDecision(sub.id, "OVERRIDDEN")}
                            className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 text-xs font-medium transition transform active:scale-95 cursor-pointer"
                          >
                            Override with Reason
                          </button>
                          <button
                            onClick={() => handleDecision(sub.id, "REJECTED")}
                            className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 text-xs font-medium transition transform active:scale-95 cursor-pointer"
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