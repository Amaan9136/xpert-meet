import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { createStore } from "redux";
import AppContextProvider from "./AppContext";
import Loader from './AppLoader';
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { userReducer } from "./store/reducer";


export const store = createStore(userReducer);
// store has all the values of db

const routes = [
  {
    path: "/",
    component: React.lazy(() => import("./App.js")),
  },
  {
    path: "/summary",
    component: React.lazy(() => import("./pages/Summary/Summary.js")),
  },
  {
    path: "/internet",
    component: React.lazy(() => import("./pages/NoInternet/NoInternet.component.js")),
  },
];

const Root = () => (
  <Router>
    <Provider store={store}>
      <AppContextProvider>
        <Suspense fallback={<Loader />}>
          <Routes>
            {routes.map(({ path, component: Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Routes>
        </Suspense>
      </AppContextProvider>
    </Provider>
  </Router>
);


const app = ReactDOM.createRoot(document.getElementById("app"));
app.render(
    <Root />
);

reportWebVitals();