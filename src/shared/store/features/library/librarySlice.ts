import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { FolderDTO } from '@entities/Library';
import { libraryApi } from '@entities/Library/api/rtkApi';

export interface LibraryState {
  foldersList: FolderDTO[] | null;
  foldersCache: Record<number, FolderDTO>;
  isDirty: boolean;
  lastUpdated: number | null;
}

const initialState: LibraryState = {
  foldersList: null,
  foldersCache: {},
  isDirty: true, // Начальное состояние - данные нужно загрузить
  lastUpdated: null,
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    setFoldersList: (state, action: PayloadAction<FolderDTO[]>) => {
      state.foldersList = action.payload;
      state.isDirty = false;
      state.lastUpdated = Date.now();
    },
    setFolder: (state, action: PayloadAction<FolderDTO>) => {
      state.foldersCache[action.payload.id] = action.payload;
      state.isDirty = false;
      state.lastUpdated = Date.now();
    },
    markDirty: (state) => {
      state.isDirty = true;
    },
    clearCache: (state) => {
      state.foldersList = null;
      state.foldersCache = {};
      state.isDirty = true;
      state.lastUpdated = null;
    },
    removeFolderFromCache: (state, action: PayloadAction<number>) => {
      delete state.foldersCache[action.payload];
      // Если удалена папка из списка, нужно обновить список
      if (state.foldersList) {
        state.foldersList = state.foldersList.filter(f => f.id !== action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    // Обработка успешных запросов getFolders
    builder.addMatcher(
      libraryApi.endpoints.getFolders.matchFulfilled,
      (state, action) => {
        // Убеждаемся, что payload является массивом
        if (Array.isArray(action.payload)) {
          state.foldersList = action.payload;
          state.isDirty = false;
          state.lastUpdated = Date.now();
        } else {
          console.error('[librarySlice] getFolders returned non-array data:', {
            type: typeof action.payload,
            isArray: Array.isArray(action.payload),
            payload: action.payload,
          });
          // Пытаемся извлечь массив из объекта, если данные обернуты
          if (action.payload && typeof action.payload === 'object' && 'data' in action.payload && Array.isArray(action.payload.data)) {
            console.warn('[librarySlice] Extracting array from wrapped response');
            state.foldersList = action.payload.data;
            state.isDirty = false;
            state.lastUpdated = Date.now();
          } else {
            state.foldersList = null;
          }
        }
      }
    );

    // Обработка успешных запросов getFolder
    builder.addMatcher(
      libraryApi.endpoints.getFolder.matchFulfilled,
      (state, action) => {
        state.foldersCache[action.payload.id] = action.payload;
        state.isDirty = false;
        state.lastUpdated = Date.now();
      }
    );
  },
});

export const {
  setFoldersList,
  setFolder,
  markDirty,
  clearCache,
  removeFolderFromCache,
} = librarySlice.actions;

export default librarySlice.reducer;

