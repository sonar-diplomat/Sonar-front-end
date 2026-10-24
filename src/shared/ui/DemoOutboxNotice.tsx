import React, { lazy, Suspense } from 'react';

import { isDemoMode } from '@shared/config/data-source';
interface Props { kind: 'confirm-email' | 'reset-password' | 'change-password' | 'change-email'; email: string; revision?: number }
const Notice = isDemoMode ? lazy(() => import('./DemoOutboxNoticeImpl').then(module => ({ default: module.DemoOutboxNoticeImpl }))) : null;
export const DemoOutboxNotice = (props: Props) => Notice ? <Suspense fallback={null}><Notice {...props} /></Suspense> : null;
