// src/lib/tts.ts

export type FptVoice =
  | 'banmai' | 'lannhi' | 'leminh'
  | 'myan'   | 'thuminh' | 'giahuy' | 'linhsan';

let currentAudio: HTMLAudioElement | null = null;

export async function speakVietnamese(
  text: string,
  voice: FptVoice = 'banmai',
  speed = 0,
): Promise<void> {
  cancelSpeech();

  try {
    // Proxy trả thẳng audio blob — không còn CORS
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'x-voice': voice,
        'x-speed': String(speed),
      },
      body: text,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('❌ TTS error:', err);
      return;
    }

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);

    const audio = new Audio(objectUrl);
    currentAudio = audio;

    audio.play();

    audio.onended = () => {
      URL.revokeObjectURL(objectUrl);
      currentAudio = null;
    };
    audio.onerror = (e) => {
      console.error('❌ Audio playback error:', e);
      URL.revokeObjectURL(objectUrl);
      currentAudio = null;
    };
  } catch (err) {
    console.error('❌ speakVietnamese error:', err);
  }
}

export function cancelSpeech() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
}
