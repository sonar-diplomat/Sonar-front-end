import { combineReducers,configureStore,type Middleware,type UnknownAction } from '@reduxjs/toolkit';

import { rtkApi } from '@shared/api/rtkApi';

import accessReducer from './features/access/accessSlice';
import authReducer from './features/auth/authSlice';
import clientSettingsReducer from './features/clientSettings/clientSettingsSlice';
import libraryReducer from './features/library/librarySlice';
import playerReducer,{ clearQueue } from './features/player/playerSlice';
import searchReducer from './features/search/searchSlice';
import userStateReducer from './features/userState/userStateSlice';

// Импортируем все API модули для инжекции endpoints после инициализации rtkApi
import '@shared/api/rtkApiEndpoints';
// Импортируем hooks после инициализации endpoints
// Это гарантирует, что все endpoints уже инжектированы перед экспортом hooks
import '@shared/api/rtkApiHooks';

const combinedReducer = combineReducers({
    auth: authReducer,
    clientSettings: clientSettingsReducer,
    userState: userStateReducer,
    access: accessReducer,
    player: playerReducer,
    library: libraryReducer,
    search: searchReducer,
    [rtkApi.reducerPath]: rtkApi.reducer,
});

type CombinedState = ReturnType<typeof combinedReducer>;
function rootReducer(state: CombinedState | undefined, action: UnknownAction): CombinedState {
  const next = combinedReducer(state, action);
  // Session boundaries discard every projection and query result from the old user.
  // Ordinary token refreshes retain the session version and its loaded data.
  if (state && next.auth.sessionVersion !== state.auth.sessionVersion) {
    const fresh = combinedReducer(undefined, { type: '@@session/reset' });
    const player = { ...playerReducer(state.player, clearQueue()), favoriteTrackIds: [] };
    return { ...fresh, auth: next.auth, player };
  }
  return next;
}

const sessionBoundaryMiddleware: Middleware<object, CombinedState> = api => next => action => {
  const version = api.getState().auth.sessionVersion;
  const result = next(action);
  if (version !== api.getState().auth.sessionVersion) api.dispatch(rtkApi.util.resetApiState());
  return result;
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Игнорируем проверку для определенных действий, если нужно
        ignoredActions: [],
      },
    }).concat(sessionBoundaryMiddleware, rtkApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

