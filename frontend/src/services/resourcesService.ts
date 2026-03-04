import api from './api';

// Types
export interface Resource {
  _id: string;
  title: string;
  description?: string;
  file_url: string;
  file_path?: string;
  file_key?: string;
  file_size: number;
  mime_type: string;
  owner_id: number | string;
  is_public: boolean;
  resourceType: string;
  tags?: string[];
  categories?: string[];
  view_count: number;
  download_count: number;
  average_rating: number;
  is_featured: boolean;
  is_indexed: boolean;
  created_at: string;
  updated_at: string;
  __v?: number;

  // Keep backwards compatibility with existing code
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResourceFilter {
  search?: string;
  resourceType?: string;
  tags?: string[];
  categories?: string[];
  isPublic?: boolean;
  ownerId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ResourceUpload {
  title: string;
  description?: string;
  file: File;
  resourceType: string;
  tags?: string[];
  categories?: string[];
  is_public: boolean;
}

export interface ResourceUpdate {
  id: string;
  title?: string;
  description?: string;
  resourceType?: string;
  tags?: string[];
  categories?: string[];
  is_public?: boolean;
}

export interface ResourceRating {
  resourceId: string;
  rating: number; // 1-5
  comment?: string;
}

// Resources service functions
const resourcesService = {
  // Get resources with filtering and pagination
  getResources: async (filters: ResourceFilter = {}): Promise<{ resources: Resource[], total: number }> => {
    const response = await api.get('/api/resources', { params: filters });
    console.log('Resources API response:', response.data);

    // Handle different response formats
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      // Backend API returns {success: true, data: [...], pagination: {...}}
      return {
        resources: response.data.data,
        total: response.data.pagination?.total || response.data.data.length
      };
    } else if (Array.isArray(response.data)) {
      // API returns a direct array
      return {
        resources: response.data,
        total: response.data.length
      };
    } else if (response.data && Array.isArray(response.data.resources)) {
      // API already returns the expected format
      return response.data;
    } else {
      // Fallback for unexpected format
      console.error('Unexpected response format from resources API:', response.data);
      return {
        resources: [],
        total: 0
      };
    }
  },

  // Get a single resource by ID
  getResourceById: async (id: string): Promise<Resource> => {
    const response = await api.get(`/api/resources/${id}`);
    return response.data;
  },

  // Upload a new resource
  uploadResource: async (formData: FormData): Promise<Resource> => {
    const response = await api.post('/api/resources', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Download a resource
  downloadResource: async (resourceId: string): Promise<void> => {
    try {
      const response = await api.get(`/api/resources/download/${resourceId}`, {
        responseType: 'blob'
      });

      // Get the content type from the response
      const contentType = response.headers['content-type'] || 'application/octet-stream';

      // Create a blob with the correct content type
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Try to get filename from the content-disposition header
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'download';

      if (contentDisposition) {
        // Extract filename from Content-Disposition header (handling different formats)
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
          // Remove quotes if present
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      // If no extension in filename, try to add one based on content type
      if (!filename.includes('.') && contentType && contentType !== 'application/octet-stream') {
        const mimeToExt: Record<string, string> = {
          'application/pdf': '.pdf',
          'image/jpeg': '.jpg',
          'image/png': '.png',
          'text/plain': '.txt',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx'
        };

        const ext = mimeToExt[contentType];
        if (ext) filename += ext;
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading resource:', error);
      throw error;
    }
  },

  // Update resource metadata
  updateResource: async (updateData: ResourceUpdate): Promise<Resource> => {
    const { id, ...data } = updateData;
    const response = await api.put(`/api/resources/${id}`, data);
    return response.data;
  },

  // Delete a resource
  deleteResource: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/api/resources/${id}`);
    return response.data;
  },

  // Increment download count (used internally)
  incrementDownloadCount: async (id: string): Promise<Resource> => {
    const response = await api.post(`/api/resources/${id}/download`);
    return response.data;
  },

  // View a resource (increments view count)
  viewResource: async (id: string): Promise<Resource> => {
    const response = await api.post(`/api/resources/${id}/view`);
    return response.data;
  },

  // Rate a resource
  rateResource: async (ratingData: ResourceRating): Promise<Resource> => {
    const response = await api.post(`/api/resources/${ratingData.resourceId}/rate`, {
      rating: ratingData.rating,
      comment: ratingData.comment,
    });
    return response.data;
  },

  // Get user's resources
  getUserResources: async (userId: string): Promise<Resource[]> => {
    const response = await api.get(`/api/resources/user/${userId}`);
    console.log('User resources API response:', response.data);

    // Handle different response formats
    // If response is wrapped in a data field, extract it
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    // If response is already an array, use it directly
    else if (Array.isArray(response.data)) {
      return response.data;
    }
    // Otherwise, return an empty array to prevent errors
    else {
      console.error('Unexpected response format from resources API:', response.data);
      return [];
    }
  },
};

export default resourcesService;
