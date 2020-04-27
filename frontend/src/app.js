import axios from "axios";
import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { createStore, withStore } from "@spyna/react-store";
import { createBrowserHistory } from "history";
import { Helmet } from "react-helmet";

import {
  Admin,
  Home,
  Dashboard,
  Error,
  NewUser,
  EditUser,
  NewProject,
  ManageUsers,
  Labels,
} from "./pages";
import NavBar from "./containers/navbar";

const history = createBrowserHistory();

const initialState = {
  username: "",
  isUserLoggedIn: null,
  isAdmin: false,
  isLoading: false,
};

const PrivateRoute = withStore(({ component: Component, ...rest }) => {
  const isUserLoggedIn = rest.store.get("isUserLoggedIn");
  return (
    <Route
      {...rest}
      render={(props) =>
        isUserLoggedIn === true ? <Component {...props} /> : <Redirect to="/" />
      }
    />
  );
});

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      isUserLoggedIn: false,
      isAdmin: false,
    };
  }
  componentDidMount() {
    axios({
      method: "post",
      url: "/auth/is_logged_in",
    })
      .then((response) => {
        const { is_logged_in } = response.data;
        this.props.store.set("isUserLoggedIn", is_logged_in);
        if (is_logged_in === true) {
          const { username, is_admin } = response.data;
          this.props.store.set("isAdmin", is_admin);
          this.props.store.set("username", username);
        }
        if (history.location.pathname === "/") {
          history.push("/dashboard");
        } else {
          history.push(history.location.pathname);
        }
      })
      .catch((error) => {
        if (error.response.status === 401) {
          history.push("/");
          this.props.store.set("isUserLoggedIn", false);
        }
      });
  }

  render() {
    const isUserLoggedIn = this.props.store.get("isUserLoggedIn");

    if (isUserLoggedIn === null) {
      return null;
    }

    return (
      <Router>
        <div className="app">
          <Helmet
            titleTemplate="%s | Speech Annotation Tool"
            defaultTitle="Speech Annotation Tool"
          ></Helmet>
          <NavBar />
          <Switch>
            <Route
              exact
              path="/"
              render={(props) => {
                if (isUserLoggedIn === false) {
                  return <Home {...props} />;
                } else {
                  return <Redirect {...props} to="/dashboard" />;
                }
              }}
            />
            <PrivateRoute exact path="/admin" component={Admin} />
            <PrivateRoute exact path="/dashboard" component={Dashboard} />
            {/* <PrivateRoute exact path="/users/new" component={NewUser} /> */}
            {/* <PrivateRoute exact path="/projects/new" component={NewProject} /> */}
            <PrivateRoute exact path="/users/:id/edit" component={EditUser} />
            <PrivateRoute
              exact
              path="/projects/:id/users"
              component={ManageUsers}
            />
            <PrivateRoute
              exact
              path="/projects/:id/labels"
              component={Labels}
            />
            {/* <PrivateRoute
              exact
              path="/projects/:id/labels/new"
              component={NewLabel}
            /> */}
            {/* <PrivateRoute
              exact
              path="/users/:id/edit"
              component={EditUserForm}
            /> */}
            {/* <PrivateRoute exact path="/project/:id" component={ProjectForm} /> */}
            {/* <PrivateRoute exact path="/user/:id" component={UserForm} /> */}
            <Route exact path="*">
              <Error message="Page not found!" />
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }
}

const connectedApp = withStore(App);

export default createStore(connectedApp, initialState);
