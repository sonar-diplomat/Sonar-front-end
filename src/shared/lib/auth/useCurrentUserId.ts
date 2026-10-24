import { useMemo } from 'react';

import { isDemoMode } from '@shared/config/data-source';
import { useAppSelector } from '@shared/store/hooks';

import { decodeJWT } from './jwt-utils';

export const useCurrentUserId = (): number | null => {
    const accessToken = useAppSelector((state) => state.auth.accessToken);
    const demoUserId = useAppSelector((state) => state.auth.demoUserId);

    return useMemo(() => {
        if (isDemoMode) return demoUserId;
        if (!accessToken) return null;
        
        const decoded = decodeJWT(accessToken);
        if (!decoded) return null;
        
        const userId = decoded.sub || 
                      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
                      decoded.nameid || 
                      decoded.userId || 
                      decoded.id;
        
        if (!userId) return null;
        
        return typeof userId === 'number' ? userId : Number(userId) || null;
    }, [accessToken, demoUserId]);
};

