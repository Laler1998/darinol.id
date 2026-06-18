import { NextResponse } from "next/server";

type RiriArticle = {
  title?: string | null;
  source?: string | null;
  url?: string | null;
  publishedAt?: string | null;
};

type RiriTopic = {
  name?: string;
  category?: string;
  radar_type?: "news" | "culture";
  culture_category?: string | null;
  score?: number;
  growth?: string;
};

type RiriRequest = {
  topic?: RiriTopic;
  selectedArticles?: RiriArticle[];
  platform?: string;
  outputFormat?: string;
  prompt?: string;
  plan?: "Free" | "Supporter" | null;
};

function localRiriReply({
  topic,
  selectedArticles = [],
  platform = "TikTok",
  outputFormat = "Full Brief",
  prompt = "",
}: RiriRequest) {
  const topicName = topic?.name ?? "topik ini";
  const isCulture = topic?.radar_type === "culture";
  const article = selectedArticles[0];
  const source = article?.source ?? (isCulture ? "sinyal culture pilihan" : "berita pilihan");
  const title = article?.title ?? topicName;

  if (isCulture) {
    if (outputFormat === "Hook") {
      return `Hook ${platform}:\n\n"${topicName} lagi rame. Kamu pernah ngalamin versi ini juga?"\n\nAlternatif:\n1. POV: ${topicName}, tapi versi anak agency.\n2. Ini format ${topicName} yang gampang kamu recreate hari ini.\n3. Jangan cuma ikut trend, pakai angle yang relate sama niche kamu.`;
    }

    if (outputFormat === "Caption") {
      return `Caption:\n\n${topicName} lagi naik karena formatnya relatable dan gampang direplikasi.\n\nAngle yang bisa dipakai:\n- versi anak agency\n- versi freelancer\n- versi fresh graduate\n- versi introvert\n\nCTA: Kamu paling relate sama versi yang mana?\n\n#creatorindonesia #contentideas #trendkonten`;
    }

    if (outputFormat === "Carousel") {
      return `Carousel idea:\n\n1. ${topicName}\n2. Kenapa format ini gampang relate?\n3. Versi anak agency\n4. Versi freelancer\n5. Versi fresh graduate\n6. Pilih angle yang paling cocok dengan niche kamu`;
    }

    if (outputFormat === "Script") {
      return `Short video script ${platform}:\n\nHook: ${topicName} lagi naik, dan formatnya gampang banget kamu adaptasi.\n\nIsi:\n1. Mulai dengan POV yang relate.\n2. Tunjukkan versi niche kamu.\n3. Tambahkan twist kecil agar tidak terlihat ikut-ikutan.\n\nClose: Mau aku bikinkan versi untuk niche kamu?`;
    }

    return `Brief Riri Culture Radar:\n\nTrend: ${topicName}\nKategori: ${topic?.culture_category ?? topic?.category ?? "culture"}\n\nWhy it is trending:\nFormat ini naik karena relatable, mudah direplikasi, dan cocok untuk short-form content.\n\nSuggested content angles:\n- versi anak agency\n- versi freelancer\n- versi fresh graduate\n- versi introvert\n\nGenerated output:\nHook: "${topicName} lagi rame. Tapi versi kamu yang mana?"\nShort video script: mulai dari POV, tunjukkan situasi, lalu beri twist niche.\nCaption: Pakai format ini untuk bikin audiens merasa, "ini gue banget."\nHashtags: #creatorindonesia #contentideas #trendkonten\nCarousel idea: 5 variasi angle dari trend yang sama.\n\nCatatan: Ini mode hemat biaya. AI penuh bisa diaktifkan untuk akun Supporter.`;
  }

  if (outputFormat === "Hook") {
    return `Hook ${platform}:\n\n"${title}"\n\nAlternatif:\n1. Banyak yang bahas ${topicName}, tapi pemicunya dari berita ini.\n2. Ini update ${topicName} yang perlu kamu tahu hari ini.\n3. Jangan cuma ikut ramai, pahami dulu konteks ${topicName}.`;
  }

  if (outputFormat === "Caption") {
    return `Caption:\n\n${topicName} lagi ramai karena ada update dari ${source}.\n\nIntinya: ${title}\n\nKalau kamu bikin konten dari isu ini, pakai angle yang netral, sebutkan sumber, dan fokus ke konteks yang membantu audiens cepat paham.\n\nPertanyaan: menurut kamu isu ini bakal makin ramai?`;
  }

  if (outputFormat === "Carousel") {
    return `Carousel 6 slide:\n\n1. ${topicName} Lagi Ramai\n2. Berita pemicunya: ${title}\n3. Apa yang terjadi?\n4. Kenapa orang membahasnya?\n5. Dampaknya untuk audiens\n6. Simpan kalau kamu mau pantau update berikutnya`;
  }

  if (outputFormat === "Script") {
    return `Script ${platform}:\n\nHook: ${title}\n\nIsi:\n1. Jelaskan sumber beritanya dari ${source}.\n2. Ringkas apa yang terjadi dalam bahasa sederhana.\n3. Tambahkan kenapa ini penting untuk audiens.\n\nClose: Kamu melihat ini sebagai isu besar atau cuma ramai sebentar?`;
  }

  return `Brief Riri:\n\nTopik: ${topicName}\nPlatform: ${platform}\nFormat: ${outputFormat}\nPertanyaan: ${prompt}\n\nAngle utama: Ubah berita dari ${source} menjadi konten yang cepat dipahami tanpa melebih-lebihkan fakta.\n\nHook: ${title}\n\nStruktur:\n- Mulai dari berita pemicu.\n- Jelaskan konteks dalam 3 poin.\n- Tutup dengan pertanyaan agar audiens ikut diskusi.\n\nCatatan: Ini mode hemat biaya. AI penuh bisa diaktifkan untuk akun Supporter.`;
}

