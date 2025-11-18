import { createBrowserRouter } from 'react-router-dom';
import { MiniPlayerExample }from "@widgets/MiniPlayer";
import { App }  from "@app/App.tsx";
import React from "react";
import {
    Hello,
    EntryMethod,
    Registration,
    TestPage,
    PasswordRecovery,
    AssignNewPassword,
    Library,
    Create,
    CreatePlaylist,
    CreateFolder,
    Search
} from "@pages";
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
                path: '/password-recovery',
                element: <PasswordRecovery/>
            },
            {
                path: '/assign-new-password',
                element: <AssignNewPassword/>
            },
            {
                path: '/library',
                element: <Library/>
            },
            {
                path: '/library/create',
                element: <Create/>
            },
            {
                path: '/library/create/playlist',
                element: <CreatePlaylist/>
            },
            {
                path: '/library/create/folder',
                element: <CreateFolder/>
            },
            {
                path: '/search',
                element: <Search/>
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
