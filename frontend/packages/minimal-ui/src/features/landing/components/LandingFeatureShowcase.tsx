'use client';

import { useEffect, useRef } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { alpha, keyframes, useTheme } from '@mui/material/styles';

import { Iconify } from '@/components/ui/iconify';
import { LANDING_ACCENT, LANDING_SHELL } from '@/shared/theme/landing-shell-theme';

// ----------------------------------------------------------------------

type ShowcaseFeature = {
  id: string;
  title: string;
  color: string;
  centerIcon: string;
  orbitIcons: readonly string[];
};

const SHOWCASE_FEATURES: ShowcaseFeature[] = [
  {
    id: 'sales',
    title: 'سامانه هوشمند فروش و مدیریت مشتریان',
    color: '#F59E0B',
    centerIcon: 'solar:bill-list-bold-duotone',
    orbitIcons: [
      'solar:list-bold',
      'solar:add-circle-bold',
      'solar:calendar-date-bold',
      'solar:wad-of-money-bold',
      'solar:users-group-rounded-bold-duotone',
    ],
  },
  {
    id: 'production',
    title: 'سامانه هوشمند فرایند تولید',
    color: '#10B981',
    centerIcon: 'solar:settings-bold-duotone',
    orbitIcons: [
      'solar:settings-bold-duotone',
      'solar:layers-bold',
      'solar:double-alt-arrow-up-bold-duotone',
      'solar:box-minimalistic-bold',
      'solar:transfer-horizontal-bold-duotone',
    ],
  },
  {
    id: 'finance-hr',
    title: 'سامانه هوشمند واحد مالی و منابع انسانی',
    color: '#3B82F6',
    centerIcon: 'solar:wad-of-money-bold',
    orbitIcons: [
      'solar:wad-of-money-bold',
      'solar:cart-3-bold',
      'solar:box-minimalistic-bold',
      'solar:users-group-rounded-bold-duotone',
      'solar:clock-circle-bold',
    ],
  },
  {
    id: 'logistics',
    title: 'سامانه هوشمند کنترل لجستیک',
    color: '#8B5CF6',
    centerIcon: 'solar:truck-bold-duotone',
    orbitIcons: [
      'solar:list-bold',
      'solar:calendar-date-bold',
      'solar:transfer-horizontal-bold-duotone',
      'solar:ruler-bold',
      'solar:electric-refueling-bold',
    ],
  },
];

const VIEW_W = 960;
const VIEW_H = 380;
const VISIBLE_ARC = 'M 72 252 Q 480 64 888 252';
const ITEM_COUNT = SHOWCASE_FEATURES.length;
const ORBIT_SIZE = 180;
const LABEL_PAD_TOP = 20;
const TRAVEL_MS = 56000;
const ORBIT_SPIN_S = 42;

const P0 = { x: 72, y: 252 };
const P1 = { x: 480, y: 64 };
const P2 = { x: 888, y: 252 };
const ENTER_X = -100;
const EXIT_X = 1060;

