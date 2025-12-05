import React, {StrictMode} from 'react'
import { createRoot } from 'react-dom/client'
import {RouterProvider} from 'react-router-dom'
import { Provider } from 'react-redux'
import './app/styles/index.css';
import { router } from "./app/router/routes.tsx";
import { store } from '@shared/store';
import { NotificationProvider } from './shared/store/notificationStore';

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Provider store={store}>
            <NotificationProvider>
                <RouterProvider router={router} />
            </NotificationProvider>
        </Provider>
    </StrictMode>
);