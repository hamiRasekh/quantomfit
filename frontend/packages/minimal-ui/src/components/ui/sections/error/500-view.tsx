'use client';

import { m } from 'framer-motion';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { RouterLink } from '@/ui/routes/components';

import { SimpleLayout } from '@/ui/layouts/simple';
import { useTranslate } from '@/ui/locales/use-locales';
import { ServerErrorIllustration } from '@/ui/assets/illustrations';
import { varBounce, MotionContainer } from '@/components/ui/animate';

// ----------------------------------------------------------------------

export function View500() {
  const { t } = useTranslate('common');

  return (
    <SimpleLayout
      slotProps={{
        content: { compact: true },
      }}
    >
      <Container component={MotionContainer}>
        <m.div variants={varBounce('in')}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            {t('serverError.title')}
          </Typography>
        </m.div>

        <m.div variants={varBounce('in')}>
          <Typography sx={{ color: 'text.secondary' }}>
            {t('serverError.description')}
          </Typography>
        </m.div>

        <m.div variants={varBounce('in')}>
          <ServerErrorIllustration sx={{ my: { xs: 5, sm: 10 } }} />
        </m.div>

        <Button
          component={RouterLink}
          href="/"
          size="large"
          variant="contained"
          color="primary"
        >
          {t('serverError.goToHome')}
        </Button>
      </Container>
    </SimpleLayout>
  );
}
