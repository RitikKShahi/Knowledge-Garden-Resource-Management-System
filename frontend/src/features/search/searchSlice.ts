import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import searchService, { SearchParams, SearchResult, SearchSuggestion } from '../../services/searchService';

interface SearchState {
  results: SearchResult | null;
  suggestions: SearchSuggestion[];
  searchHistory: Array<{ id: string; query: string; createdAt: string }>;
  trendingSearches: Array<{ query: string; count: number }>;
  isLoading: boolean;
  error: string | null;
  currentQuery: string;
}

const initialState: SearchState = {
  results: null,
  suggestions: [],
  searchHistory: [],
  trendingSearches: [],
  isLoading: false,
  error: null,
  currentQuery: '',
};

// Async thunks
export const performSearch = createAsyncThunk<SearchResult, SearchParams>(
  'search/performSearch',
  async (searchParams, { rejectWithValue }) => {
    try {
      return await searchService.search(searchParams);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const fetchSuggestions = createAsyncThunk<SearchSuggestion[], string>(
  'search/fetchSuggestions',
  async (query, { rejectWithValue }) => {
    try {
      return await searchService.getSuggestions(query);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch suggestions');
    }
  }
);

export const fetchSearchHistory = createAsyncThunk<
  Array<{ id: string; query: string; createdAt: string }>,
  void
>(
  'search/fetchSearchHistory',
  async (_, { rejectWithValue }) => {
    try {
      return await searchService.getSearchHistory();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch search history');
    }
  }
);

export const saveSearchQuery = createAsyncThunk<
  { id: string; query: string },
  string
>(
  'search/saveSearchQuery',
  async (query, { rejectWithValue }) => {
    try {
      return await searchService.saveSearch(query);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save search');
    }
  }
);

export const deleteSearchHistory = createAsyncThunk<string, string>(
  'search/deleteSearchHistory',
  async (id, { rejectWithValue }) => {
    try {
      await searchService.deleteSearch(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete search');
    }
  }
);

export const fetchTrendingSearches = createAsyncThunk<
  Array<{ query: string; count: number }>,
  void
>(
  'search/fetchTrendingSearches',
  async (_, { rejectWithValue }) => {
    try {
      return await searchService.getTrendingSearches();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trending searches');
    }
  }
);

export const performAdvancedSearch = createAsyncThunk<SearchResult, SearchParams>(
  'search/performAdvancedSearch',
  async (searchParams, { rejectWithValue }) => {
    try {
      return await searchService.advancedSearch(searchParams);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Advanced search failed');
    }
  }
);

// Slice
const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setCurrentQuery: (state, action: PayloadAction<string>) => {
      state.currentQuery = action.payload;
    },
    clearSearchResults: (state) => {
      state.results = null;
    },
    clearSearchError: (state) => {
      state.error = null;
    },
    clearSuggestions: (state) => {
      state.suggestions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Perform Search
      .addCase(performSearch.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(performSearch.fulfilled, (state, action: PayloadAction<SearchResult>) => {
        state.isLoading = false;
        state.results = action.payload;
        // Update current query from results
        state.currentQuery = action.payload.query;
      })
      .addCase(performSearch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Suggestions
      .addCase(fetchSuggestions.pending, (state) => {
        // Don't set full loading state for suggestions to avoid UI flicker
        state.error = null;
      })
      .addCase(fetchSuggestions.fulfilled, (state, action: PayloadAction<SearchSuggestion[]>) => {
        state.suggestions = action.payload;
      })
      .addCase(fetchSuggestions.rejected, (state, action) => {
        state.error = action.payload as string;
        state.suggestions = []; // Clear suggestions on error
      })

      // Fetch Search History
      .addCase(fetchSearchHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSearchHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchHistory = action.payload;
      })
      .addCase(fetchSearchHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Save Search Query
      .addCase(saveSearchQuery.fulfilled, (state, action) => {
        // Add to history if not already present
        const exists = state.searchHistory.some(item => item.query === action.payload.query);
        if (!exists) {
          state.searchHistory = [
            { ...action.payload, createdAt: new Date().toISOString() },
            ...state.searchHistory
          ];
        }
      })

      // Delete Search History
      .addCase(deleteSearchHistory.fulfilled, (state, action) => {
        state.searchHistory = state.searchHistory.filter(item => item.id !== action.payload);
      })

      // Fetch Trending Searches
      .addCase(fetchTrendingSearches.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTrendingSearches.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trendingSearches = action.payload;
      })
      .addCase(fetchTrendingSearches.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Advanced Search
      .addCase(performAdvancedSearch.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(performAdvancedSearch.fulfilled, (state, action: PayloadAction<SearchResult>) => {
        state.isLoading = false;
        state.results = action.payload;
      })
      .addCase(performAdvancedSearch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentQuery,
  clearSearchResults,
  clearSearchError,
  clearSuggestions
} = searchSlice.actions;

export default searchSlice.reducer;
