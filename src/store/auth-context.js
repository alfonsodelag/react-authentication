import React, { useState, useEffect, useCallback } from 'react';

let logoutTimer;

const AuthContext = React.createContext({
    token: '',
    isLoggedIn: false,
    login: (token) => { },
    logout: () => { },
});

// ! We create this constant because we are adding an Auto-Logout feature for our App
const calculateRemainingTime = (expirationTime) => {
    // ! getTime() gives us the current timestamp in miliseconds. This is the current time
    const currentTime = new Date().getTime();
    // ! This time is in the future.
    const adjExpirationTime = new Date(expirationTime).getTime();

    const remainingDuration = adjExpirationTime - currentTime;

    return remainingDuration;
};

const retrieveStoredToken = () => {
    const storedToken = localStorage.getItem('token');
    const storedExpirationDate = localStorage.getItem('expirationTime');

    const remainingTime = calculateRemainingTime(storedExpirationDate);

    // ! 1 minute is 60000 miliseconds
    if (remainingTime <= 60000) {
        localStorage.removeItem('token');
        localStorage.removeItem('expirationTime');
        // ! If the remainingTime is less or equal that 1minute, we want to NOT log the user in. We don't retrieve a token
        return null;
    }

    return {
        token: storedToken,
        duration: remainingTime
    };
};

// ! The provider component will be responsible for managing the Auth related state.
export const AuthContextProvider = (props) => {
    const tokenData = retrieveStoredToken();
    let initialToken;
    if (tokenData) {
        initialToken = tokenData.token;
    }


    const [token, setToken] = useState(initialToken);

    // ! This userLoggedIn constant is simply the result or response of checking if token is truthy
    const userIsLoggedIn = !!token; // ! The Double "!!" simply converts the truthy or falsy value of to a true or false BOOLEAN value

    const logoutHandler = useCallback(() => {
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('expirationTime');

        if (logoutTimer) {
            clearTimeout(logoutTimer);
        }

    }, []);

    // ! We will use localStorage to store

    const loginHandler = (token, expirationTime) => {
        setToken(token);
        localStorage.setItem("token", token);
        localStorage.setItem('expirationTime', expirationTime);

        const remainingTime = calculateRemainingTime(expirationTime);

        logoutTimer = setTimeout(logoutHandler, remainingTime);
    };

    useEffect(() => {
        if (tokenData) {
            console.log(tokenData.duration);
            logoutTimer = setTimeout(logoutHandler, tokenData.duration);
        }
    }, [tokenData, logoutHandler])

    const contextValue = {
        token: token,
        isLoggedIn: userIsLoggedIn,
        login: loginHandler,
        logout: logoutHandler
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {props.children}
        </AuthContext.Provider>
    )
};

export default AuthContext;