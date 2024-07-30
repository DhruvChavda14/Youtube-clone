import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from "react-redux";
import { applyMiddleware, compose } from 'redux';
import { legacy_createStore as createstore } from "redux"
import { thunk } from "redux-thunk"

import { GoogleOAuthProvider } from '@react-oauth/google';
import Reducers from './Reducers';
import { SocketProvider } from './Providers/Socket';
const store = createstore(Reducers, compose(applyMiddleware(thunk)));
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

  <Provider store={store}>
    
      <SocketProvider>
        <GoogleOAuthProvider clientId="764527884028-qbhpd91eauqu6p2l07f45e3nr2hi5ku4.apps.googleusercontent.com">
          <React.StrictMode>
            <App />
          </React.StrictMode>
        </GoogleOAuthProvider>
      </SocketProvider>
    
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();