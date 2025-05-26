import { lazy } from 'react';

// project import
import Loadable from '../components/Loadable';

// project import
const DashboardLayout = Loadable(lazy(() => import('../layout/homepage/Layout')));
import LoginTesting from '../pages/auth/LoginTesting';
import LoginPage from "../components/LoginPage.jsx";
import OwnerRegisterPage from "../components/OwnerRegister.jsx";

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
                {
                    path:'login',
                    element: <LoginPage/>
                }
            ]
        },
        {
            path: '/register',
            element: <DashboardLayout/>,
            children: [
                {
                    path: 'owner',
                    element: <OwnerRegisterPage/>
                }
            ]
        }
    ]
};

export default LoginRoutes;
