import { NextResponse } from "next";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL" },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are CyberShield AI, a defensive cybersecurity analyst. Analyze security indicators carefully. Never claim a URL is malicious without evidence.",
        },
        {
          role: "user",
          content: `Analyze this URL from a defensive cybersecurity perspective:

${parsedUrl.toString()}

Provide:
- Risk score from 0 to 100
- Risk level
- Suspicious indicators
- Defensive recommendations

Clearly separate observations from assumptions.`,
        },
      ],
    });

    const analysis =
      completion.choices[0]?.message?.content ||
      "No analysis returned.";

    return NextResponse.json({
      success: true,
      url: parsedUrl.toString(),
      analysis,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "AI analysis failed" },
      { status: 500 }
    );
  }
}
