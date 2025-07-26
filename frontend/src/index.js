import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from '../src/app/App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';


const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// render 이후에 서비스워커 등록
serviceWorkerRegistration.register();
