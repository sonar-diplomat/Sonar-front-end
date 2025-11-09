// src/app/router/routes.tsx
import { createBrowserRouter } from 'react-router-dom';
import { MiniPlayerExample }from "@widgets/MiniPlayer";
import { App }  from "@app/App.tsx";
import React from "react";
import {Hello, EntryMethod, Registration, RegistrationTest} from "@pages";


export const router = createBrowserRouter([
    {
        element: <App />,
        //errorElement: <ErrorPage />,
        children: [
            {
                path: '/hello',
                element: <Hello />,
            },
            {
                path: '/entry',
                element: <EntryMethod />,
            },
            {
                path: '/register',
                element: <Registration />,
            },
            {
                path: '/',
                element: <MiniPlayerExample />,
            },
            {
                path: '/test/register',
                element: <RegistrationTest />,
            }

            // Другие маршруты добавляй сюда
        ],
    },
]);
