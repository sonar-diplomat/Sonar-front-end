import { createBrowserRouter } from 'react-router-dom';
import { App }  from "@app/App.tsx";
import React from "react";
import {Hello, EntryMethod, Registration, TestPage, PasswordRecovery, AssignNewPassword} from "@pages";
import {Login} from "@pages/Login";
import {TermsOfService} from "@pages/Terms/TermsOfService/TermsOfService.tsx";

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
            // {
            //     path: '/',
            //     element: < />,
            // },
            {
                path: '/test',
                element: <TestPage />,
            },
            {
                path: '/terms',
                element: <TermsOfService />,
            }
        ],
    },
]);
