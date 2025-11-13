import { createBrowserRouter } from 'react-router-dom';
import { MiniPlayerExample }from "@widgets/MiniPlayer";
import { App }  from "@app/App.tsx";
import React from "react";
import {Hello, EntryMethod, Registration, TestPage} from "@pages";
import {Login} from "@pages/Login";


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
                path: '/login',
                element: <Login/>
            },
            {
                path: '/',
                element: <MiniPlayerExample />,
            },
            {
                path: '/test',
                element: <TestPage />,
            }

            // Другие маршруты добавляй сюда
        ],
    },
]);
