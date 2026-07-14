'use client';

import { motion } from 'framer-motion';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { Iconify } from '@/components/ui/iconify';
import { LANDING_ACCENT, LANDING_SHELL } from '@/shared/theme/landing-shell-theme';

// ----------------------------------------------------------------------

type ModuleCard = {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  badgeIcon: string;
  badgeColor: string;
};

const MODULE_CARDS: ModuleCard[] = [
  {
    id: 'mix-design',
    title: 'طرح اختلاط بتن',
    description:
      'پیش‌بینی، ساختن و بهینه‌سازی فرمولاسیون دقیقاً مطابق با وضعیت فعلی دپوی شما',
    imageSrc: '/آزمایشگاه.png',
    badgeIcon: 'solar:box-minimalistic-bold',
    badgeColor: '#22C55E',
  },
  {
    id: 'orders',
    title: 'مدیریت سفارشات',
    description:
      'ثبت سفارش، زمان‌بندی تحویل، پیگیری پرداخت و CRM مشتریان در یک جریان یکپارچه.',
    imageSrc: '/Gemini_Generated_Image_ftn022ftn022ftn0.png',
    badgeIcon: 'solar:bill-list-bold',
    badgeColor: '#3B82F6',
  },
  {
    id: 'materials',
    title: 'مواد اولیه تولید',
    description: 'انبارگردانی، دسته‌بندی و به‌روز رسانی برخط وضعیت مصالح تولید بتن',
    imageSrc: '/مواد اولیه .png',
    badgeIcon: 'solar:cart-3-bold',
    badgeColor: '#F59E0B',
  },
  {
    id: 'fleet',
    title: 'ناوگان و ردیابی',
    description:
      'مدیریت میکسرها، مدیریت محاسبه خودکار سود و زیان، داشبورد گزارش‌های مدیریتی جامع.',
    imageSrc: '/ناوگان.png',
    badgeIcon: 'solar:truck-bold-duotone',
    badgeColor: '#A855F7',
  },
  {
    id: 'hr',
    title: 'منابع انسانی',
    description: 'پرسنل، شیفت‌ها، حضور و غیاب، حقوق و دستمزد و مدیریت رانندگان.',
    imageSrc: '/منابع انسانی .png',
    badgeIcon: 'solar:users-group-rounded-bold',
    badgeColor: '#EC4899',
  },
  {
    id: 'finance',
    title: 'مالی و گزارشات',
    description:
      'جریان نقدینگی، مطالبات، بدهی‌ها، محاسبه خودکار سود و زیان، داشبورد گزارش‌های مدیریتی جامع.',
    imageSrc: '/مالی.png',
    badgeIcon: 'solar:chart-square-outline',
    badgeColor: '#14B8A6',
  },
];

// ----------------------------------------------------------------------

export function LandingModuleGrid() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 7, md: 9 },
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ mb: { xs: 4, md: 5 } }}>
          <Typography variant="overline" sx={{ color: LANDING_ACCENT, letterSpacing: 2, fontWeight: 700 }}>
            قابلیت‌ها
          </Typography>
          <Typography
            variant="h3"
            fontWeight={900}
            sx={{ fontSize: { xs: '1.65rem', sm: '2rem', md: '2.35rem' }, lineHeight: 1.35 }}
          >
            ماژول‌های تخصصی صنعت بتن
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: alpha('#fff', 0.58),
              maxWidth: 620,
              lineHeight: 1.9,
              fontSize: { xs: '0.95rem', md: '1.02rem' },
            }}
          >
            هر بخش کارخانه شما با ابزارهای اختصاصی پوشش داده شده است.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: { xs: 2, md: 2.5 },
          }}
        >
          {MODULE_CARDS.map((module, index) => (
            <ModuleCardItem key={module.id} module={module} index={index} />
          ))}
        </Box>
      </Container>
    </Box>
  );
}

function ModuleCardItem({ module, index }: { module: ModuleCard; index: number }) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        position: 'relative',
        minHeight: { xs: 'auto', md: 188 },
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${alpha('#fff', 0.09)}`,
        background: `linear-gradient(145deg, ${alpha('#fff', 0.07)} 0%, ${alpha('#fff', 0.02)} 100%)`,
        backdropFilter: 'blur(14px)',
        boxShadow: `inset 0 1px 0 ${alpha('#fff', 0.08)}, 0 18px 40px ${alpha('#000', 0.22)}`,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 100% 0%, ${alpha(module.badgeColor, 0.1)} 0%, transparent 52%)`,
          pointerEvents: 'none',
        }}
      />

      <Box
        dir="ltr"
        sx={{
          position: 'relative',
          height: '100%',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '126px 1fr' },
          gridTemplateRows: { xs: 'auto auto', sm: '1fr' },
          columnGap: { xs: 0, sm: 2 },
          rowGap: { xs: 1.5, sm: 0 },
          alignItems: 'center',
          p: { xs: 2, md: 2.25 },
        }}
      >
        <Box
          sx={{
            gridColumn: { xs: '1', sm: '1' },
            gridRow: { xs: '1', sm: '1' },
            width: { xs: '100%', sm: 126 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            component="img"
            src={module.imageSrc}
            alt={module.title}
            sx={{
              width: '100%',
              maxHeight: { xs: 118, md: 132 },
              objectFit: 'contain',
              filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.35))',
            }}
          />
        </Box>

        <Stack
          dir="rtl"
          spacing={1.25}
          sx={{
            gridColumn: { xs: '1', sm: '2' },
            gridRow: { xs: '2', sm: '1' },
            minWidth: 0,
            width: '100%',
            alignItems: 'stretch',
            justifyContent: 'center',
            textAlign: 'left',
          }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.5,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              bgcolor: alpha(module.badgeColor, 0.16),
              border: `1px solid ${alpha(module.badgeColor, 0.35)}`,
              boxShadow: `0 0 18px ${alpha(module.badgeColor, 0.18)}`,
            }}
          >
            <Iconify icon={module.badgeIcon} width={18} sx={{ color: module.badgeColor }} />
          </Box>

          <Typography
            variant="subtitle1"
            align="left"
            sx={{
              width: '100%',
              textAlign: 'left',
              color: LANDING_SHELL.text,
              fontWeight: 800,
              fontSize: { xs: '0.98rem', md: '1.05rem' },
              lineHeight: 1.45,
            }}
          >
            {module.title}
          </Typography>

          <Typography
            variant="body2"
            align="left"
            sx={{
              width: '100%',
              textAlign: 'left',
              color: alpha('#fff', 0.56),
              lineHeight: 1.85,
              fontSize: { xs: '0.78rem', md: '0.82rem' },
            }}
          >
            {module.description}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
