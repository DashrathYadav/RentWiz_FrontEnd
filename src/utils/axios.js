import axios from 'axios';
import { StatusCode } from './commonEnums';
// import { openSnackbar } from 'api/external/snackbar';

const axiosServices = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL || 'http://localhost:3010/',
    timeout: 120000000
});

// ==============================|| AXIOS - FOR MOCK SERVICES ||============================== //


axiosServices.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('token');
        if (accessToken) {
            config.headers['x-access-token'] = `Bearer ${accessToken}`;
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(config);
            }, 150);
        });
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosServices.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {

        // if (error.response.status === StatusCode.timeOut) {
        //     openSnackbar({ open: true, message: "Session Expired, Please Login Again", variant: 'alert', alert: { color: 'error' } });
        //     window.location.reload();
        // }

        return Promise.reject((error.response && error.response.data) || 'Wrong Services');
    }
);

export default axiosServices;

export const fetcher = async (args) => {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosServices.get(url, { ...config });

    return res.data;
};

export const fetcherPost = async (args) => {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosServices.post(url, { ...config });

    return res.data;
};
