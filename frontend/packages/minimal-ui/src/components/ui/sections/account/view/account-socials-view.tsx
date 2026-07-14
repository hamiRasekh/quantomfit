'use client';

import { _userAbout } from '@/ui/_mock';

import { AccountSocials } from '../account-socials';

// ----------------------------------------------------------------------

export function AccountSocialsView() {
  return <AccountSocials socialLinks={_userAbout.socialLinks} />;
}
