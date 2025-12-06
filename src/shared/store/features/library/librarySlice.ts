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
        state.foldersList = action.payload;
        state.isDirty = false;
        state.lastUpdated = Date.now();
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

