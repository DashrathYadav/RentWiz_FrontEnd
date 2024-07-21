import React, { useState, useEffect } from 'react';
import NoInternet from '../assets/images/NoInternet.jpg'
const NoInternetConnection = (props) => {
    const [isOnline, setOnline] = useState(true);

    useEffect(() => {
        setOnline(navigator.onLine)
    }, [])

    // event listeners to update the state 
    window.addEventListener('online', () => {
        setOnline(true)
    });

    window.addEventListener('offline', () => {
        setOnline(false)
    });

    // if user is online, return the child component else return a custom component
    if (isOnline) {
        return (
            props.children
        )
    } else {
        return (
            <div style={{ textAlign: 'center', marginTop: '20vh' }}>
                <img
                    src={NoInternet}
                    alt="No Internet Connection"
                    style={{ width: '200px', marginBottom: '20px' }}
                />
                <h1 style={{ color: 'red' }}>No Internet Connection</h1>
                <p>Please check your connection and try again later.</p>
            </div>
        );
    }
}

export default NoInternetConnection;