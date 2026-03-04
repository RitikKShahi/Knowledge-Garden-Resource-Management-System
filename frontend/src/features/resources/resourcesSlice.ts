import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import resourcesService, { 
  Resource, 
  ResourceFilter, 
  ResourceUpload, 
  ResourceUpdate,
  ResourceRating
} from '../../services/resourcesService';

interface ResourcesState {
  resources: Resource[];
  currentResource: Resource | null;
  isLoading: boolean;
  error: string | null;
  filter: ResourceFilter;
  total: number;
  uploadProgress: number;
}

const initialState: ResourcesState = {
  resources: [],
  currentResource: null,
  isLoading: false,
  error: null,
  filter: {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  total: 0,
  uploadProgress: 0
};

// Async thunks
export const fetchResources = createAsyncThunk<
  { resources: Resource[], total: number },
  ResourceFilter | undefined
>(
  'resources/fetchResources',
  async (filters = {}, { rejectWithValue }) => {
    try {
      return await resourcesService.getResources(filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch resources');
    }
  }
);

export const fetchResourceById = createAsyncThunk<Resource, string>(
  'resources/fetchResourceById',
  async (id, { rejectWithValue }) => {
    try {
      return await resourcesService.getResourceById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch resource');
    }
  }
);

export const uploadResource = createAsyncThunk<Resource, ResourceUpload>(
  'resources/uploadResource',
  async (resourceData, { rejectWithValue }) => {
    try {
      return await resourcesService.uploadResource(resourceData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload resource');
    }
  }
);

export const updateResource = createAsyncThunk<Resource, ResourceUpdate>(
  'resources/updateResource',
  async (updateData, { rejectWithValue }) => {
    try {
      return await resourcesService.updateResource(updateData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update resource');
    }
  }
);

export const deleteResource = createAsyncThunk<string, string>(
  'resources/deleteResource',
  async (id, { rejectWithValue }) => {
    try {
      await resourcesService.deleteResource(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete resource');
    }
  }
);

export const viewResource = createAsyncThunk<Resource, string>(
  'resources/viewResource',
  async (id, { rejectWithValue }) => {
    try {
      return await resourcesService.viewResource(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to record resource view');
    }
  }
);

export const rateResource = createAsyncThunk<Resource, ResourceRating>(
  'resources/rateResource',
  async (ratingData, { rejectWithValue }) => {
    try {
      return await resourcesService.rateResource(ratingData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to rate resource');
    }
  }
);

// Slice
const resourcesSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<ResourceFilter>) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    resetCurrentResource: (state) => {
      state.currentResource = null;
    },
    clearResourcesError: (state) => {
      state.error = null;
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Resources
      .addCase(fetchResources.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resources = action.payload.resources;
        state.total = action.payload.total;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Resource By ID
      .addCase(fetchResourceById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchResourceById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentResource = action.payload;
      })
      .addCase(fetchResourceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Upload Resource
      .addCase(uploadResource.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadResource.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resources = [action.payload, ...state.resources];
        state.uploadProgress = 100;
      })
      .addCase(uploadResource.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.uploadProgress = 0;
      })

      // Update Resource
      .addCase(updateResource.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateResource.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update in the resources array
        state.resources = state.resources.map(resource => 
          resource.id === action.payload.id ? action.payload : resource
        );
        // Update current resource if it's the one being viewed
        if (state.currentResource && state.currentResource.id === action.payload.id) {
          state.currentResource = action.payload;
        }
      })
      .addCase(updateResource.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete Resource
      .addCase(deleteResource.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteResource.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resources = state.resources.filter(resource => resource.id !== action.payload);
        if (state.currentResource && state.currentResource.id === action.payload) {
          state.currentResource = null;
        }
      })
      .addCase(deleteResource.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // View Resource
      .addCase(viewResource.fulfilled, (state, action) => {
        // Update the resource with updated view count
        if (state.currentResource && state.currentResource.id === action.payload.id) {
          state.currentResource = action.payload;
        }
        state.resources = state.resources.map(resource => 
          resource.id === action.payload.id ? action.payload : resource
        );
      })

      // Rate Resource
      .addCase(rateResource.fulfilled, (state, action) => {
        // Update the resource with new rating
        if (state.currentResource && state.currentResource.id === action.payload.id) {
          state.currentResource = action.payload;
        }
        state.resources = state.resources.map(resource => 
          resource.id === action.payload.id ? action.payload : resource
        );
      });
  },
});

export const { 
  setFilter, 
  resetCurrentResource, 
  clearResourcesError,
  setUploadProgress
} = resourcesSlice.actions;

export default resourcesSlice.reducer;