function outputInstructions(format: string) {
  if (format === "Hook") {
    return "Output hanya berisi 5 hook pendek. Setiap hook maksimal 18 kata.";
  }

  if (format === "Script") {
    return "Output berupa script video pendek: Hook, Isi 3 poin, Close. Durasi 35-60 detik.";
  }

  if (format === "Caption") {
    return "Output berupa caption siap pakai: pembuka, konteks singkat, CTA, dan 3 hashtag relevan.";
  }

  if (format === "Carousel") {
    return "Output berupa outline carousel 6 slide. Setiap slide punya judul dan isi singkat.";
  }

  return "Output berupa creator brief lengkap: angle, hook, struktur konten, caption pendek, judul alternatif, dan catatan aman.";
}

function extractResponseText(payload: unknown) {
  if (
    payload &&
    typeof payload === "object" &&
    "output_text" in payload &&
    typeof payload.output_text === "string"
  ) {
    return payload.output_text;
  }

  return null;
}

export async function POST(request: Request) {
  const body = (await request.json()) as RiriRequest;
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

  if (body.plan !== "Supporter") {
    return NextResponse.json({
      source: "free-fallback",
      reply: localRiriReply(body),
    });
  }

  if (!apiKey) {
    return NextResponse.json({
      source: "supporter-fallback",
      reply: localRiriReply(body),
    });
  }

  const topic = body.topic ?? {};
  const isCulture = topic.radar_type === "culture";
  const selectedArticles = body.selectedArticles ?? [];
  const platform = body.platform ?? "TikTok";
  const outputFormat = body.outputFormat ?? "Full Brief";
  const userPrompt = body.prompt ?? "";

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions: [
        "Kamu adalah Riri, AI content specialist dari Darinol.id.",
        isCulture
          ? "User sedang memakai Culture Radar. Gunakan tone creator-native, cepat, relatable, dan cocok untuk short-form content."
          : "User sedang memakai News Radar. Gunakan tone editorial-informatif, jelas, netral, dan berbasis sumber.",
        "Tugasmu mengubah sinyal tren pilihan user menjadi ide konten yang tajam, ringkas, dan siap dipakai kreator.",
        "Gunakan bahasa Indonesia yang natural, tidak kaku, dan tidak terlalu formal.",
        "Jangan mengarang fakta baru. Jika informasi kurang, tulis sebagai catatan untuk verifikasi.",
        isCulture
          ? "Untuk Culture Radar, boleh memberi variasi angle kreator selama tidak mengarang metrik engagement."
          : "Untuk News Radar, selalu berbasis pada artikel yang diberikan user.",
        outputInstructions(outputFormat),
      ].join("\n"),
      input: JSON.stringify({
        topic,
        selectedArticles,
        platform,
        outputFormat,
        userPrompt,
      }),
      temperature: 0.7,
      max_output_tokens: 900,
    }),
  });

  if (!response.ok) {
    return NextResponse.json(
      {
        source: "local-fallback",
        reply: localRiriReply(body),
        error: `OpenAI returned ${response.status}`,
      },
      { status: 200 },
    );
  }

  const payload = await response.json();
  const reply = extractResponseText(payload) ?? localRiriReply(body);

  return NextResponse.json({
    source: "openai",
    reply,
  });
}
