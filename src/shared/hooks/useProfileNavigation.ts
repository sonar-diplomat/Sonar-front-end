import { useNavigate } from 'react-router-dom';

export const useProfileNavigation = () => {
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate(-1);
    };

    const handleNavigateToLibrary = () => {
        navigate('/library');
    };

    return {
        handleBackClick,
        handleNavigateToLibrary,
        navigate,
    };
};