import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import clientSettingsReducer from './features/clientSettings/clientSettingsSlice';
import userStateReducer from './features/userState/userStateSlice';
import accessReducer from './features/access/accessSlice';
import playerReducer from './features/player/playerSlice';
import libraryReducer from './features/library/librarySlice';
import searchReducer from './features/search/searchSlice';
import { rtkApi } from '@shared/api/rtkApi';

// Импортируем все API модули для инжекции endpoints после инициализации rtkApi
import '@shared/api/rtkApiEndpoints';
// Импортируем hooks после инициализации endpoints
// Это гарантирует, что все endpoints уже инжектированы перед экспортом hooks
import '@shared/api/rtkApiHooks';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clientSettings: clientSettingsReducer,
    userState: userStateReducer,
    access: accessReducer,
    player: playerReducer,
    library: libraryReducer,
    search: searchReducer,
    [rtkApi.reducerPath]: rtkApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Игнорируем проверку для определенных действий, если нужно
        ignoredActions: [],
      },
    }).concat(rtkApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

