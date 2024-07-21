import { RouterProvider } from 'react-router-dom';
// import "./app.scss"

// project import
import router from './routes';

// auth provider
import { JWTProvider as AuthProvider } from './contexts/JWTContext';
import { CommonContextProvider } from './contexts/CommonContext.jsx';
import { LoadingProvider } from './contexts/LoadingContext';
import NoInternetConnection from './contexts/NoInternetConnection';
import { Typography } from '@mui/material';

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

const App = () => {

    return (
        <NoInternetConnection>
            <LoadingProvider>
                <AuthProvider>
                    <CommonContextProvider>
                        <>
                            <RouterProvider router={router} />
                        </>
                    </CommonContextProvider>
                </AuthProvider >
            </LoadingProvider>
        </NoInternetConnection>
    )
}

export default App;
