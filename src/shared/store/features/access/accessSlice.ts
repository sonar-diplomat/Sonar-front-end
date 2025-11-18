import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AccessFeatureDTO } from '@entities/Access';

interface AccessState {
  userAccessFeatures: AccessFeatureDTO[];
  allAccessFeatures: AccessFeatureDTO[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AccessState = {
  userAccessFeatures: [],
  allAccessFeatures: [],
  isLoading: false,
  error: null,
};

const accessSlice = createSlice({
  name: 'access',
  initialState,
  reducers: {
    setUserAccessFeatures: (state, action: PayloadAction<AccessFeatureDTO[]>) => {
      state.userAccessFeatures = action.payload;
      state.error = null;
    },
    
    setAllAccessFeatures: (state, action: PayloadAction<AccessFeatureDTO[]>) => {
      state.allAccessFeatures = action.payload;
      state.error = null;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearAccess: (state) => {
      state.userAccessFeatures = [];
      state.allAccessFeatures = [];
      state.error = null;
    },
  },
});

export const { setUserAccessFeatures, setAllAccessFeatures, setLoading, setError, clearAccess } = accessSlice.actions;

// Селектор для проверки наличия функции доступа
export const selectHasAccessFeature = (state: { access: AccessState }, featureName: string): boolean => {
  return state.access.userAccessFeatures.some(feature => feature.name === featureName);
};
export default accessSlice.reducer;

