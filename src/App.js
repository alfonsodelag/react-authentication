import { useContext } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import Layout from './components/Layout/Layout';
import UserProfile from './components/Profile/UserProfile';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import AuthContext from './store/auth-context';

function App() {

  const authCtx = useContext(AuthContext);

  return (
    <Layout>
      <Switch>

        <Route path='/' exact>
          <HomePage />
        </Route>

        {!authCtx.isLoggedIn && (
          <Route path='/auth'>
            <AuthPage />
          </Route>
        )}

        {/* REMEMBER, WE HAVE THIS isLoggedIn variable from const contextValue in auth-context */}

        <Route path='/profile'>
          {authCtx.isLoggedIn && <UserProfile />}
          {!authCtx.isLoggedIn && <Redirect to="/auth" />}
        </Route>


        <Route path='*'>
          {/* IF USER SELECTS A "NON-OFFICIAL" URL, WE SEND 'EM BACK TO THE HOMEPAGE WITH REDIRECT PATH="/""   */}
          <Redirect to='/' />
        </Route>

      </Switch>
    </Layout>
  );
}

export default App;
