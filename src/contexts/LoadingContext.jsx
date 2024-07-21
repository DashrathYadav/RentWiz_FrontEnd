import SharedBackdrop from '../components/shared-components/SharedBackdrop';
import React, { createContext, useContext, useState } from 'react';

const LoadingContext = createContext();
const SetLoadingContext = createContext();

export const useLoading = () => useContext(LoadingContext);
export const useSetLoading = () => useContext(SetLoadingContext);

export const LoadingProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);

    return (
        <LoadingContext.Provider value={loading}>
            <SetLoadingContext.Provider value={setLoading}>
                {children}
                {loading && <SharedBackdrop />}
            </SetLoadingContext.Provider>
        </LoadingContext.Provider>
    );
};
