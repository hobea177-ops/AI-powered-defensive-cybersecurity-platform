"use client";

import { useState, type ReactNode } from "react";
import {
  ShieldCheck,
  BrainCircuit,
  Link2,
  Search,
  Activity,
  LockKeyhole,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Loader2,
  FileSearch,
  Target,
} from "lucide-react";

type Severity = "Low" | "Medium" | "High";

type Finding = {
  title: string;
  severity: Severity;
  detail: string;
};

type AnalysisResult = {
  score: number;
  findings: Finding[];
  summary: string;
  aiReasoning?: string;
  aiEnabled?: boolean;
  analyzedUrl?: string;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH";
};

type Section =
  | "defensive"
  | "ai"
  | "risk"
  | null;

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] =
    useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [openSection, setOpenSection] =
    useState<Section>(null);

  async function analyze() {
    const cleanUrl = url.trim();

    if (!cleanUrl) {
      setError("Please enter a URL first.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError("");
    setOpenSection(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: cleanUrl,
        }),
      });

      let data: any;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error || "Analysis failed."
        );
      }

      if (
        typeof data?.score !== "number" ||
        !Array.isArray(data?.findings)
      ) {
        throw new Error(
          "Invalid analysis response."
        );
      }

      setResult({
        score: data.score,
        findings: data.findings,
        summary:
          data.summary ||
          "تم إكمال التحليل الدفاعي للرابط.",
        aiReasoning:
          data.aiReasoning ||
          "لم يتم توفير تحليل AI.",
        aiEnabled:
          Boolean(data.aiEnabled),
        analyzedUrl:
          data.analyzedUrl || cleanUrl,
        riskLevel: data.riskLevel,
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to complete analysis.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      analyze();
    }
  }

  function toggleSection(section: Section) {
    if (!result) return;

    setOpenSection((current) =>
      current === section ? null : section
    );
  }

  const highCount =
    result?.findings.filter(
      (item) => item.severity === "High"
    ).length ?? 0;

  const mediumCount =
    result?.findings.filter(
      (item) => item.severity === "Medium"
    ).length ?? 0;

  const lowCount =
    result?.findings.filter(
      (item) => item.severity === "Low"
    ).length ?? 0;

  const riskLevel = getRiskLevel(
    result?.score ?? 0
  );

  return (
    <main className="cyber-grid min-h-screen bg-[#020708] text-slate-100">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-400/10 p-2 text-emerald-300">
              <ShieldCheck size={27} />
            </div>

            <div>
              <div className="text-xl font-bold tracking-wide">
                CYBERSHIELD AI
              </div>

              <div className="text-xs tracking-wider text-slate-500">
                DEFENSIVE SECURITY INTELLIGENCE
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-300">
            <Activity size={15} />

            <span className="hidden sm:inline">
              SYSTEM ONLINE
            </span>

            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
          </div>
        </div>
      </header>

      {/* MAIN */}
      <section className="mx-auto max-w-7xl px-6 py-14 md:py-20">
        {/* HERO */}
        <div className="max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 text-xs text-emerald-300">
            <BrainCircuit size={14} />
            AI SECURITY ANALYST
          </div>

          <h1 className="text-5xl font-black leading-tight md:text-7xl">
            Understand threats.
            <br />

            <span className="text-emerald-300">
              Defend smarter.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            منصة CyberShield AI للتحليل الدفاعي للأمن
            السيبراني، مع محرك ذكاء اصطناعي لتحليل
            النتائج وإعطاء تقييم واضح للمخاطر.
          </p>
        </div>

        {/* URL AUDITOR */}
        <div className="glow mt-12 rounded-3xl border border-white/10 bg-white/[.025] p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Link2
              size={18}
              className="text-emerald-300"
            />
            URL THREAT AUDITOR
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={url}
              onChange={(event) =>
                setUrl(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="https://example.com"
              autoComplete="off"
              spellCheck={false}
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/50 px-4 py-4 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-300/10"
            />

            <button
              onClick={analyze}
              disabled={loading}
              className="flex min-h-[56px] items-center justify-center gap-2 rounded-xl bg-emerald-300 px-7 py-4 font-bold text-black transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search size={19} />
                  Analyze
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
              <XCircle
                size={19}
                className="mt-0.5 shrink-0"
              />

              <div>
                <div className="font-semibold">
                  Analysis failed
                </div>

                <div className="mt-1 text-red-300/70">
                  {error}
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 text-xs text-slate-600">
            Defensive URL inspection only. No
            exploitation is performed.
          </div>
        </div>

        {/* FEATURE CARDS */}
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Feature
            icon={<LockKeyhole size={28} />}
            title="Defensive Analysis"
            description="Safe-by-design security analysis."
            active={!!result}
            open={
              openSection === "defensive"
            }
            onClick={() =>
              toggleSection("defensive")
            }
          />

          <Feature
            icon={<BrainCircuit size={28} />}
            title="AI Reasoning"
            description="Explain security findings clearly."
            active={!!result}
            open={openSection === "ai"}
            onClick={() =>
              toggleSection("ai")
            }
          />

          <Feature
            icon={<AlertTriangle size={28} />}
            title="Risk Scoring"
            description="Prioritize important security findings."
            active={!!result}
            open={openSection === "risk"}
            onClick={() =>
              toggleSection("risk")
            }
          />
        </div>

        {/* DEFENSIVE ANALYSIS */}
        {result &&
          openSection === "defensive" && (
            <ExpandablePanel
              icon={<LockKeyhole />}
              title="Defensive Analysis"
              subtitle="Technical indicators detected in the submitted URL."
            >
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  label="High"
                  value={highCount}
                  description="High-priority indicators"
                />

                <StatCard
                  label="Medium"
                  value={mediumCount}
                  description="Indicators requiring review"
                />

                <StatCard
                  label="Low"
                  value={lowCount}
                  description="Low-priority indicators"
                />
              </div>

              <div className="mt-6 space-y-3">
                {result.findings.map(
                  (finding, index) => (
                    <FindingCard
                      key={`${finding.title}-${index}`}
                      finding={finding}
                    />
                  )
                )}
              </div>
            </ExpandablePanel>
          )}

        {/* REAL AI REASONING */}
        {result && openSection === "ai" && (
          <ExpandablePanel
            icon={<BrainCircuit />}
            title="AI Reasoning"
            subtitle="AI-generated defensive interpretation."
          >
            <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[.03] p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-400/10 p-2 text-emerald-300">
                    <BrainCircuit size={22} />
                  </div>

                  <div>
                    <div className="font-semibold">
                      Groq AI Security Analysis
                    </div>

                    <div className="text-xs text-slate-500">
                      Defensive reasoning layer
                    </div>
                  </div>
                </div>

                <span
                  className={`rounded-full border px-3 py-1 text-xs ${
                    result.aiEnabled
                      ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-300"
                      : "border-yellow-400/20 bg-yellow-400/5 text-yellow-300"
                  }`}
                >
                  {result.aiEnabled
                    ? "AI ONLINE"
                    : "AI FALLBACK"}
                </span>
              </div>

              <div className="mt-6 whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-5 text-sm leading-7 text-slate-300">
                {result.aiReasoning ||
                  "لا يوجد تحليل AI متاح حاليًا."}
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <ReasoningItem
                icon={<FileSearch size={20} />}
                title="Observed"
                text={`${result.findings.length} security indicator(s) were identified during the URL inspection.`}
              />

              <ReasoningItem
                icon={<Target size={20} />}
                title="Priority"
                text={getPriorityText(
                  result.score
                )}
              />
            </div>

            <div className="mt-5 rounded-xl border border-yellow-400/10 bg-yellow-400/[.02] p-4 text-sm leading-6 text-slate-400">
              ملاحظة: تحليل الذكاء الاصطناعي مبني على
              المؤشرات التي تم اكتشافها، ولا يعتبر إثباتًا
              قطعيًا بأن الموقع ضار أو آمن.
            </div>
          </ExpandablePanel>
        )}

        {/* RISK SCORING */}
        {result &&
          openSection === "risk" && (
            <ExpandablePanel
              icon={<AlertTriangle />}
              title="Risk Scoring"
              subtitle="Prioritization based on detected indicators."
            >
              <div className="flex flex-col gap-8 md:flex-row md:items-center">
                <div className="relative flex h-44 w-44 shrink-0 items-center justify-center rounded-full border-8 border-emerald-300/20">
                  <div className="text-center">
                    <div className="text-5xl font-black">
                      {result.score}
                    </div>

                    <div className="text-xs text-slate-500">
                      / 100
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="text-sm text-slate-500">
                    Current risk classification
                  </div>

                  <div className="mt-2 text-3xl font-bold text-emerald-300">
                    {result.riskLevel
                      ? result.riskLevel
                      : riskLevel}
                  </div>

                  <p className="mt-4 leading-7 text-slate-400">
                    {getRiskDescription(
                      result.score
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-3 md:grid-cols-3">
                <RiskLegend
                  title="Low"
                  range="0 - 29"
                />

                <RiskLegend
                  title="Medium"
                  range="30 - 69"
                />

                <RiskLegend
                  title="High"
                  range="70 - 100"
                />
              </div>
            </ExpandablePanel>
          )}

        {/* SECURITY REPORT */}
        {result && (
          <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-black/30">
            <div className="border-b border-white/10 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      size={22}
                      className="text-emerald-300"
                    />

                    <h2 className="text-2xl font-bold">
                      Security Report
                    </h2>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Defensive analysis report for:
                  </p>

                  <p className="mt-1 max-w-full break-all text-sm text-emerald-300/80">
                    {result.analyzedUrl ||
                      url}
                  </p>
                </div>

                <div className="w-fit rounded-full border border-white/10 px-4 py-2 text-sm">
                  Risk:{" "}
                  <span className="font-bold text-emerald-300">
                    {result.score}/100
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* SUMMARY */}
              <div className="rounded-2xl border border-white/10 bg-white/[.02] p-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle2
                    size={18}
                    className="text-emerald-300"
                  />

                  Analysis Summary
                </div>

                <p className="mt-3 leading-7 text-slate-300">
                  {result.summary}
                </p>
              </div>

              {/* AI SUMMARY */}
              <div className="mt-5 rounded-2xl border border-emerald-400/10 bg-emerald-400/[.02] p-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <BrainCircuit
                    size={18}
                    className="text-emerald-300"
                  />

                  AI Security Interpretation
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                  {result.aiReasoning ||
                    "AI reasoning unavailable."}
                </p>
              </div>

              {/* FINDINGS */}
              <div className="mt-7">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-bold">
                    Security Findings
                  </h3>

                  <span className="text-xs text-slate-500">
                    {result.findings.length} finding(s)
                  </span>
                </div>

                <div className="space-y-3">
                  {result.findings.map(
                    (finding, index) => (
                      <FindingCard
                        key={`${finding.title}-${index}`}
                        finding={finding}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* EMPTY STATE */}
        {!result && !loading && (
          <div className="mt-12 rounded-3xl border border-dashed border-white/10 bg-white/[.015] p-10 text-center">
            <ShieldCheck
              size={42}
              className="mx-auto text-slate-700"
            />

            <h2 className="mt-5 text-xl font-bold text-slate-400">
              Ready for defensive analysis
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
              أدخل رابطًا في الأعلى واضغط Analyze لبدء
              الفحص الأمني الدفاعي.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

/* =========================================================
   FEATURE
========================================================= */

function Feature({
  icon,
  title,
  description,
  active,
  open,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  active: boolean;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!active}
      className={`group w-full rounded-2xl border p-6 text-left transition ${
        active
          ? "cursor-pointer border-emerald-400/20 bg-white/[.025] hover:border-emerald-300/40 hover:bg-emerald-300/[.03]"
          : "cursor-default border-white/10 bg-white/[.02]"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="text-emerald-300">
          {icon}
        </div>

        {active && (
          <div className="text-slate-500 group-hover:text-emerald-300">
            {open ? (
              <ChevronUp size={19} />
            ) : (
              <ChevronDown size={19} />
            )}
          </div>
        )}
      </div>

      <h3 className="mt-5 text-lg font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        {description}
      </p>

      {active && (
        <div className="mt-4 text-xs text-emerald-300/70">
          {open
            ? "Click to collapse"
            : "Click to inspect"}
        </div>
      )}
    </button>
  );
}

/* =========================================================
   PANEL
========================================================= */

function ExpandablePanel({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-6 rounded-3xl border border-emerald-400/10 bg-black/30 p-6">
      <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-5">
        <div className="rounded-xl bg-emerald-400/10 p-2 text-emerald-300">
          {icon}
        </div>

        <div>
          <h2 className="text-xl font-bold">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {subtitle}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   FINDING
========================================================= */

function FindingCard({
  finding,
}: {
  finding: Finding;
}) {
  const severityClass =
    finding.severity === "High"
      ? "border-red-400/20 bg-red-400/[.03] text-red-300"
      : finding.severity === "Medium"
      ? "border-yellow-400/20 bg-yellow-400/[.03] text-yellow-300"
      : "border-emerald-400/20 bg-emerald-400/[.03] text-emerald-300";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.015] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle
            size={18}
            className="text-slate-500"
          />

          <b>{finding.title}</b>
        </div>

        <span
          className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${severityClass}`}
        >
          {finding.severity}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        {finding.detail}
      </p>
    </div>
  );
}

/* =========================================================
   STAT
========================================================= */

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.02] p-5">
      <div className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </div>

      <div className="mt-2 text-4xl font-black">
        {value}
      </div>

      <div className="mt-2 text-xs text-slate-600">
        {description}
      </div>
    </div>
  );
}

/* =========================================================
   REASONING ITEM
========================================================= */

function ReasoningItem({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.02] p-5">
      <div className="flex items-center gap-3">
        <div className="text-emerald-300">
          {icon}
        </div>

        <div className="font-semibold">
          {title}
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        {text}
      </p>
    </div>
  );
}

/* =========================================================
   RISK LEGEND
========================================================= */

function RiskLegend({
  title,
  range,
}: {
  title: string;
  range: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 p-4">
      <div className="font-semibold">
        {title}
      </div>

      <div className="mt-1 text-xs text-slate-500">
        {range}
      </div>
    </div>
  );
}

/* =========================================================
   RISK HELPERS
========================================================= */

function getRiskLevel(score: number) {
  if (score >= 70) return "HIGH RISK";
  if (score >= 30) return "MEDIUM RISK";
  return "LOW RISK";
}

function getRiskDescription(score: number) {
  if (score >= 70) {
    return "تم العثور على مؤشرات ذات أولوية عالية. تعامل مع الرابط بحذر وتحقق من مصدره قبل استخدامه.";
  }

  if (score >= 30) {
    return "تم العثور على بعض المؤشرات التي تستحق المراجعة. لا يعني ذلك بالضرورة أن الرابط ضار.";
  }

  return "لم تظهر مؤشرات قوية ضمن الفحوصات الأساسية الحالية. هذا لا يضمن أن الموقع آمن بشكل كامل.";
}

function getPriorityText(score: number) {
  if (score >= 70) {
    return "High priority. Review the detected findings before trusting the URL.";
  }

  if (score >= 30) {
    return "Medium priority. Review the findings and verify the domain.";
  }

  return "Low priority based on the current URL indicators.";
}
