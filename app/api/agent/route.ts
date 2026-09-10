import { generateText } from "ai";
import { NextResponse } from "next/server";
import { getTrendRadarModel } from "@/lib/openrouter";

type AgentTopic = {
  name?: string;
  category?: string;
  score?: number;
  growth?: string;
  source?: string;
  articles?: Array<{ title?: string; source?: string }>;
};

type AgentRequest = {
  message?: string;
  topics?: AgentTopic[];
};

const systemPrompt = `Kamu adalah Darinol Radar Assistant. Jawab dalam Bahasa Indonesia kecuali pengguna meminta bahasa lain.
Gunakan hanya konteks topik yang diberikan. Jangan mengarang angka, sumber, atau fakta yang tidak ada di konteks.
Berikan jawaban praktis untuk creator: jelaskan sinyal, peluang angle konten, dan caveat jika datanya terbatas.
Jangan menyalin artikel sumber. Ringkas dengan kata-kata sendiri dan arahkan pengguna ke sumber asli bila relevan.
Jawaban maksimal 180 kata dan gunakan paragraf atau bullet singkat.`;

export async function POST(request: Request) {
  const model = getTrendRadarModel();
  if (!model) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY belum dikonfigurasi di server." },
      { status: 503 },
    );
  }

  let body: AgentRequest;
  try {
    body = (await request.json()) as AgentRequest;
  } catch {
    return NextResponse.json({ error: "Request tidak valid." }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message || message.length > 600) {
    return NextResponse.json(
      { error: "Pertanyaan wajib diisi dan maksimal 600 karakter." },
      { status: 400 },
    );
  }

  const topics = (body.topics ?? []).slice(0, 12).map((topic) => ({
    name: topic.name,
    category: topic.category,
    score: topic.score,
    growth: topic.growth,
    source: topic.source,
    articles: (topic.articles ?? []).slice(0, 3),
  }));

  try {
    const result = await generateText({
      model,
      system: systemPrompt,
      prompt: `Pertanyaan pengguna:\n${message}\n\nKonteks Trend Radar:\n${JSON.stringify(topics)}`,
      maxOutputTokens: 280,
    });

    return NextResponse.json({ answer: result.text });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error
          ? `Agent gagal merespons: ${error.message}`
          : "Agent gagal merespons.",
      },
      { status: 502 },
    );
  }
}
