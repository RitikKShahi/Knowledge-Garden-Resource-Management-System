import { configureStore, combineReducers } from '@reduxjs/toolkit';

// Import the reducer slices
import authReducer from '../features/auth/authSlice.ts';

// Create a temporary placeholder reducer for resources and search until we fully implement them
const resourcesReducer = (state = { resources: [], isLoading: false, error: null }, action) => state;
const searchReducer = (state = { results: null, isLoading: false, error: null }, action) => state;

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  resources: resourcesReducer,
  search: searchReducer,
});

// Create the store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in specific paths
        ignoredActions: ['resources/uploadResource/pending'],
        ignoredPaths: ['resources.uploadData.file'],
      },
    }),
});

// Define types for state and dispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
