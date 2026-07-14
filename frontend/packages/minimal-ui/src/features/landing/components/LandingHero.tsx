'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { Iconify } from '@/components/ui/iconify';
import { LANDING_ACCENT, LANDING_SHELL } from '@/shared/theme/landing-shell-theme';

import { LandingHeroVideo } from './LandingHeroVideo';

// ----------------------------------------------------------------------

const TITLE_WORDS = ['پلتفرم', 'هوشمند', 'مدیریت', 'کارخانه', 'بتن'];
const SCROLL_DELAY_MS = 1400;

const FLOATING_PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: 4 + (i % 3) * 2,
  x: (i * 17 + 11) % 100,
  y: (i * 23 + 7) % 100,
  delay: i * 0.35,
  duration: 4 + (i % 4),
}));

// ----------------------------------------------------------------------

type Props = {
  onOpenLogin: () => void;
};

export function LandingHero({ onOpenLogin }: Props) {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentReady, setContentReady] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 80, damping: 20, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const spotlightX = useTransform(smoothX, [-0.5, 0.5], ['30%', '70%']);
  const spotlightY = useTransform(smoothY, [-0.5, 0.5], ['20%', '60%']);
  const gridShiftX = useTransform(smoothX, [-0.5, 0.5], [8, -8]);
  const gridShiftY = useTransform(smoothY, [-0.5, 0.5], [8, -8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = contentRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleVideoFinished = () => {
    window.setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setContentReady(true);
    }, SCROLL_DELAY_MS);
  };

  return (
    <>
      <LandingHeroVideo onFinished={handleVideoFinished} />

      <Box
        ref={contentRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        sx={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <MouseGlow x={spotlightX} y={spotlightY} />
        <MouseGridShift x={gridShiftX} y={gridShiftY} />

        {FLOATING_PARTICLES.map((p) => (
          <FloatingParticle key={p.id} {...p} mouseX={smoothX} mouseY={smoothY} />
        ))}

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: { xs: 10, md: 12 } }}>
          <Stack spacing={4} alignItems="center" textAlign="center">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={contentReady ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  px: 2.5,
                  py: 0.85,
                  borderRadius: 10,
                  bgcolor: alpha(LANDING_ACCENT, 0.1),
                  border: `1px solid ${alpha(LANDING_ACCENT, 0.35)}`,
                  boxShadow: `0 0 32px ${alpha(LANDING_ACCENT, 0.15)}`,
                }}
              >
                <Typography variant="caption" fontWeight={700} sx={{ color: LANDING_ACCENT, letterSpacing: 1 }}>
                  اسمارت بتن نسل جدید سامانه مدیریت کارخانه
                </Typography>
              </Box>
            </motion.div>

            <Typography
              component="h1"
              sx={{
                fontSize: { xs: '2.25rem', sm: '3rem', md: '3.75rem', lg: '4.25rem' },
                fontWeight: 900,
                lineHeight: 1.2,
                maxWidth: 900,
              }}
            >
              {TITLE_WORDS.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 48, rotateX: -40 }}
                  animate={contentReady ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 48, rotateX: -40 }}
                  transition={{
                    duration: 0.7,
                    delay: contentReady ? 0.15 + i * 0.12 : 0,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{
                    display: 'inline-block',
                    marginInline: '0.12em',
                    background:
                      i >= 3
                        ? `linear-gradient(135deg, ${LANDING_ACCENT} 0%, #FBBF24 100%)`
                        : `linear-gradient(135deg, #FFFFFF 0%, ${alpha('#fff', 0.8)} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </Typography>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={contentReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.7, delay: contentReady ? 0.9 : 0 }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: alpha('#fff', 0.62),
                  maxWidth: 580,
                  mx: 'auto',
                  lineHeight: 1.95,
                  fontSize: { xs: '1rem', md: '1.1rem' },
                }}
              >
                از مالی و تولید تا طرح اختلاط هوشمند — همه‌چیز در یک پلتفرم یکپارچه
                برای کارخانه‌های بتن آماده
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={contentReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
              transition={{ duration: 0.7, delay: contentReady ? 1.1 : 0 }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={onOpenLogin}
                endIcon={<Iconify icon="solar:arrow-left-linear" width={20} />}
                sx={{
                  minWidth: 180,
                  px: 4,
                  bgcolor: LANDING_ACCENT,
                  color: LANDING_SHELL.bg,
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                  boxShadow: `0 8px 32px ${alpha(LANDING_ACCENT, 0.35)}`,
                  '&:hover': {
                    bgcolor: '#D97706',
                    boxShadow: `0 12px 40px ${alpha(LANDING_ACCENT, 0.45)}`,
                  },
                }}
              >
                ورود به پنل
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={contentReady ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: contentReady ? 1.4 : 0 }}
            >
              <Button
                size="small"
                onClick={() => router.push('/admin/login')}
                sx={{ color: alpha('#fff', 0.45), '&:hover': { color: alpha('#fff', 0.75) } }}
              >
                پنل مدیریت سازمانی
              </Button>
            </motion.div>
          </Stack>
        </Container>

        {contentReady && <ScrollHint />}
      </Box>
    </>
  );
}

// ----------------------------------------------------------------------

function MouseGlow({ x, y }: { x: MotionValue<string>; y: MotionValue<string> }) {
  const background = useMotionTemplate`radial-gradient(600px circle at ${x} ${y}, ${alpha(LANDING_ACCENT, 0.14)} 0%, transparent 65%)`;

  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        background,
      }}
    />
  );
}

function MouseGridShift({ x, y }: { x: MotionValue<number>; y: MotionValue<number> }) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: -20,
        pointerEvents: 'none',
        zIndex: 0,
        x,
        y,
        opacity: 0.06,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    />
  );
}

function FloatingParticle({
  size,
  x,
  y,
  delay,
  duration,
  mouseX,
  mouseY,
}: {
  size: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}) {
  const parallaxX = useTransform(mouseX, [-0.5, 0.5], [-12 - size, 12 + size]);
  const parallaxY = useTransform(mouseY, [-0.5, 0.5], [-12 - size, 12 + size]);

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: '50%',
        background: alpha(LANDING_ACCENT, 0.35),
        boxShadow: `0 0 ${size * 3}px ${alpha(LANDING_ACCENT, 0.25)}`,
        x: parallaxX,
        y: parallaxY,
        pointerEvents: 'none',
        zIndex: 1,
      }}
      animate={{ opacity: [0.2, 0.7, 0.2], scale: [1, 1.4, 1] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function ScrollHint() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2 }}
      style={{
        position: 'absolute',
        bottom: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2,
      }}
    >
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Stack alignItems="center" spacing={0.5}>
          <Typography variant="caption" sx={{ color: alpha('#fff', 0.35) }}>
            امکانات
          </Typography>
          <Iconify icon="solar:alt-arrow-down-linear" width={20} sx={{ color: alpha(LANDING_ACCENT, 0.6) }} />
        </Stack>
      </motion.div>
    </motion.div>
  );
}
