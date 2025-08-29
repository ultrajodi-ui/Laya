
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/profile/edit');
  }, [router]);

  return null; // or a loading spinner
}
