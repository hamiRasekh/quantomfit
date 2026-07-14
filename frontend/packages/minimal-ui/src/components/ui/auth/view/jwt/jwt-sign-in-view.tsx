'use client';

import * as z from 'zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { alpha } from '@mui/material/styles';

import { useRouter } from '@/ui/routes/hooks';
import { usePathname } from '@/components/ui/routes/hooks';
import { RouterLink } from '@/ui/routes/components';

import { Iconify } from '@/components/ui/iconify';
import { Form, Field, schemaUtils } from '@/components/ui/hook-form';
import { useTranslate } from '@/ui/locales';

import { IndustrialLoginField } from '../../components/industrial-login-field';
import { useAuthContext } from '../../hooks';
import { getErrorMessage } from '../../utils';
import { FormHead } from '../../components/form-head';
import { signInWithPassword } from '../../context/jwt';
import { TENANT_SLUG_STORAGE_KEY } from '../../context/jwt/constant';
import {
  LOGIN_PAGE,
  loginFormFieldSx,
  loginSubmitButtonSx,
} from '@/shared/theme/login-page-theme';

// ----------------------------------------------------------------------

export type SignInSchemaType = z.infer<typeof SignInSchema>;

export const SignInSchema = z.object({
  tenantSlug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]*$/, { error: 'فقط حروف انگلیسی کوچک، عدد و خط تیره مجاز است.' }),
  email: schemaUtils.email(),
  password: z
    .string()
    .min(1, { error: 'رمز عبور الزامی است!' })
    .min(6, { error: 'رمز عبور باید حداقل ۶ کاراکتر باشد!' }),
}).superRefine((data, ctx) => {
  if (!data.tenantSlug) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['tenantSlug'],
      message: 'شناسه کارخانه الزامی است.',
    });
  }
});

// ----------------------------------------------------------------------

type JwtSignInViewProps = {
  showHead?: boolean;
  variant?: 'default' | 'industrial';
};

