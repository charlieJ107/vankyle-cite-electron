/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from "./App";
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);

