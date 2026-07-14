import Image from "next/image";
import Link from "next/link";
import { defaultLocale } from "@quantomfit/i18n";
import { createApiClient } from "@quantomfit/api-client";
import {
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Box,
  Stack,
  Divider
} from "@mui/material";

type WebsiteContent = {
  locale?: string;
  section: string;
  title: string;
  subtitle: string;
  body: string;
  cta: string;
  features?: string[];
  faq?: FaqItem[];
  testimonials?: Array<{ name?: string; quote?: string }>;
  images?: string[];
};

type FaqItem = {
  q?: string;
  a?: string;
  question?: string;
  answer?: string;
};

type PlatformSummary = {
  gymCount?: number;
  activeGyms?: number;
  plans?: Array<{
    code: string;
    name: string;
    monthlyPrice?: number;
    yearlyPrice?: number;
    currency?: string;
    limits?: Record<string, unknown>;
  }>;
  latestGyms?: Array<{
    id: string;
    name: string;
    planName: string;
    onboardingStatus: string;
  }>;
};

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "marketing",
  },
});

function sectionMap(items: WebsiteContent[]) {
  return items.reduce<Record<string, WebsiteContent>>((acc, item) => {
    const current = acc[item.section];
    if (!current || item.locale === defaultLocale) {
      acc[item.section] = item;
    }
    return acc;
  }, {});
}

