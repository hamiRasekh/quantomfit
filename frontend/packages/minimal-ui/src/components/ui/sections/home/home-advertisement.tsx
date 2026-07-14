import type { BoxProps } from '@mui/material/Box';

import { m } from 'framer-motion';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';

import { CONFIG } from '@/ui/global-config';
import { varFade, MotionViewport } from '@/components/ui/animate';

import { FloatLine, FloatPlusIcon } from './components/svg-elements';

// ----------------------------------------------------------------------

export function HomeAdvertisement({ sx, ...other }: BoxProps) {
  return (
    <Box
      component="section"
      sx={[{ position: 'relative' }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      <MotionViewport>
        {renderLines()}

        <Container sx={{ position: 'relative', zIndex: 9, maxWidth: { xs: 'lg', md: 'none' }, px: { xs: 1, md: 0 }, py: { xs: 1, md: 0 } }}>
          <Box
            sx={(theme) => ({
              ...theme.mixins.bgGradient({
                images: [
                  `linear-gradient(0deg, ${varAlpha(theme.vars.palette.grey['500Channel'], 0.04)} 1px, transparent 1px)`,
                  `linear-gradient(90deg, ${varAlpha(theme.vars.palette.grey['500Channel'], 0.04)} 1px, transparent 1px)`,
                ],
              }),
              py: { xs: 2, md: 1 },
              px: { xs: 3, md: 1 },
              spacing: 3,
              borderRadius: { xs: 3, md: 0 },
              display: 'flex',
              overflow: 'hidden',
              background: `
                linear-gradient(rgba(136, 0, 194, 0.7), rgba(110, 37, 255, 0.7)),
                url('${CONFIG.assetsDir}/assets/background/header-banner_bg.webp'),
                linear-gradient(0deg, #8800C2 0%, #6E25FF 100%)
              `,
              backgroundSize: 'cover, cover, cover',
              backgroundPosition: 'center, center, center',
              backgroundRepeat: 'no-repeat, no-repeat, no-repeat',
              position: 'relative',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: { xs: 'center', md: 'right' },
              flexDirection: { xs: 'column', md: 'row' },
              border: { xs: `solid 1px ${theme.vars.palette.grey[800]}`, md: 'none' },
            })}
          >
            {renderDescription()}
            {renderImage()}
            {renderBlur()}
          </Box>
        </Container>
      </MotionViewport>
    </Box>
  );
}

// ----------------------------------------------------------------------

const renderLines = () => (
  <>
    <FloatPlusIcon sx={{ left: 72, top: '50%', mt: -1 }} />
    <FloatLine vertical sx={{ top: 0, left: 80, height: 'calc(50% + 64px)' }} />
    <FloatLine sx={{ top: '50%', left: 0 }} />
  </>
);

const renderDescription = () => (
  <Stack spacing={2} sx={{ zIndex: 9 }}>
    <Box
      component={m.h2}
      variants={varFade('inDown', { distance: 24 })}
      sx={{
        m: 0,
        color: 'common.white',
        typography: { xs: 'h3', md: 'h3' },
      }}
      textAlign={{ xs: 'right', md: 'center' }}
    >
      بیش از یک میلیون طرح!
      <br />
      <Box
        component="span"
        sx={{
          fontSize: { xs: '0.8em', md: '0.75em' },
        }}
      >
        ارسال رایگان فقط تا
      </Box>
      <Box
        component="span"
        sx={(theme) => ({
          ...theme.mixins.textGradient(
            `to right, ${theme.vars.palette.common.white}, ${varAlpha(theme.vars.palette.common.whiteChannel, 0.4)}`
          ),
          ml: 1,
          fontSize: { xs: '0.8em', md: '0.75em' },
        })}
      >
        آخر هفته
      </Box>
    </Box>


  </Stack>
);

const renderImage = () => (
  <m.div variants={varFade('inUp')}>
    <Box
      component={m.img}
      animate={{ y: [-20, 0, -20] }}
      transition={{ duration: 4, repeat: Infinity }}
      alt="Voody Application"
      src={`${CONFIG.assetsDir}/assets/banner/home-banner-pic.webp`}
      sx={{
        zIndex: 9,
        width: 140,
        aspectRatio: '1/1',
        position: 'relative',
      }}
    />
  </m.div>
);

const renderBlur = () => (
  <Box
    component="span"
    sx={(theme) => ({
      top: 0,
      right: 0,
      zIndex: 7,
      width: 1,
      opacity: 0.4,
      maxWidth: 200,
      aspectRatio: '1/1',
      position: 'absolute',
      backgroundImage: `radial-gradient(farthest-side at top right, ${theme.vars.palette.grey[500]} 0%, ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)} 75%, transparent 90%)`,
    })}
  />
);