const orbitSpin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
`;

const orbitCounter = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// ----------------------------------------------------------------------

function getItemT(phase: number, index: number) {
  const raw = (phase + index / ITEM_COUNT) % 1;
  return -0.12 + raw * 1.44;
}

function getPathPosition(t: number, stageW: number, stageH: number) {
  const sx = stageW / VIEW_W;
  const sy = stageH / VIEW_H;

  if (t <= 0) {
    const u = Math.max(0, Math.min(1, (t + 0.12) / 0.12));
    return { x: (ENTER_X + u * (P0.x - ENTER_X)) * sx, y: P0.y * sy };
  }
  if (t >= 1) {
    const u = Math.max(0, Math.min(1, (t - 1) / 0.12));
    return { x: (P2.x + u * (EXIT_X - P2.x)) * sx, y: P2.y * sy };
  }

  const u = 1 - t;
  return {
    x: (u * u * P0.x + 2 * u * t * P1.x + t * t * P2.x) * sx,
    y: (u * u * P0.y + 2 * u * t * P1.y + t * t * P2.y) * sy,
  };
}

function getOpacity(t: number) {
  if (t < -0.1 || t > 1.1) return 0;
  if (t < 0) return (t + 0.1) / 0.1;
  if (t > 1) return (1.1 - t) / 0.1;
  if (t < 0.14) return t / 0.14;
  if (t > 0.86) return (1 - t) / 0.14;
  return 1;
}

function getScale(t: number) {
  if (t < 0 || t > 1) return 0.88;
  return 0.92 + 0.08 * (1 - Math.abs(t - 0.5) * 2);
}

// ----------------------------------------------------------------------

export function LandingFeatureShowcase() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 5, md: 6 },
        borderTop: `1px solid ${alpha('#fff', 0.06)}`,
        pointerEvents: 'none',
        userSelect: 'none',
        '& *': { pointerEvents: 'none !important' },
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={1} alignItems="center" textAlign="center" sx={{ mb: { xs: 3, md: 2.5 } }}>
          <Typography variant="overline" sx={{ color: LANDING_ACCENT, letterSpacing: 2 }}>
            چهار سامانه یکپارچه
          </Typography>
          <Typography variant="h3" fontWeight={900} sx={{ fontSize: { xs: '1.55rem', md: '2.1rem' } }}>
            ماژول های اصلی اسمارت بتن
          </Typography>
        </Stack>

        {isMobile ? <MobileFeatureList /> : <ArcCarousel />}
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------

function MobileFeatureList() {
  return (
    <Stack spacing={2.5} sx={{ px: { xs: 0.5, sm: 1 } }}>
      {SHOWCASE_FEATURES.map((feature) => (
        <Box
          key={feature.id}
          sx={{
            direction: 'rtl',
            borderRadius: 3,
            border: `1px solid ${alpha('#fff', 0.09)}`,
            bgcolor: alpha('#fff', 0.03),
            overflow: 'hidden',
            p: { xs: 2, sm: 2.5 },
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                flexShrink: 0,
                display: 'grid',
                placeItems: 'center',
                bgcolor: alpha(feature.color, 0.16),
                border: `1px solid ${alpha(feature.color, 0.35)}`,
                boxShadow: `0 0 18px ${alpha(feature.color, 0.18)}`,
              }}
            >
              <Iconify icon={feature.centerIcon} width={22} sx={{ color: feature.color }} />
            </Box>
            <Typography
              variant="subtitle1"
              fontWeight={800}
              sx={{
                flex: 1,
                textAlign: 'right',
                fontSize: { xs: '0.92rem', sm: '1rem' },
                lineHeight: 1.55,
                color: alpha('#fff', 0.95),
              }}
            >
              {feature.title}
            </Typography>
          </Stack>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              overflow: 'hidden',
              mx: 'auto',
              width: '100%',
              maxWidth: 200,
            }}
          >
            <Box sx={{ transform: 'scale(0.72)', transformOrigin: 'top center' }}>
              <OrbitNode feature={feature} />
            </Box>
          </Box>
        </Box>
      ))}
    </Stack>
  );
}

// ----------------------------------------------------------------------

function ArcCarousel() {
  const stageRef = useRef<HTMLDivElement>(null);
  const moverRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    let rafId = 0;
    const start = performance.now();

    const frame = (now: number) => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;

      if (w > 0 && h > 0) {
        const phase = ((now - start) % TRAVEL_MS) / TRAVEL_MS;

        for (let i = 0; i < ITEM_COUNT; i += 1) {
          const mover = moverRefs.current[i];
          if (!mover) continue;

          const t = getItemT(phase, i);
          const { x, y } = getPathPosition(t, w, h);
          const opacity = getOpacity(t);
          const scale = getScale(t);

          mover.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, calc(-50% + ${LABEL_PAD_TOP / 2}px)) scale(${scale})`;
          mover.style.opacity = String(opacity);
          mover.style.zIndex = String(Math.round(opacity * 100 + scale * 10));
          mover.style.visibility = opacity <= 0.01 ? 'hidden' : 'visible';
        }
      }

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <Box
      ref={stageRef}
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: VIEW_W,
        height: { xs: 360, md: VIEW_H },
        mx: 'auto',
        direction: 'ltr',
        overflow: 'hidden',
      }}
    >
      <Box
        component="svg"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        <path
          d={VISIBLE_ARC}
          fill="none"
          stroke={alpha('#fff', 0.14)}
          strokeWidth="1.5"
          strokeDasharray="5 7"
        />
        <path
          d={VISIBLE_ARC}
          fill="none"
          stroke={alpha(LANDING_ACCENT, 0.2)}
          strokeWidth="8"
          strokeLinecap="round"
          style={{ filter: 'blur(8px)' }}
        />
      </Box>

      {SHOWCASE_FEATURES.map((feature, index) => (
        <div
          key={feature.id}
          ref={(el) => {
            moverRefs.current[index] = el;
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: ORBIT_SIZE,
            height: ORBIT_SIZE + LABEL_PAD_TOP,
            visibility: 'hidden',
            willChange: 'transform, opacity',
          }}
        >
          <CurvedArcLabel title={feature.title} color={feature.color} id={feature.id} />
          <Box sx={{ position: 'absolute', left: 0, bottom: 0, width: ORBIT_SIZE, height: ORBIT_SIZE }}>
            <OrbitNode feature={feature} />
          </Box>
        </div>
      ))}
    </Box>
  );
}

