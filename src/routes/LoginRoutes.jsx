import { lazy } from 'react';

// project import
import Loadable from '../components/Loadable';

// project import
const DashboardLayout = Loadable(lazy(() => import('../layout/homepage/Layout')));
import LoginTesting from '../pages/auth/LoginTesting';

// ==============================|| AUTH ROUTING ||============================== //

const LoginRoutes = {
    path: '/',
    children: [
        {
            path: '/',
            element: <DashboardLayout />,
            children: [
                {
                    path: 'user-login',
                    element: <LoginTesting />
                },
            ]
        }
    ]
};

export default LoginRoutes;
