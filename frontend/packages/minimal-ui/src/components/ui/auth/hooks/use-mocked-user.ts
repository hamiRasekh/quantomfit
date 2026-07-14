import { _mock } from '@/ui/_mock';

// To get the user from the <AuthContext/>, you can use

// Change:
// import { useMockedUser } from '@/ui/auth/hooks';
// const { user } = useMockedUser();

// To:
// import { useAuthContext } from '@/ui/auth/hooks';
// const { user } = useAuthContext();

// ----------------------------------------------------------------------

export function useMockedUser() {
  const user = {
    id: '8864c717-587d-472a-929a-8e5f298024da-0',
    displayName: 'Voody User',
    email: '09123456789',
    photoURL: _mock.image.avatar(24),
    phoneNumber: "09123456789",
    country: "Iran",
    address: 'Tehran',
    state: 'Tehran',
    city: 'Tehran',
    zipCode: '1234567890',
    about: 'UI/UX Designer',
    role: 'admin',
    isPublic: true,
  };

  return { user };
}