function CurvedArcLabel({ title, color, id }: { title: string; color: string; id: string }) {
  const pathId = `arc-label-${id}`;
  const fontSize = title.length > 36 ? 9.4 : title.length > 28 ? 10 : 10.6;
  const labelW = ORBIT_SIZE + 76;
  const labelH = 28;
  const padTop = 18;
  const padX = 10;
  const cx = labelW / 2;
  const arcY = labelH - 2;
  const halfChord = (labelW - 24) / 2;
  const sagitta = 10;
  const arcR = (halfChord * halfChord + sagitta * sagitta) / (2 * sagitta);
  const arcPath = `M ${cx - halfChord} ${arcY} A ${arcR} ${arcR} 0 0 1 ${cx + halfChord} ${arcY}`;

  return (
    <Box
      component="svg"
      viewBox={`${-padX} ${-padTop} ${labelW + padX * 2} ${labelH + padTop}`}
      sx={{
        position: 'absolute',
        left: '50%',
        bottom: `${ORBIT_SIZE - 10}px`,
        transform: 'translateX(-50%)',
        width: labelW + padX * 2,
        height: labelH + padTop,
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      <defs>
        <path id={pathId} d={arcPath} fill="none" />
      </defs>
      <text
        fill={alpha('#fff', 0.97)}
        fontSize={fontSize}
        fontWeight="800"
        style={{ fontFamily: 'inherit', letterSpacing: '-0.015em' }}
      >
        <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
          {title}
        </textPath>
      </text>
      <path
        d={arcPath}
        fill="none"
        stroke={alpha(color, 0.28)}
        strokeWidth="1"
        strokeDasharray="3 5"
      />
    </Box>
  );
}

function OrbitNode({ feature }: { feature: ShowcaseFeature }) {
  const icons = feature.orbitIcons;
  const count = icons.length;
  const step = 360 / count;
  const start = -90 + step / 2;
  const radius = 71;

  return (
    <Box
      sx={{
        position: 'relative',
        width: ORBIT_SIZE,
        height: ORBIT_SIZE,
        direction: 'ltr',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: -10,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(feature.color, 0.18)} 0%, transparent 68%)`,
          pointerEvents: 'none',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `1px dashed ${alpha(feature.color, 0.35)}`,
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: '8%',
          borderRadius: '50%',
          border: `1.5px solid ${alpha(feature.color, 0.4)}`,
          boxShadow: `0 0 24px ${alpha(feature.color, 0.15)}`,
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: '24%',
          borderRadius: '50%',
          bgcolor: alpha(LANDING_SHELL.bg, 0.95),
          border: `1px solid ${alpha(feature.color, 0.3)}`,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Box
          sx={{
            width: 58,
            height: 58,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: alpha(feature.color, 0.15),
            border: `1px solid ${alpha(feature.color, 0.45)}`,
            boxShadow: `0 0 22px ${alpha(feature.color, 0.25)}`,
          }}
        >
          <Iconify icon={feature.centerIcon} width={34} sx={{ color: feature.color }} />
        </Box>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          animation: `${orbitSpin} ${ORBIT_SPIN_S}s linear infinite`,
        }}
      >
        {icons.map((icon, i) => {
          const angle = start + step * i;
          return (
            <Box
              key={`${feature.id}-${i}`}
              sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 36,
                height: 36,
                marginLeft: '-18px',
                marginTop: '-18px',
                transform: `rotate(${angle}deg) translateX(${radius}px)`,
                transformOrigin: 'center',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: alpha(LANDING_SHELL.bg, 0.97),
                  border: `1px solid ${alpha(feature.color, 0.45)}`,
                  boxShadow: `0 2px 8px ${alpha('#000', 0.35)}`,
                  animation: `${orbitCounter} ${ORBIT_SPIN_S}s linear infinite`,
                }}
              >
                <Iconify icon={icon} width={19} sx={{ color: feature.color }} />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
