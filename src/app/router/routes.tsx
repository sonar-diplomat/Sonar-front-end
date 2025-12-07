import { createBrowserRouter } from 'react-router-dom';
import { App }  from "@app/App.tsx";
import React from "react";
import {
    Hello,
    EntryMethod,
    Registration,
    TestPage,
    PasswordRecovery,
    AssignNewPassword,
    ConfirmEmail,
    Library,
    Create,
    CreatePlaylist,
    Search,
    CreateFolder,
    UserProfile,
    ArtistProfile,
    Collection,
    NotFound,
    Settings,
    AccountSettings,
    PrivacySettings,
    BlockedAccounts,
    AppearanceSettings,
    PlaybackSettings,
    About,
    ActiveSessions,
    Chats,
    Chat,
    UserInfo,
    MacroPlayer,
} from "@pages";
import {Login} from "@pages/Login";
import {TermsOfService} from "@pages/Terms/TermsOfService/TermsOfService.tsx";
import {ApiTestPage} from "@pages/TestPage";
import {PageLayout} from "@widgets/PageLayout";
import {ChatLayout} from "@widgets/ChatLayout";
import {FirstVisitGuard} from "./FirstVisitGuard";

export const router = createBrowserRouter([
    {
        element: <App />,
        //errorElement: <ErrorPage />,
        children: [
            {
                path: '/',
                element: <FirstVisitGuard />,
            },
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
                path: '/confirm-email',
                element: <ConfirmEmail/>
            },
            {
                path: '/terms',
                element: <TermsOfService />,
            },
            {
                path: '/player/:trackId?',
                element: <MacroPlayer />,
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
                        path: 'user/:identifier',
                        element: <UserProfile />,
                    },
                    {
                        path: 'artist/:id',
                        element: <ArtistProfile />,
                    },
                    {
                        path: 'playlist/:id',
                        element: <Collection type="playlist" />,
                    },
                    {
                        path: 'album/:id',
                        element: <Collection type="album" />,
                    },
                    {
                        path: 'settings',
                        children: [
                            { index: true, element: <Settings /> },
                            { path: 'account', element: <AccountSettings /> },
                            { path: 'sessions', element: <ActiveSessions /> },
                            { path: 'privacy', element: <PrivacySettings /> },
                            { path: 'blocked-accounts', element: <BlockedAccounts /> },
                            { path: 'appearance', element: <AppearanceSettings /> },
                            { path: 'playback', element: <PlaybackSettings /> },
                            { path: 'about', element: <About /> },
                        ],
                    },
                    {
                        path: 'chats',
                        element: <ChatLayout />,
                        children: [
                            { index: true, element: <Chats /> },
                            { path: ':chatId', element: <Chat /> },
                            { path: ':chatId/info', element: <UserInfo /> },
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
                    }
                ],
            },
            {
                path: '*',
                element: <NotFound />
            }
        ],
    },
]);
