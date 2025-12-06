import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FIRST_VISIT_KEY = 'hasVisitedBefore';

export const FirstVisitGuard: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const hasVisited = localStorage.getItem(FIRST_VISIT_KEY);

        if (!hasVisited) {
            navigate('/hello', { replace: true });
        } else {
            navigate('/entry', { replace: true });
        }
    }, [navigate]);

    return null;
};

export const markFirstVisitComplete = () => {
    localStorage.setItem(FIRST_VISIT_KEY, 'true');
};

export const checkHasVisited = (): boolean => {
    return localStorage.getItem(FIRST_VISIT_KEY) === 'true';
};