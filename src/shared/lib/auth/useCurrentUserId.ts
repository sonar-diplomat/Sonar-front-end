import { useMemo } from 'react';
import { useAppSelector } from '@shared/store/hooks';
import { decodeJWT } from './jwt-utils';

export const useCurrentUserId = (): number | null => {
    const accessToken = useAppSelector((state) => state.auth.accessToken);

    return useMemo(() => {
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
    }, [accessToken]);
};

