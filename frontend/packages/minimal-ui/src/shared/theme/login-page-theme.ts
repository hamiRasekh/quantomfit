import { alpha } from '@mui/material/styles';

export const LOGIN_BG_IMAGE = '/assets/login-background.png';

export const LOGIN_PAGE = {
  bg: '#050a0f',
  accent: '#c41e24',
  accentHover: '#a0181e',
  accentBlue: '#1e3a5f',
  accentBlueLight: '#2d5a8e',
  text: '#F8FAFC',
  textMuted: alpha('#F8FAFC', 0.62),
  textSoft: alpha('#F8FAFC', 0.82),
  border: alpha('#fff', 0.1),
  borderStrong: alpha('#fff', 0.16),
  cardBg: alpha('#0a1420', 0.72),
  inputBg: alpha('#0a1420', 0.92),
} as const;

const autofillBg = alpha('#0a1420', 0.98);

export function loginOutlinedInputSx() {
  return {
    color: LOGIN_PAGE.text,
    bgcolor: LOGIN_PAGE.inputBg,
    borderRadius: 2,
    fontSize: '0.95rem',
    '& .MuiOutlinedInput-input': {
      py: 1.35,
      px: 1.75,
      textAlign: 'left',
    },
    '& fieldset': {
      borderColor: alpha('#fff', 0.14),
    },
    '&:hover fieldset': {
      borderColor: alpha('#fff', 0.24),
    },
    '&.Mui-focused fieldset': {
      borderColor: alpha(LOGIN_PAGE.accent, 0.7),
      boxShadow: `0 0 0 3px ${alpha(LOGIN_PAGE.accent, 0.14)}`,
    },
    '&.Mui-error fieldset': {
      borderColor: alpha(LOGIN_PAGE.accent, 0.85),
    },
    '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus': {
      WebkitBoxShadow: `0 0 0 1000px ${autofillBg} inset`,
      WebkitTextFillColor: LOGIN_PAGE.text,
      caretColor: LOGIN_PAGE.text,
      transition: 'background-color 9999s ease-out 0s',
    },
  };
}

export function loginFieldLabelSx() {
  return {
    color: LOGIN_PAGE.textSoft,
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: 1.4,
    // در تم RTL برای راست‌چین فیزیکی
    textAlign: 'left',
    display: 'block',
  };
}

export function loginFormFieldSx() {
  return {
    gap: 2.5,
    display: 'flex',
    flexDirection: 'column',
  };
}

export function loginSubmitButtonSx() {
  return {
    mt: 0.5,
    py: 1.35,
    fontWeight: 800,
    fontSize: '0.95rem',
    color: '#fff',
    borderRadius: 2,
    background: `linear-gradient(135deg, ${LOGIN_PAGE.accent} 0%, ${LOGIN_PAGE.accentHover} 100%)`,
    boxShadow: `0 8px 28px ${alpha(LOGIN_PAGE.accent, 0.42)}, inset 0 1px 0 ${alpha('#fff', 0.12)}`,
    '&:hover': {
      background: `linear-gradient(135deg, ${alpha(LOGIN_PAGE.accent, 0.92)} 0%, ${LOGIN_PAGE.accentHover} 100%)`,
      boxShadow: `0 12px 32px ${alpha(LOGIN_PAGE.accent, 0.5)}`,
    },
  };
}
