import { NextResponse } from "next/server";

type Finding = {
  title: string;
  severity: "Low" | "Medium" | "High";
  detail: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = String(body?.url ?? "").trim();

    if (!input) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    let parsed: URL;

    try {
      parsed = new URL(input);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL" },
        { status: 400 }
      );
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json(
        { error: "Only HTTP and HTTPS URLs are supported" },
        { status: 400 }
      );
    }

    const findings: Finding[] = [];

    if (parsed.protocol === "http:") {
      findings.push({
        title: "Unencrypted HTTP",
        severity: "High",
        detail:
          "The URL uses HTTP instead of HTTPS. Traffic may not be protected in transit.",
      });
    }

    if (parsed.hostname.includes("xn--")) {
      findings.push({
        title: "Internationalized Domain Name",
        severity: "Medium",
        detail:
          "The hostname contains an IDN/Punycode label. Verify the domain carefully before trusting it.",
      });
    }

    if (parsed.username || parsed.password) {
      findings.push({
        title: "Credentials in URL",
        severity: "High",
        detail:
          "The URL contains user-information fields. Avoid placing credentials in URLs.",
      });
    }

    if (parsed.hostname.split(".").length > 4) {
      findings.push({
        title: "Unusually Deep Hostname",
        severity: "Low",
        detail:
          "The hostname contains many subdomain levels. This is not necessarily malicious, but deserves verification.",
      });
    }

    if (findings.length === 0) {
      findings.push({
        title: "No Basic URL Indicators Detected",
        severity: "Low",
        detail:
          "The URL passed the basic structural checks. This does not prove that the website is safe.",
      });
    }

    const score = Math.min(
      100,
      findings.reduce((total, finding) => {
        if (finding.severity === "High") return total + 40;
        if (finding.severity === "Medium") return total + 20;
        return total + 5;
      }, 0)
    );

    return NextResponse.json({
      score,
      findings,
      summary:
        "تم إجراء تحليل دفاعي أولي للرابط. النتائج لا تعني أن الموقع آمن أو مخترق بشكل مؤكد.",
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to analyze the request" },
      { status: 500 }
    );
  }
}
