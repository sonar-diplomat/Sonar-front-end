import { createBrowserRouter } from 'react-router-dom';
import { App }  from "@app/App.tsx";
import React from "react";
import {
    Hello, EntryMethod, Registration, TestPage, PasswordRecovery, AssignNewPassword, Library, Create,
    CreatePlaylist, Search, CreateFolder, UserProfile
} from "@pages";
import {Login} from "@pages/Login";
import {TermsOfService} from "@pages/Terms/TermsOfService/TermsOfService.tsx";
import {PageLayout} from "@widgets/PageLayout";

export const router = createBrowserRouter([
    {
        element: <App />,
        //errorElement: <ErrorPage />,
        children: [
            // Auth pages without music player
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
                path: '/terms',
                element: <TermsOfService />,
            },
            {
              path: '/test',
              element: <TestPage/>
            },
            {
                path: 'library/create',
                element: <Create/>
            },
            {
                path: 'library/create-playlist',
                element: <CreatePlaylist/>
            },
            {
                path: 'library/create-folder',
                element: <CreateFolder/>
            },
            // Pages with music player and navigation
            {
                element: <PageLayout />,
                children: [
                    {
                        path: '/library',
                        element: <Library/>
                    },
                    {
                        path: '/search',
                        element: <Search/>
                    },
                    {
                        path: '/profile',
                        element: <UserProfile/>
                    },
                ]
            }
        ],
    },
]);
