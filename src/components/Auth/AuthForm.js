import { useState, useRef, useContext } from 'react';
import { useHistory } from 'react-router-dom';

import AuthContext from '../../store/auth-context';
import classes from './AuthForm.module.css';

const AuthForm = () => {
  // ! With the useHistory Hook we can create a history object, and then use the history object to call replace(), to redirect the user to the previous page.
  const history = useHistory();
  const emailInputRef = useRef();
  const passwordInputRef = useRef();

  const authCtx = useContext(AuthContext);

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const switchAuthModeHandler = () => {
    setIsLogin((prevState) => !prevState);
  };

  // ! The login and logout 
  const submitHandler = (event) => {
    event.preventDefault();

    const enteredEmail = emailInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;

    // ! Optional: add Validation. For example make sure that the entered email is a valid email address or that the password is at least 8 characters long, etc


    // ! We set the loading to true if we are starting to send a request
    setIsLoading(true);
    let url;
    // ! If we are logged in
    if (isLogin) {
      url = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBFuSD2hjMjfUk24KRNJtDR3O-S5Va91nA'
      // ! If we are NOT logged in
    } else {
      url = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBFuSD2hjMjfUk24KRNJtDR3O-S5Va91nA'
    }

    // ! You can query the Firebase Auth backend through a REST API. This can be used for various operations such as creating new users, signing in existing ones 
    // ! and editing or deleting these users.

    // ! You can exchange a custom Auth token for an ID and refresh token by issuing an HTTP POST request to the Auth verifyCustomToken endpoint. This endpoint
    // ! Requires a 'POST' Method to use it!
    // ! We get the API KEY FROM Project Overview > Settings
    fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        email: enteredEmail,
        password: enteredPassword,
        returnSecureToken: true // ! Like the Firebase Auth REST API documentation says, this should always be TRUE
      }),
      // ! Here we add the content type header and set it to application/json to ensure that the AUTH REST API knows we got some JSON data coming
      headers: {
        'Content-Type': 'application/json'
      }
    }
    ).then(res => {
      setIsLoading(false);
      console.log("res", res);
      // ! If the response is ok and successful...
      if (res.ok) {
        return res.json();
        // ! If the response failed...
      } else {
        // ! The response data will hold extra information
        res.json().then(data => {
          // ! We will show an error. We first create errorMessage as a generic error
          let errorMessage = "Authentication Message";

          // ! and if data has an error property, and that has a message, then we set the errorMessage to data.error.message
          if (data && data.error && data.error.message) {
            errorMessage = data.error.message;
          }
          alert(errorMessage);

          // !
          throw new Error(errorMessage);
        })
      }
    }).then(data => {
      const expirationTime = new Date(new Date().getTime() + (+data.expiresIn * 1000));
      authCtx.login(data.idToken, expirationTime.toISOString());
      history.replace('/');

    }).catch(error => {

      alert(error.message);
    })
  };

  return (
    <section className={classes.auth}>
      <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
      <form onSubmit={submitHandler}>
        <div className={classes.control}>
          <label htmlFor='email'>Your Email</label>
          <input type='email' id='email' required ref={emailInputRef} />
        </div>
        <div className={classes.control}>
          <label htmlFor='password'>Your Password</label>
          <input type='password' id='password' required ref={passwordInputRef} />
        </div>
        <div className={classes.actions}>
          {!isLoading && <button>{isLogin ? 'Login' : 'Create Account'}</button>}
          {isLoading && <p>Sending request...</p>}
          <button
            type='button'
            className={classes.toggle}
            onClick={switchAuthModeHandler}
          >
            {isLogin ? 'Create new account' : 'Login with existing account'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AuthForm;
