import PropTypes from 'prop-types';
import { lazy } from 'react';
import { Outlet } from 'react-router-dom';

// project import
// import GuestGuard from 'utils/route-guard/GuestGuard';

const Header = lazy(() => import('./Header'));
const Footer = lazy(() => import('./Footer'));

// ==============================|| LAYOUT - DASHBOARD ||============================== //

const Layout = () => {

    return (
        <>
                <Header />
                <div className='outlet-container'>
                    <Outlet />
                </div>
                <Footer />
        </>
    );
};

Layout.propTypes = {
    layout: PropTypes.string
};

export default Layout;
