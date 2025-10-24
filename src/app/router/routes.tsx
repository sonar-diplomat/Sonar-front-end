// src/app/router/routes.tsx
import { createBrowserRouter } from 'react-router-dom';
import { RegistrationTest } from '@pages/RegistrationTest';
import { MiniPlayerExample }from "@widgets/MiniPlayer";
import App from "@app/App.tsx";
import React from "react";
// Опционально, для обработки ошибок

export const router = createBrowserRouter([
    {
        element: <App />,
        //errorElement: <ErrorPage />,
        children: [
            {
                path: '/',
                element: <MiniPlayerExample />,
            },
            {
                path: '/register',
                element: <RegistrationTest />,
            },
            // Другие маршруты добавляй сюда
        ],
    },
]);
