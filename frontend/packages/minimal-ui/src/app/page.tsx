import type { Metadata } from 'next';

import { LandingPage } from '@/features/landing/components/LandingPage';

export const metadata: Metadata = {
  title: {
    absolute: 'پلتفرم هوشمند مدیریت اسمارت بتن',
  },
  description:
    'پلتفرم هوشمند مدیریت کارخانجات بتن — مالی، تولید و PLC، و طرح اختلاط با هوش مصنوعی.',
};

export default function HomePage() {
  return <LandingPage />;
}
