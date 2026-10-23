import React, { lazy, Suspense } from 'react';

import { isDemoMode } from '@shared/config/data-source';
const Status = isDemoMode ? lazy(() => import('./DemoStatusImpl').then(module => ({ default: module.DemoStatusImpl }))) : null;
export const DemoStatus = () => Status ? <Suspense fallback={null}><Status /></Suspense> : null;
