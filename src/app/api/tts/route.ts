// src/app/api/tts/route.ts
export async function POST(req: Request) {
  const text = await req.text();
  const voice = req.headers.get('x-voice') ?? 'banmai';
  const speed = req.headers.get('x-speed') ?? '0';

  const apiKey = 'WTO3naI1fsZWp81hC0s5md43FKLArUfo';
  if (!apiKey) {
    return Response.json({ error: 1, message: 'Missing API key' }, { status: 500 });
  }

  // 1️⃣ Gọi FPT lấy async link
  const fptRes = await fetch('https://api.fpt.ai/hmi/tts/v5', {
    method: 'POST',
    headers: {
      'api_key': apiKey,
      'voice': voice,
      'speed': speed,
      'format': 'mp3',
    },
    body: text,
  });

  const data = await fptRes.json();

  if (data.error !== 0) {
    return Response.json({ error: data.error, message: data.message }, { status: 400 });
  }

  // 2️⃣ Poll S3 trên server (không bị CORS)
  const audioUrl: string = data.async;
  let audioRes: Response | null = null;

  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const attempt = await fetch(audioUrl);
    if (attempt.ok) {
      audioRes = attempt;
      break;
    }
  }

  if (!audioRes) {
    return Response.json({ error: 1, message: 'Audio not ready' }, { status: 504 });
  }

  // 3️⃣ Stream audio thẳng về browser — không còn CORS
  const audioBuffer = await audioRes.arrayBuffer();

  return new Response(audioBuffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store',
    },
  });
}
