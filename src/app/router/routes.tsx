import React,{ type ComponentType } from 'react';

import { createBrowserRouter,createHashRouter,Link,type RouteObject } from 'react-router-dom';

import { App } from '@app/App';
import { isDemoMode } from '@shared/config/data-source';
import { PageLayout } from '@widgets/PageLayout';

import { FirstVisitGuard } from './FirstVisitGuard';

const page = (load: () => Promise<object>, name: string) => async () => ({
    Component: (await load() as Record<string, ComponentType>)[name],
});
const RouteError = () => <main style={{ padding: 32 }}><h1>Unable to open this page</h1><p>Please try again or return to the catalog.</p><Link to="/home">Go home</Link></main>;
const routes: RouteObject[] = [{
    HydrateFallback: () => <main role="status" style={{ padding: 24 }}>Loading Sonar…</main>,
    element: <App />, errorElement: <RouteError />,
    children: [
        { path: '/', element: <FirstVisitGuard /> },
        { path: 'hello', lazy: page(() => import('@pages/Hello'), 'Hello') },
        { path: 'entry', lazy: page(() => import('@pages/EntryMethod'), 'EntryMethod') },
        { path: 'register', lazy: page(() => import('@pages/Registration'), 'Registration') },
        { path: 'login', lazy: page(() => import('@pages/Login'), 'Login') },
        { path: 'password-recovery', lazy: page(() => import('@pages/PasswordRecovery'), 'PasswordRecovery') },
        { path: 'assign-new-password', lazy: page(() => import('@pages/AssignNewPassword'), 'AssignNewPassword') },
        { path: 'reset-password', lazy: page(() => import('@pages/AssignNewPassword'), 'AssignNewPassword') },
        { path: 'confirm-email-change', lazy: page(() => import('@pages/ConfirmEmail'), 'ConfirmEmail') },
        { path: 'confirm-email', lazy: page(() => import('@pages/ConfirmEmail'), 'ConfirmEmail') },
        { path: 'terms', lazy: page(() => import('@pages/Terms/TermsOfService/TermsOfService'), 'TermsOfService') },
        { element: <PageLayout />, children: [
            { path: 'home', lazy: page(() => import('@pages/MainPage'), 'MainPage') },
            { path: 'library', children: [
                { index: true, lazy: page(() => import('@pages/Library'), 'Library') },
                { path: 'create', children: [
                    { index: true, lazy: page(() => import('@pages/Library/ui/Create'), 'Create') },
                    { path: 'playlist', lazy: page(() => import('@pages/Library/ui/CreatePlaylist'), 'CreatePlaylist') },
                    { path: 'folder', lazy: page(() => import('@pages/Library/ui/CreateFolder'), 'CreateFolder') },
                ] },
            ] },
            { path: 'search', lazy: page(() => import('@pages/Search'), 'Search') },
            { path: 'user/:identifier', lazy: page(() => import('@pages/UserProfile'), 'UserProfile') },
            { path: 'artist/:id', children: [
                { index: true, lazy: page(() => import('@pages/ArtistProfile'), 'ArtistProfile') },
                { path: 'posts', lazy: page(() => import('@pages/ArtistProfile/ui/ArtistPosts'), 'ArtistPosts'), children: [
                    { path: 'create', lazy: page(() => import('@pages/CreatePost'), 'CreatePost') },
                ] },
            ] },
            { path: 'playlist/:id', lazy: async () => { const { Collection } = await import('@pages/Collection'); return { Component: () => <Collection type="playlist" /> }; } },
            { path: 'album/:id', lazy: async () => { const { Collection } = await import('@pages/Collection'); return { Component: () => <Collection type="album" /> }; } },
            { path: 'track/:id', lazy: page(() => import('@pages/Track/Track'), 'Track') },
            { path: 'premium', lazy: page(() => import('@pages/Premium/Premium'), 'Premium') },
            { path: 'report', lazy: page(() => import('@pages/Report/Report'), 'Report') },
            { path: 'settings', children: [
                { index: true, lazy: page(() => import('@pages/Settings/ui/Settings'), 'Settings') },
                { path: 'account', lazy: page(() => import('@pages/Settings/ui/AccountSettings'), 'AccountSettings') },
                { path: 'sessions', lazy: page(() => import('@pages/Settings/ui/ActiveSessions'), 'ActiveSessions') },
                { path: 'privacy', lazy: page(() => import('@pages/Settings/ui/PrivacySettings'), 'PrivacySettings') },
                { path: 'blocked-accounts', lazy: page(() => import('@pages/Settings/ui/BlockedAccounts'), 'BlockedAccounts') },
                { path: 'appearance', lazy: page(() => import('@pages/Settings/ui/AppearanceSettings'), 'AppearanceSettings') },
                { path: 'playback', lazy: page(() => import('@pages/Settings/ui/PlaybackSettings'), 'PlaybackSettings') },
                { path: 'about', lazy: page(() => import('@pages/Settings/ui/About'), 'About') },
            ] },
            { path: 'chats', lazy: page(() => import('@widgets/ChatLayout'), 'ChatLayout'), children: [
                { index: true, lazy: page(() => import('@pages/Chats'), 'Chats') },
                { path: ':chatId', lazy: page(() => import('@pages/Chat'), 'Chat') },
                { path: ':chatId/info', lazy: page(() => import('@pages/UserInfo'), 'UserInfo') },
            ] },
        ] },
        { path: 'test', lazy: page(() => import('@pages/TestPage/TestPage'), 'TestPage') },
        { path: 'test/api', lazy: page(() => import('@pages/TestPage/ApiTestPage'), 'ApiTestPage') },
        { path: '*', lazy: page(() => import('@pages/NotFound'), 'NotFound') },
    ],
}];
export const router = isDemoMode ? createHashRouter(routes) : createBrowserRouter(routes, { basename: import.meta.env.BASE_URL });
