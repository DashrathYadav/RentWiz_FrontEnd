import PropTypes from 'prop-types';
import { createContext, useEffect, useReducer } from 'react';


// reducer - state management
import { LOGIN, LOGOUT } from '../contexts/auth-reducer/actions';
import authReducer from '../contexts/auth-reducer/auth';

// project import
import Loader from '../components/Loader';
import axios from '../utils/axios';

import { API_Route } from '../utils/apiRoute';

import { jwtDecode } from 'jwt-decode';
import { StatusCode } from '../utils/commonEnums';
// import { openSnackbar } from 'api/external/snackbar';
import { useSetLoading } from './LoadingContext';

// constant
const initialState = {
    isLoggedIn: false,
    isInitialized: false,
    user: null
};


const verifyToken = (serviceToken) => {
    if (!serviceToken) {
        return false;
    }
    try {
        const decoded = jwtDecode(serviceToken);
        return decoded.exp > Date.now() / 1000;
    } catch (error) {
        console.error('Token verification error:', error);
        return false;
    }
};

const setSession = (token) => {
    if (token) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('loginType');
        delete axios.defaults.headers.common.Authorization;
    }
};

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //

const JWTContext = createContext(null);

export const JWTProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const setLoading = useSetLoading();

    useEffect(() => {
        getUserProfileVerify();
    }, []);
    const getUserProfileVerify = async () => {
        try {
            const token = window.localStorage.getItem('token');
            if (token && verifyToken(token)) {
                setSession(token);
                // For now, we'll create a basic user object from the token
                // In a real scenario, you'd call an API to get the user profile
                const decoded = jwtDecode(token);
                const user = {
                    id: decoded.userId || decoded.sub || decoded.nameid,
                    email: decoded.email,
                    name: decoded.name || decoded.unique_name,
                    role: decoded.role,
                    roleId: decoded.roleId
                };
                
                // Store user in localStorage for API calls
                localStorage.setItem('user', JSON.stringify(user));
                
                dispatch({
                    type: LOGIN,
                    payload: {
                        isLoggedIn: true,
                        user
                    }
                });
                return;
            } else {
                setSession(null);
                dispatch({
                    type: LOGOUT
                });
                return;
            }
        } catch (err) {
            console.error('Token verification error:', err);
            setSession(null);
            dispatch({
                type: LOGOUT
            });
            return;
        }
    }


    // Login function
    const login = async (loginId, password) => {
        try {
            setLoading(true);
            const response = await axios.post(API_Route.login, { loginId, password });
            
            if (response?.data?.status === true && response?.data?.responseCode === 200) {
                const { token } = response.data.data;
                setSession(token);
                await getUserProfileVerify();
                return { success: true };
            } else {
                return { 
                    success: false, 
                    message: response?.data?.message || "Login failed" 
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                message: error?.response?.data?.message || "Login failed" 
            };
        } finally {
            setLoading(false);
        }
    };

    // User Registration 
    const useGetVerifyConsumerRegistrationUsingOtp = async (userId, email, mobileNumber, otp) => {
        try {
            const response = await axios.post(API_Route.verifyOTP, { userId, email, mobileNumber, otp });
            const { token } = response?.data?.data;
            const user = response?.data?.data;
            setSession(token);

            // if (user && user?.isApplicationReference === false) {
            //     const applicationGenerated = await handleApplicationGenerate(user?.leadID);
            //     if (applicationGenerated) {
            //         getUserProfileVerify();
            //     }
            // } else {
            //     getUserProfileVerify();
            // }

            return response.data;
        } catch (error) {
            return error;
        }
    };



    const logout = () => {
        setSession(null);
        dispatch({ type: LOGOUT });
    };

    if (state.isInitialized !== undefined && !state.isInitialized) {
        return <Loader />;
    }

    return (
        <JWTContext.Provider value={{ ...state, login, getUserProfileVerify, useGetVerifyConsumerRegistrationUsingOtp, logout }}>
            {children}
        </JWTContext.Provider>
    );
};

JWTProvider.propTypes = {
    children: PropTypes.node
};

export default JWTContext;
