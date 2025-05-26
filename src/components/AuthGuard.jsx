import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import JWTContext from '../contexts/JWTContext';
import Loader from '../components/Loader';

const AuthGuard = ({ children }) => {
    const { isLoggedIn, isInitialized } = useContext(JWTContext);

    if (!isInitialized) {
        return <Loader />;
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default AuthGuard;
