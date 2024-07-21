import React, { useContext, useState } from 'react';
// * To switch between consumer login & signin
const loginSigninContext = React.createContext();
const loginSigninUpdateContext = React.createContext();
// * Switching 2step of consumer signin
const nextStepContext = React.createContext();
const nextStepUpdateContext = React.createContext();
// * Switching 2step for consumer login
const loginNextStepContext = React.createContext();
const loginNextStepUpdateContext = React.createContext();

export const useLoginSignin = () => {
    return useContext(loginSigninContext);
};

export const useLoginSigninUpdate = () => {
    return useContext(loginSigninUpdateContext);
};

export const useNextStep = () => {
    return useContext(nextStepContext);
};
export const useNextStepUpdate = () => {
    return useContext(nextStepUpdateContext);
};
export const useLoginNextStep = () => {
    return useContext(loginNextStepContext);
};
export const useLoginNextStepUpdate = () => {
    return useContext(loginNextStepUpdateContext);
};

export const CommonContextProvider = ({ children }) => {
    const [loginOrSignin, setLoginOrSignin] = useState(false);
    const [nextStep, setNextStep] = useState(false);
    const [loginNextStep, setLoginNextStep] = useState(false);

    return (
        <loginSigninContext.Provider value={loginOrSignin}>
            <loginSigninUpdateContext.Provider value={setLoginOrSignin}>
                <nextStepContext.Provider value={nextStep}>
                    <nextStepUpdateContext.Provider value={setNextStep}>
                        <loginNextStepContext.Provider value={loginNextStep}>
                            <loginNextStepUpdateContext.Provider value={setLoginNextStep}>{children}</loginNextStepUpdateContext.Provider>
                        </loginNextStepContext.Provider>
                    </nextStepUpdateContext.Provider>
                </nextStepContext.Provider>
            </loginSigninUpdateContext.Provider>
        </loginSigninContext.Provider>
    );
};
