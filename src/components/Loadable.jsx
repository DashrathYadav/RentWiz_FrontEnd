import { Suspense, useEffect } from 'react';
import { styled } from '@mui/material/styles';

// project import
import LinearProgress from '@mui/material/LinearProgress';
import { useLocation } from 'react-router-dom';

const Grid = styled('div')(({ theme }) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 2001,
    width: '100%',
    '& > * + *': {
        marginTop: theme.spacing(2)
    }
}));
// ==============================|| LOADABLE - LAZY LOADING ||============================== //

const Loadable = (Component) => (props) => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }, [pathname]);

    return (
        <Suspense fallback={<Grid><LinearProgress /></Grid>}>
            <Component {...props} />
        </Suspense>
    )
}

export default Loadable;
