import PropTypes from 'prop-types';
import { createContext, useEffect, useReducer } from 'react';


// reducer - state management
import { LOGIN, LOGOUT } from '../contexts/auth-reducer/actions';
import authReducer from '../contexts/auth-reducer/auth';

// project import
import Loader from '../components/Loader';
import axios from '../utils/axios';
import { decryptData } from '../utils/commonUtils';

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
    const decoded = jwtDecode(decryptData(serviceToken));
    return decoded.exp > Date.now() / 1000;
};

const setSession = (token) => {
    if (token) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        localStorage.removeItem('token');
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
            const loginType = window.localStorage.getItem('loginType') || '';
            if (token && verifyToken(token)) {
                setSession(token);
                let response;
                if (loginType == 'GB') {
                    response = await axios.post(API_Route.getProfile_GB, { token: token });
                } else {
                    response = await axios.post(API_Route.getProfile, { token: token });
                }
                if (response?.data.statusCode === StatusCode.success) {
                    const user = response?.data?.data;
                    dispatch({
                        type: LOGIN,
                        payload: {
                            isLoggedIn: true,
                            user
                        }
                    });
                    // openSnackbar({ open: true, message: "Login successful.", variant: 'alert', alert: { color: 'success' } });
                    return;
                }
                else {
                    // openSnackbar({ open: true, message: response.message || "Something went wrong while verifying user profile.", variant: 'alert', alert: { color: 'error' } });
                    setSession(null);
                    dispatch({
                        type: LOGOUT
                    });
                    return;
                }
            } else {
                setSession(null);
                dispatch({
                    type: LOGOUT
                });
                return;
            }
        } catch (err) {
            setSession(null);
            dispatch({
                type: LOGOUT
            });
            return;
        }
    }


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
        <JWTContext.Provider value={{ ...state, getUserProfileVerify, useGetVerifyConsumerRegistrationUsingOtp, logout }}>
            {children}
        </JWTContext.Provider>
    );
};

JWTProvider.propTypes = {
    children: PropTypes.node
};

export default JWTContext;
