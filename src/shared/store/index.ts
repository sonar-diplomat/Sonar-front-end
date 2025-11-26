import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import clientSettingsReducer from './features/clientSettings/clientSettingsSlice';
import userStateReducer from './features/userState/userStateSlice';
import accessReducer from './features/access/accessSlice';
import playerReducer from './features/player/playerSlice';
import { rtkApi } from '@shared/api/rtkApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clientSettings: clientSettingsReducer,
    userState: userStateReducer,
    access: accessReducer,
    player: playerReducer,
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