export default async function Page() {
  const [platformPayload, contentPayload] = await Promise.allSettled([
    api.get<PlatformSummary>("/api/v1/platform"),
    api.get<{ items: WebsiteContent[] }>("/api/v1/public/website-content"),
  ]);

  const platform = platformPayload.status === "fulfilled" ? platformPayload.value : null;
  const content = contentPayload.status === "fulfilled" ? sectionMap(contentPayload.value.items ?? []) : {};
  const home = content.homepage;
  const featuresSection = content.features;
  const faqSection = content.faq;
  const testimonialsSection = content.testimonials;

  const plans = platform?.plans ?? [];
  const latestGyms = platform?.latestGyms ?? [];
  const isFa = defaultLocale === "fa";

  const headline = isFa
    ? "پلتفرم هوشمند باشگاه با پنل‌های حرفه‌ای"
    : home?.title ?? "Cloud intelligence for modern gym operations.";

  const subheadline = isFa
    ? "یک اکوسیستم وب‌محور و پریمیوم برای مالک باشگاه، مربی، ورزشکار و مدیر سیستم با حضور زنده، پیامک هوشمند و گزارش‌های دقیق."
    : home?.subtitle ?? "A premium multi-panel system for gym owners, trainers, athletes, and platform operators with live occupancy, onboarding, analytics, and legacy software integration.";

  const features = isFa
    ? [
        "مدیریت باشگاه",
        "پنل مربی",
        "اپ کاربر",
        "ردیابی زنده تراکم",
        "اتوماسیون پیامک",
        "تحلیل و گزارش",
      ]
    : home?.features ?? featuresSection?.features ?? [];

  const faFaq = [
    { q: "آیا RTL پشتیبانی می‌شود؟", a: "بله، فارسی و انگلیسی هر دو پشتیبانی می‌شوند." },
    { q: "آیا محتوا از پنل ادمین قابل تغییر است؟", a: "بله، همه محتوای عمومی از CMS مدیریت می‌شود." },
  ] satisfies FaqItem[];

  const faqItems: FaqItem[] = isFa ? faFaq : home?.faq ?? faqSection?.faq ?? [];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: "center", mb: 10 }}>
        <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: 2 }}>
            QuantumFit
          </Typography>
          <Box sx={{ px: 1.5, py: 0.25, bgcolor: "primary.lighter", borderRadius: 1 }}>
            <Typography variant="caption" color="primary.dark" sx={{ fontWeight: 700 }}>
              فارسی / LTR
            </Typography>
          </Box>
        </Stack>

        <Typography variant="h2" component="h1" sx={{ fontWeight: 900, mb: 3, px: { xs: 0, md: 8 } }}>
          {headline}
        </Typography>

        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, mb: 5, px: { xs: 0, md: 10 }, lineHeight: 1.6 }}>
          {subheadline}
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 8 }}>
          <Link href="/login" passHref legacyBehavior>
            <Button variant="contained" color="primary" size="large" sx={{ fontWeight: 700, px: 4 }}>
              {isFa ? "ورود به پنل‌ها" : home?.cta ?? "Enter panels"}
            </Button>
          </Link>
          <Link href="/demo" passHref legacyBehavior>
            <Button variant="outlined" color="primary" size="large" sx={{ fontWeight: 700, px: 4 }}>
              {isFa ? "مشاهده دمو" : "See demo"}
            </Button>
          </Link>
        </Stack>

        {/* Stats */}
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: "background.neutral", py: 2 }}>
              <CardContent>
                <Typography variant="h3" sx={{ fontWeight: 800, color: "primary.main", mb: 1 }}>
                  {platform?.gymCount ?? 0}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  {isFa ? "باشگاه ثبت‌شده" : "gyms registered"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: "background.neutral", py: 2 }}>
              <CardContent>
                <Typography variant="h3" sx={{ fontWeight: 800, color: "primary.main", mb: 1 }}>
                  {platform?.activeGyms ?? 0}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  {isFa ? "باشگاه فعال" : "active gyms"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: "background.neutral", py: 2 }}>
              <CardContent>
                <Typography variant="h3" sx={{ fontWeight: 800, color: "primary.main", mb: 1 }}>
                  {plans.length}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  {isFa ? "پلن فعال" : "active plans"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Main Content Grid */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", p: 2 }}>
            <CardContent>
              <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
                {isFa ? "چرا QuantumFit" : "Why QuantumFit"}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, mb: 2 }}>
                {isFa ? "همه چیز در یک تجربه‌ی وب‌محور و شیک" : featuresSection?.title ?? "Built for gym owners, coaches, and athletes."}
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {isFa ? "تمام زیر دامنه‌ها یک مرز tenant مشترک دارند اما هر پنل با نقش خودش کار می‌کند." : featuresSection?.body ?? "Each subdomain owns its workflow while the backend enforces one tenant boundary everywhere."}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", p: 2 }}>
            <CardContent>
              <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
                {isFa ? "آخرین باشگاه‌ها" : "Latest gyms"}
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                {latestGyms.length > 0 ? latestGyms.slice(0, 4).map((gym) => (
                  <Box key={gym.id} sx={{ p: 1.5, bgcolor: "background.neutral", borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {gym.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      پلن {gym.planName} · وضعیت {gym.onboardingStatus}
                    </Typography>
                  </Box>
                )) : (
                  <Typography variant="body2" color="text.secondary">
                    {isFa ? "هنوز باشگاهی ثبت نشده است." : "No gyms found yet."}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Hero Visual */}
      <Card sx={{ mb: 10, borderRadius: 3, overflow: "hidden" }}>
        <Image
          src="/images/quantumfit-hero.png"
          alt="QuantumFit hero"
          width={1200}
          height={675}
          style={{ width: "100%", height: "auto", display: "block" }}
          priority
        />
      </Card>

      {/* Features Showcase */}
      <Grid container spacing={4} alignItems="center" sx={{ mb: 10 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
            <Image
              src="/images/quantumfit-admin.png"
              alt="QuantumFit admin dashboard"
              width={1200}
              height={675}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ pl: { md: 4 } }}>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
              {isFa ? "امکانات" : "Features"}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, mb: 3 }}>
              {isFa ? "ساختار کامل برای مدیریت، آموزش و تجربه‌ی ورزشکار" : (featuresSection?.title ?? "Built for every workflow.")}
            </Typography>
            <Grid container spacing={2}>
              {features.map((feature) => (
                <Grid item xs={12} sm={6} key={feature}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 6, height: 6, bgcolor: "primary.main", borderRadius: "50%" }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {feature}
                    </Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
      </Grid>

      {/* Pricing Section */}
      <Box id="pricing" sx={{ mb: 10 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, textAlign: "center", mb: 5 }}>
          {isFa ? "پلن‌ها و تعرفه‌ها" : "Plans & Pricing"}
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {plans.length > 0 ? (
            plans.map((plan) => (
              <Grid item xs={12} sm={4} key={plan.code}>
                <Card sx={{ height: "100%", border: "1px solid", borderColor: "divider", p: 1 }}>
                  <CardContent>
                    <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
                      {plan.code}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
                      {plan.name}
                    </Typography>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 800, mb: 3 }}>
                      {plan.monthlyPrice ?? 0} {plan.currency ?? "USD"}
                      <Typography component="span" variant="body2" color="text.secondary">
                        / ماهانه
                      </Typography>
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Stack spacing={1.5}>
                      {Object.entries(plan.limits ?? {}).map(([key, value]) => (
                        <Typography variant="body2" color="text.secondary" key={key}>
                          {key}: <strong>{String(value)}</strong>
                        </Typography>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12} sm={6}>
              <Card sx={{ textAlign: "center", p: 4 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  {isFa ? "در انتظار بک‌اند" : "Waiting for backend"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isFa ? "برای نمایش تعرفه‌ها، API و دیتابیس را اجرا کن." : "Start the Go API and PostgreSQL to render live plan data."}
                </Typography>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* FAQ & Testimonials */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
                {isFa ? "نظرات" : "Testimonials"}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 1, mb: 2 }}>
                {isFa ? "باشگاه دمو" : "Demo Gym"}
              </Typography>
              <Typography color="text.secondary" sx={{ fontStyle: "italic", lineHeight: 1.6 }}>
                "{isFa ? "پریمیوم، سریع و دقیق؛ برای هر روند باشگاهی آماده است." : "A premium and connected web platform for every gym workflow."}"
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
                {isFa ? "سوالات متداول" : "FAQ"}
              </Typography>
              <Stack spacing={3} sx={{ mt: 2 }}>
                {faqItems.map((item, index) => (
                  <Box key={item.q ?? item.question ?? index}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {item.q ?? item.question ?? ""}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {item.a ?? item.answer ?? ""}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
