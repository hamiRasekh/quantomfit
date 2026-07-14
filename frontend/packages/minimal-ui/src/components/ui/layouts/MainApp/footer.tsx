'use client';

import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { paths } from '@/ui/routes/paths';
import { RouterLink } from '@/ui/routes/components';
import { Logo } from '@/components/ui/logo';
import { CONFIG } from '@/ui/global-config';
import { useTranslate } from '@/ui/locales';
import type { FooterSettings, FooterLink } from '@/features/admin-footer-settings/types/footer-settings.types';

// ----------------------------------------------------------------------

const FooterRoot = styled('footer')(({ theme }) => ({
    position: 'relative',
    backgroundColor: theme.vars.palette.background.default,
}));

export type MainAppFooterProps = React.ComponentProps<typeof FooterRoot> & {
    settings: FooterSettings;
};

export function MainAppFooter({ sx, settings, ...other }: MainAppFooterProps) {
    const { t } = useTranslate('common');
    const footerData = useMemo(() => settings, [settings]);
    const instagramIcon = `${CONFIG.assetsDir}/assets/image/instagram.svg`;

    // Group links by category
    const linkGroups = useMemo(() => {
        const quickLinks = footerData.links?.filter((link) =>
            link.href === paths.contact || link.href === paths.faqs || link.href === paths.terms
        ) || [];

        return [
            { headline: t('footer.quickAccess'), children: quickLinks },
        ];
    }, [footerData, t]);

    return (
        <FooterRoot sx={sx} {...other}>
            <Divider />
            <Container
                sx={{
                    py: 5,
                }}
            >
                <Grid container spacing={4}>
                    {/* Logo and Description */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Logo />
                        <Typography
                            variant="body2"
                            sx={{
                                mt: 2,
                                color: 'text.secondary',
                                maxWidth: 300,
                            }}
                        >
                            {footerData.description}
                        </Typography>
                        {footerData.address && (
                            <Typography
                                variant="body2"
                                sx={{
                                    mt: 2,
                                    color: 'text.secondary',
                                    maxWidth: 300,
                                }}
                            >
                                {t('footer.address')} {footerData.address}
                            </Typography>
                        )}
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Link
                                href={`mailto:${footerData.email}`}
                                color="inherit"
                                variant="body2"
                                sx={{
                                    textDecoration: 'none',
                                    color: 'text.secondary',
                                    '&:hover': {
                                        textDecoration: 'underline',
                                    },
                                }}
                            >
                                {footerData.email}
                            </Link>
                            <Link
                                href={footerData.instagram_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                color="inherit"
                                variant="body2"
                                sx={{
                                    textDecoration: 'none',
                                    color: 'text.secondary',
                                    '&:hover': {
                                        textDecoration: 'underline',
                                    },
                                }}
                            >
                                {t('footer.instagram')} @voody.app
                            </Link>
                        </Box>
                    </Grid>

                    {/* Links */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 3,
                            }}
                        >
                            {linkGroups.map((list) => (
                                <Box key={list.headline}>
                                    <Typography
                                        component="div"
                                        variant="overline"
                                        sx={{
                                            mb: 1.5,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {list.headline}
                                    </Typography>
                                    {list.children.map((link: FooterLink) => (
                                        <Box key={link.name} sx={{ mb: 1 }}>
                                            {link.external ? (
                                                <Link
                                                    href={link.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    color="inherit"
                                                    variant="body2"
                                                    sx={{
                                                        textDecoration: 'none',
                                                        '&:hover': {
                                                            textDecoration: 'underline',
                                                        },
                                                    }}
                                                >
                                                    {link.name}
                                                </Link>
                                            ) : (
                                                <Link
                                                    component={RouterLink}
                                                    href={link.href}
                                                    color="inherit"
                                                    variant="body2"
                                                    sx={{
                                                        textDecoration: 'none',
                                                        '&:hover': {
                                                            textDecoration: 'underline',
                                                        },
                                                    }}
                                                >
                                                    {link.name}
                                                </Link>
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            ))}
                        </Box>
                    </Grid>

                    {/* Trust Seals */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 3,
                                alignItems: { xs: 'center', md: 'flex-start' },
                            }}
                        >
                            <Typography
                                component="div"
                                variant="overline"
                                sx={{
                                    mb: 1.5,
                                    fontWeight: 600,
                                }}
                            >
                                {t('footer.trustSeals')}
                            </Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2,
                                    alignItems: { xs: 'center', md: 'flex-start' },
                                }}
                            >
                                {/* Enamad */}
                                <Box
                                    sx={{
                                        '& img': {
                                            maxWidth: '100%',
                                            height: 'auto',
                                        },
                                    }}
                                    dangerouslySetInnerHTML={{
                                        __html: `<a referrerpolicy='origin' target='_blank' href='https://trustseal.enamad.ir/?id=${footerData.enamad_id}&Code=${footerData.enamad_code}'><img referrerpolicy='origin' src='https://trustseal.enamad.ir/logo.aspx?id=${footerData.enamad_id}&Code=${footerData.enamad_code}' alt='' style='cursor:pointer' code='${footerData.enamad_code}'></a>`,
                                    }}
                                />

                                {/* Samandehi */}
                                <Box
                                    sx={{
                                        '& img': {
                                            maxWidth: '100%',
                                            height: 'auto',
                                        },
                                    }}
                                    dangerouslySetInnerHTML={{
                                        __html: `<img referrerpolicy='origin' id = 'rgvjsizpwlaooeukoeuksizp' style = 'cursor:pointer' onclick = 'window.open("https://logo.samandehi.ir/Verify.aspx?id=${footerData.samandehi_id}&p=${footerData.samandehi_code}", "Popup","toolbar=no, scrollbars=no, location=no, statusbar=no, menubar=no, resizable=0, width=450, height=630, top=30")' alt = 'logo-samandehi' src = 'https://logo.samandehi.ir/logo.aspx?id=${footerData.samandehi_id}&p=qftibsiyshwlaqgwaqgwbsiy' />`,
                                    }}
                                />

                                {/* Instagram */}
                                <Link
                                    href={footerData.instagram_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 40,
                                        height: 40,
                                        borderRadius: 1,
                                        '&:hover': {
                                            opacity: 0.8,
                                        },
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={instagramIcon}
                                        alt="Instagram"
                                        sx={{
                                            width: 40,
                                            height: 40,
                                        }}
                                    />
                                </Link>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </FooterRoot>
    );
}

