'use client';

import { useCallback, useEffect, useRef } from 'react';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

type Props = {
  onFinished: () => void;
};

export function LandingHeroVideo({ onFinished }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const finishedRef = useRef(false);

  const pauseOnLastFrame = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    const video = videoRef.current;
    if (video && Number.isFinite(video.duration)) {
      video.currentTime = Math.max(0, video.duration - 0.04);
      video.pause();
    }

    onFinished();
  }, [onFinished]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const tryPlay = () => {
      video.muted = true;
      video.play().catch(() => {});
    };

    tryPlay();
    video.addEventListener('loadeddata', tryPlay);
    video.addEventListener('canplay', tryPlay);

    return () => {
      video.removeEventListener('loadeddata', tryPlay);
      video.removeEventListener('canplay', tryPlay);
    };
  }, []);

  return (
    <Box
      component="section"
      aria-label="معرفی اسمارت بتن"
      dir="ltr"
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: '100vw',
        height: { xs: '100svh', md: '100vh' },
        minHeight: { xs: '100svh', md: '100vh' },
        bgcolor: '#000',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 0, md: 3 },
      }}
    >
      <Box
        component="video"
        ref={videoRef}
        src="/hero.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={pauseOnLastFrame}
        sx={{
          display: 'block',
          width: { xs: '100%', md: 'auto' },
          height: { xs: 'auto', md: 'auto' },
          maxWidth: { xs: '100%', md: 'min(1200px, 100%)' },
          maxHeight: { xs: '100svh', md: 'calc(100vh - 48px)' },
          objectFit: 'contain',
          objectPosition: 'center center',
        }}
      />
    </Box>
  );
}
