"use client";

import { useState } from "react";
import {
  ShieldCheck,
  BrainCircuit,
  Link2,
  Search,
  Activity,
  LockKeyhole,
  AlertTriangle,
} from "lucide-react";

type Finding = {
  title: string;
  severity: "Low" | "Medium" | "High";
  detail: string;
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    findings: Finding[];
    summary: string;
  } | null>(null);

  async function analyze() {
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data);
    } catch (error) {
      setResult({
        score: 0,
        findings: [
          {
            title: "Analysis Error",
            severity: "High",
            detail: String(error),
          },
        ],
        summary: "تعذر إكمال الفحص.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="cyber-grid min-h-screen">
      <header className="border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-400/10 p-2 text-emerald-300">
              <ShieldCheck />
            </div>

            <div>
              <div className="text-xl font-bold tracking-wide">
                CYBERSHIELD AI
              </div>

              <div className="text-xs text-slate-500">
                DEFENSIVE SECURITY INTELLIGENCE
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-300">
            <Activity size={15} />
            SYSTEM ONLINE
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-16">
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
            منصة CyberShield AI للتحليل الدفاعي للأمن السيبراني،
            مع محرك ذكاء اصطناعي متقدم لتحليل النتائج وإعطاء
            تقييم واضح للمخاطر.
          </p>
        </div>

        <div className="glow mt-12 rounded-3xl border border-white/10 bg-white/[.025] p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Link2 size={18} className="text-emerald-300" />
            URL THREAT AUDITOR
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-4 outline-none focus:border-emerald-300/50"
            />

            <button
              onClick={analyze}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-300 px-6 py-4 font-bold text-black disabled:opacity-50"
            >
              <Search size={18} />

              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Feature
            icon={<LockKeyhole />}
            title="Defensive Analysis"
            description="Safe-by-design security analysis."
          />

          <Feature
            icon={<BrainCircuit />}
            title="AI Reasoning"
            description="Explain security findings clearly."
          />

          <Feature
            icon={<AlertTriangle />}
            title="Risk Scoring"
            description="Prioritize important security findings."
          />
        </div>

        {result && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Security Report
              </h2>

              <span className="rounded-full border border-white/10 px-3 py-1 text-sm">
                Risk: {result.score}/100
              </span>
            </div>

            <p className="mt-4 text-slate-300">
              {result.summary}
            </p>

            <div className="mt-6 space-y-3">
              {result.findings.map((finding, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-white/10 p-4"
                >
                  <div className="flex justify-between gap-3">
                    <b>{finding.title}</b>

                    <span className="text-xs text-amber-300">
                      {finding.severity}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-400">
                    {finding.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.02] p-6">
      <div className="text-emerald-300">
        {icon}
      </div>

      <h3 className="mt-5 font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}
