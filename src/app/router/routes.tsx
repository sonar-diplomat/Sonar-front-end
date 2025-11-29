import { createBrowserRouter } from 'react-router-dom';
import { App }  from "@app/App.tsx";
import React from "react";
import {
    Hello, EntryMethod, Registration, TestPage, PasswordRecovery, AssignNewPassword, Library, Create,
    CreatePlaylist, Search, CreateFolder, UserProfile, NotFound, Settings, AccountSettings, PrivacySettings,
    BlockedAccounts, AppearanceSettings, PlaybackSettings, About, ReportProblem, ActiveSessions
} from "@pages";
import {Login} from "@pages/Login";
import {TermsOfService} from "@pages/Terms/TermsOfService/TermsOfService.tsx";
import {ApiTestPage} from "@pages/TestPage";
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
                element: <PageLayout />,
                children: [
                    {
                        path: 'library',
                        children: [
                            { index: true, element: <Library /> },
                            {
                                path: 'create',
                                children: [
                                    {
                                        index: true,
                                        element: <Create />,
                                    },
                                    {
                                        path: 'playlist',
                                        element: <CreatePlaylist />,
                                    },
                                    {
                                        path: 'folder',
                                        element: <CreateFolder />,
                                    },
                                ],
                            }
                        ],
                    },
                    {
                        path: 'search',
                        element: <Search />,
                    },
                    {
                        path: 'profile',
                        element: <UserProfile />,
                    },
                    {
                        path: 'settings',
                        children: [
                            {
                                index: true,
                                element: <Settings />,
                            },
                            {
                                path: 'account',
                                element: <AccountSettings />,
                            },
                            {
                                path: 'sessions',
                                element: <ActiveSessions />,
                            },
                            {
                                path: 'privacy',
                                element: <PrivacySettings />,
                            },
                            {
                                path: 'blocked-accounts',
                                element: <BlockedAccounts />,
                            },
                            {
                                path: 'appearance',
                                element: <AppearanceSettings />,
                            },
                            {
                                path: 'playback',
                                element: <PlaybackSettings />,
                            },
                            {
                                path: 'about',
                                element: <About />,
                            },
                            {
                                path: 'report',
                                element: <ReportProblem />,
                            },
                        ],
                    },
                ],
            },
            {
                path: '/test',
                children: [
                    {
                        index: true,
                        element: <TestPage />,
                    },
                    {
                        path: 'api',
                        element: <ApiTestPage />,
                    },
                ],
            },
            {
                path: '*',
                element: <NotFound />
            }
        ],
    },
]);
