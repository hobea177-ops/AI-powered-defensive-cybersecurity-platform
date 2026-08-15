import { NextResponse } from "next/server";
import Groq from "groq-sdk";

type Severity = "Low" | "Medium" | "High";

type Finding = {
  title: string;
  severity: Severity;
  detail: string;
};

const groq = process.env.GROQ_API_KEY
  ? new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })
  : null;

function calculateScore(findings: Finding[]) {
  return Math.min(
    100,
    findings.reduce((total, finding) => {
      if (finding.severity === "High") return total + 40;
      if (finding.severity === "Medium") return total + 20;
      return total + 5;
    }, 0)
  );
}

function getFallbackReasoning(
  score: number,
  findings: Finding[]
) {
  const high = findings.filter(
    (item) => item.severity === "High"
  ).length;

  const medium = findings.filter(
    (item) => item.severity === "Medium"
  ).length;

  if (high > 0) {
    return `تم العثور على ${high} مؤشر عالي الخطورة. درجة المخاطر الحالية ${score}/100، لذلك يجب التعامل مع الرابط بحذر والتحقق من مصدره قبل استخدامه.`;
  }

  if (medium > 0) {
    return `تم العثور على مؤشرات متوسطة الخطورة. درجة المخاطر الحالية ${score}/100 وتشير إلى أن الرابط يحتاج إلى مراجعة إضافية قبل الوثوق به.`;
  }

  return `لم تظهر مؤشرات قوية ضمن الفحوصات الأساسية. درجة المخاطر الحالية ${score}/100، لكن ذلك لا يثبت أن الموقع آمن بشكل كامل.`;
}

