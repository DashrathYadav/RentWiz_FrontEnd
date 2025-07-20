import { lazy } from 'react';
import Loadable from '../components/Loadable';
import DashboardLayout from '../layout/DashboardLayout';
import AuthGuard from '../components/AuthGuard';

// Lazy load pages
const Dashboard = Loadable(lazy(() => import('../pages/Dashboard')));
const Properties = Loadable(lazy(() => import('../pages/Properties')));
const PropertyDetails = Loadable(lazy(() => import('../pages/PropertyDetails')));
const CreateProperty = Loadable(lazy(() => import('../pages/CreateProperty')));
const Rooms = Loadable(lazy(() => import('../pages/Rooms')));
const RoomDetails = Loadable(lazy(() => import('../pages/RoomDetails')));
const CreateRoom = Loadable(lazy(() => import('../pages/CreateRoom')));
const Tenants = Loadable(lazy(() => import('../pages/Tenants')));
const TenantDetails = Loadable(lazy(() => import('../pages/TenantDetails')));
const CreateTenant = Loadable(lazy(() => import('../pages/CreateTenant')));
const RentTracks = Loadable(lazy(() => import('../pages/RentTracks')));
const RentTrackDetails = Loadable(lazy(() => import('../pages/RentTrackDetails')));
const CreateRentTrack = Loadable(lazy(() => import('../pages/CreateRentTrack')));
const Profile = Loadable(lazy(() => import('../pages/Profile')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
    path: '/',
    element: (
        <AuthGuard>
            <DashboardLayout />
        </AuthGuard>
    ),
    children: [
        {
            path: '/',
            element: <Dashboard />
        },
        {
            path: '/dashboard',
            element: <Dashboard />
        },
        {
            path: '/properties',
            element: <Properties />
        },
        {
            path: '/properties/:id',
            element: <PropertyDetails />
        },
        {
            path: '/properties/create',
            element: <CreateProperty />
        },
        {
            path: '/properties/edit/:id',
            element: <CreateProperty />
        },
        {
            path: '/rooms',
            element: <Rooms />
        },
        {
            path: '/rooms/:id',
            element: <RoomDetails />
        },
        {
            path: '/rooms/create',
            element: <CreateRoom />
        },
        {
            path: '/rooms/edit/:id',
            element: <CreateRoom />
        },
        {
            path: '/tenants',
            element: <Tenants />
        },
        {
            path: '/tenants/:id',
            element: <TenantDetails />
        },
        {
            path: '/tenants/create',
            element: <CreateTenant />
        },
        {
            path: '/tenants/edit/:id',
            element: <CreateTenant />
        },
        {
            path: '/rent-tracks',
            element: <RentTracks />
        },
        {
            path: '/rent-tracks/:id',
            element: <RentTrackDetails />
        },
        {
            path: '/rent-tracks/create',
            element: <CreateRentTrack />
        },
        {
            path: '/rent-tracks/edit/:id',
            element: <CreateRentTrack />
        },
        {
            path: '/profile',
            element: <Profile />
        }
    ]
};

export default MainRoutes;
