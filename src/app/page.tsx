/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps, no-console */

import { Suspense } from 'react';
import HomeClient from './HomeClient';
import { CinematicLoadingFallback } from '@/components/CinematicLoadingFallback';

// Server Component
export default async function Home() {
  return (
    <Suspense fallback={<CinematicLoadingFallback />}>
      <HomeClient />
    </Suspense>
  );
}
