// src/components/stream/stream-player.tsx
'use client';

import { useEffect, useRef } from 'react';

interface StreamPlayerProps {
  url: string;
}

export function StreamPlayer({ url }: StreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!videoRef.current) return;

    let destroyed = false;

    const initPlayer = async () => {
      const flvjs = (await import('flv.js')).default;

      if (destroyed) return;

      if (!flvjs.isSupported()) {
        console.warn('flv.js is not supported in this browser');
        return;
      }

      const player = flvjs.createPlayer(
        {
          type: 'flv',
          url,
          isLive: true,
          hasAudio: true,
          hasVideo: true,
        },
        {
          enableWorker: false,
          enableStashBuffer: false,
          stashInitialSize: 128,
          isLive: true,
          lazyLoad: false,
          liveBufferLatencyChasing: true,
          liveBufferLatencyMaxLatency: 1.5,
          liveBufferLatencyMinRemain: 0.3,
        }
      );

      player.attachMediaElement(videoRef.current!);
      player.load();
      player.play();

      playerRef.current = player;
    };

    initPlayer();

    return () => {
      destroyed = true;

      if (playerRef.current) {
        playerRef.current.pause();
        playerRef.current.unload();
        playerRef.current.detachMediaElement();
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [url]);

  return (
    <video
      ref={videoRef}
      controls
      className="aspect-video w-full bg-black object-cover"
      playsInline
    />
  );
}