export function JwtSignInView({ showHead = true, variant = 'default' }: JwtSignInViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslate('auth');

  const showPassword = useBoolean();

  const { checkUserSession } = useAuthContext();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const routeTenantSlug = (() => {
    const tenantRouteMatch = pathname.match(/^\/([a-z0-9-]+)\/login$/);
    if (tenantRouteMatch?.[1]) return tenantRouteMatch[1];
    const legacyMatch = pathname.match(/^\/t\/([a-z0-9-]+)\/login$/);
    return legacyMatch?.[1] || '';
  })();

  const defaultValues: SignInSchemaType = {
    tenantSlug: '',
    email: '',
    password: '',
  };

  const methods = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });

  useEffect(() => {
    if (routeTenantSlug) {
      sessionStorage.setItem(TENANT_SLUG_STORAGE_KEY, routeTenantSlug);
      localStorage.setItem(TENANT_SLUG_STORAGE_KEY, routeTenantSlug);
      methods.setValue('tenantSlug', routeTenantSlug);
      return;
    }

    const stored =
      sessionStorage.getItem(TENANT_SLUG_STORAGE_KEY) ||
      localStorage.getItem(TENANT_SLUG_STORAGE_KEY);
    if (stored) {
      methods.setValue('tenantSlug', stored);
    }
  }, [methods, routeTenantSlug]);

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signInWithPassword({
        tenantSlug: data.tenantSlug,
        email: data.email,
        password: data.password,
      });
      await checkUserSession?.();

      // Redirect to dashboard after successful login
      const returnTo = new URLSearchParams(window.location.search).get('returnTo');
      const storedSlug =
        sessionStorage.getItem(TENANT_SLUG_STORAGE_KEY) ||
        localStorage.getItem(TENANT_SLUG_STORAGE_KEY);
      const fallbackPath =
        routeTenantSlug || storedSlug
          ? `/${routeTenantSlug || storedSlug}/dashboard`
          : '/login';
      const target = returnTo || fallbackPath;

      if (routeTenantSlug) {
        window.location.href = target;
        return;
      }

      router.push(target);
      router.refresh();
    } catch (error) {
      console.error(error);
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
    }
  });

  const isIndustrial = variant === 'industrial';

  const renderIndustrialForm = () => (
    <Box sx={loginFormFieldSx()}>
      {!routeTenantSlug && (
        <IndustrialLoginField
          name="tenantSlug"
          label="شناسه کارخانه"
          placeholder="karaj-batching"
          autoComplete="organization"
        />
      )}

      <IndustrialLoginField
        name="email"
        label={t('jwt.signIn.emailLabel')}
        placeholder="name@company.com"
        autoComplete="email"
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        <Link
          component={RouterLink}
          href="#"
          variant="body2"
          color="inherit"
          sx={{
            color: LOGIN_PAGE.textMuted,
            textAlign: 'left',
            alignSelf: 'stretch',
            '&:hover': { color: LOGIN_PAGE.accent },
          }}
        >
          {t('jwt.signIn.forgotPassword')}
        </Link>

        <IndustrialLoginField
          name="password"
          label={t('jwt.signIn.passwordLabel')}
          placeholder={t('jwt.signIn.passwordPlaceholder')}
          type={showPassword.value ? 'text' : 'password'}
          autoComplete="current-password"
          endAdornment={
            <InputAdornment position="end">
              <IconButton onClick={showPassword.onToggle} edge="end" tabIndex={-1}>
                <Iconify
                  icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                  sx={{ color: LOGIN_PAGE.textMuted }}
                />
              </IconButton>
            </InputAdornment>
          }
        />
      </Box>

      <Button
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator={t('jwt.signIn.submitting')}
        sx={loginSubmitButtonSx()}
      >
        {t('jwt.signIn.submitButton')}
      </Button>
    </Box>
  );

  const renderDefaultForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      {!routeTenantSlug && (
        <Field.Text
          name="tenantSlug"
          label="شناسه کارخانه"
          placeholder="karaj-batching"
          slotProps={{ inputLabel: { shrink: true } }}
        />
      )}

      <Field.Text
        name="email"
        label={t('jwt.signIn.emailLabel')}
        placeholder="name@company.com"
        slotProps={{ inputLabel: { shrink: true }, htmlInput: { autoComplete: 'email' } }}
      />

      <Box sx={{ gap: 1.5, display: 'flex', flexDirection: 'column' }}>
        <Link
          component={RouterLink}
          href="#"
          variant="body2"
          color="inherit"
          sx={{ alignSelf: 'flex-end' }}
        >
          {t('jwt.signIn.forgotPassword')}
        </Link>

        <Field.Text
          name="password"
          label={t('jwt.signIn.passwordLabel')}
          placeholder={t('jwt.signIn.passwordPlaceholder')}
          type={showPassword.value ? 'text' : 'password'}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { autoComplete: 'current-password' },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={showPassword.onToggle} edge="end">
                    <Iconify
                      icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <Button
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator={t('jwt.signIn.submitting')}
      >
        {t('jwt.signIn.submitButton')}
      </Button>
    </Box>
  );

  const renderForm = () => (isIndustrial ? renderIndustrialForm() : renderDefaultForm());

  return (
    <>
      {showHead && (
        <FormHead
          title={t('jwt.signIn.title')}
          description={
            <>
              {t('jwt.signIn.noAccount')}{' '}
              <Link href="mailto:support@batching.ir" variant="subtitle2">
                {t('jwt.signIn.getStarted')}
              </Link>
            </>
          }
          sx={{ textAlign: { xs: 'center', md: 'left' } }}
        />
      )}

      {!!errorMessage && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            ...(isIndustrial && {
              bgcolor: alpha(LOGIN_PAGE.accent, 0.12),
              color: LOGIN_PAGE.text,
              border: `1px solid ${alpha(LOGIN_PAGE.accent, 0.35)}`,
              '& .MuiAlert-icon': { color: LOGIN_PAGE.accent },
            }),
          }}
        >
          {errorMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>
    </>
  );
}