async function generateAIReasoning(
  input: string,
  findings: Finding[],
  score: number
) {
  if (!groq) {
    return getFallbackReasoning(score, findings);
  }

  try {
    const findingsText =
      findings.length > 0
        ? findings
            .map(
              (finding, index) =>
                `${index + 1}. ${finding.title} | Severity: ${finding.severity} | ${finding.detail}`
            )
            .join("\n")
        : "No security indicators detected.";

    const completion =
      await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content: `
You are a defensive cybersecurity analysis assistant.

Analyze only the security indicators provided to you.
Do not claim that a website is definitely malicious or safe.
Do not provide exploitation instructions.
Do not perform or suggest attacks.
Do not reveal hidden chain-of-thought or internal reasoning.

Return a concise security interpretation suitable for a dashboard.

Explain:
1. What the findings mean.
2. Why the risk score was assigned.
3. What a user should verify defensively.

Answer in Arabic.
`,
          },
          {
            role: "user",
            content: `
URL:
${input}

Risk score:
${score}/100

Security findings:
${findingsText}

Provide a concise defensive security interpretation.
`,
          },
        ],
      });

    const text =
      completion.choices?.[0]?.message?.content?.trim();

    if (text) {
      return text;
    }

    return getFallbackReasoning(score, findings);
  } catch {
    return getFallbackReasoning(score, findings);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const input = String(body?.url ?? "").trim();

    if (!input) {
      return NextResponse.json(
        {
          error: "URL is required",
        },
        {
          status: 400,
        }
      );
    }

    let parsed: URL;

    try {
      parsed = new URL(input);
    } catch {
      return NextResponse.json(
        {
          error: "Invalid URL",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !["http:", "https:"].includes(
        parsed.protocol
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Only HTTP and HTTPS URLs are supported",
        },
        {
          status: 400,
        }
      );
    }

    const findings: Finding[] = [];

    /*
     * HTTPS CHECK
     */
    if (parsed.protocol === "http:") {
      findings.push({
        title: "Unencrypted HTTP",
        severity: "High",
        detail:
          "The URL uses HTTP instead of HTTPS. Traffic may not be protected in transit.",
      });
    }

    /*
     * PUNYCODE / IDN CHECK
     */
    if (parsed.hostname.includes("xn--")) {
      findings.push({
        title: "Internationalized Domain Name",
        severity: "Medium",
        detail:
          "The hostname contains an IDN/Punycode label. Verify the domain carefully before trusting it.",
      });
    }

    /*
     * USERNAME / PASSWORD IN URL
     */
    if (
      parsed.username ||
      parsed.password
    ) {
      findings.push({
        title: "Credentials in URL",
        severity: "High",
        detail:
          "The URL contains user-information fields. Avoid placing credentials in URLs.",
      });
    }

    /*
     * DEEP SUBDOMAIN CHECK
     */
    const hostnameParts =
      parsed.hostname.split(".").filter(Boolean);

    if (hostnameParts.length > 4) {
      findings.push({
        title: "Unusually Deep Hostname",
        severity: "Low",
        detail:
          "The hostname contains many subdomain levels. This is not necessarily malicious, but deserves verification.",
      });
    }

    /*
     * IP ADDRESS CHECK
     */
    const isIPv4 =
      /^(?:\d{1,3}\.){3}\d{1,3}$/.test(
        parsed.hostname
      );

    if (isIPv4) {
      findings.push({
        title: "Direct IP Address",
        severity: "Medium",
        detail:
          "The URL uses a direct IPv4 address instead of a normal domain name. Verify that the destination is expected.",
      });
    }

    /*
     * PORT CHECK
     */
    if (
      parsed.port &&
      parsed.port !== "80" &&
      parsed.port !== "443"
    ) {
      findings.push({
        title: "Non-Standard Port",
        severity: "Low",
        detail:
          `The URL uses port ${parsed.port}, which is not a standard HTTP or HTTPS port.`,
      });
    }

    /*
     * URL LENGTH CHECK
     */
    if (input.length > 2000) {
      findings.push({
        title: "Very Long URL",
        severity: "Low",
        detail:
          "The URL is unusually long. Long URLs can have legitimate uses, but should be reviewed carefully.",
      });
    }

    /*
     * HOSTNAME LENGTH CHECK
     */
    if (parsed.hostname.length > 100) {
      findings.push({
        title: "Long Hostname",
        severity: "Low",
        detail:
          "The hostname is unusually long and should be verified carefully.",
      });
    }

    /*
     * @ CHARACTER CHECK
     */
    if (input.includes("@")) {
      findings.push({
        title: "At-Sign URL Pattern",
        severity: "Medium",
        detail:
          "The URL contains an @ character. Verify the actual destination hostname before trusting the link.",
      });
    }

    /*
     * SUSPICIOUS ENCODING CHECK
     */
    const encodedCharacters =
      (input.match(/%[0-9a-fA-F]{2}/g) || [])
        .length;

    if (encodedCharacters >= 8) {
      findings.push({
        title: "Heavy URL Encoding",
        severity: "Low",
        detail:
          "The URL contains a high number of encoded characters. This can be legitimate but deserves additional review.",
      });
    }

    /*
     * NO FINDINGS
     */
    if (findings.length === 0) {
      findings.push({
        title: "No Basic URL Indicators Detected",
        severity: "Low",
        detail:
          "The URL passed the basic structural checks. This does not prove that the website is safe.",
      });
    }

    /*
     * RISK SCORE
     */
    const score = calculateScore(findings);

    /*
     * AI REASONING
     */
    const aiReasoning =
      await generateAIReasoning(
        input,
        findings,
        score
      );

    /*
     * SUMMARY
     */
    const highCount = findings.filter(
      (finding) =>
        finding.severity === "High"
    ).length;

    const mediumCount = findings.filter(
      (finding) =>
        finding.severity === "Medium"
    ).length;

    let summary =
      "تم إجراء تحليل دفاعي أولي للرابط.";

    if (highCount > 0) {
      summary =
        `تم اكتشاف ${highCount} مؤشر عالي الخطورة. يوصى بالتحقق من الرابط قبل الوثوق به.`;
    } else if (mediumCount > 0) {
      summary =
        `تم اكتشاف ${mediumCount} مؤشر متوسط الخطورة. يوصى بمراجعة النتائج والتحقق من مصدر الرابط.`;
    } else {
      summary =
        "لم يتم اكتشاف مؤشرات قوية ضمن الفحوصات الأساسية. هذا لا يعني أن الموقع آمن بشكل مؤكد.";
    }

    return NextResponse.json({
      score,
      findings,
      summary,
      aiReasoning,
      aiEnabled: Boolean(groq),
      analyzedUrl: input,
      riskLevel:
        score >= 70
          ? "HIGH"
          : score >= 30
          ? "MEDIUM"
          : "LOW",
    });
  } catch (error) {
    console.error(
      "Analysis error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to analyze the request",
      },
      {
        status: 500,
      }
    );
  }
}
