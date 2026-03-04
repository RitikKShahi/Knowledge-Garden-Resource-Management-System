import api from './api';
import { Resource } from './resourcesService';

// Types
export interface SearchParams {
  query: string;
  filters?: {
    resourceType?: string[];
    tags?: string[];
    categories?: string[];
    dateRange?: {
      start?: string;
      end?: string;
    };
    owner?: string;
  };
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  resources: Resource[];
  total: number;
  page: number;
  limit: number;
  query: string;
}

export interface SearchSuggestion {
  text: string;
  type: string;
  count?: number;
}

// Search service functions
const searchService = {
  // Perform a global search
  search: async (query: string, page: number = 1, limit: number = 10): Promise<SearchResult> => {
    const response = await api.get('/api/search', { 
      params: { q: query, page, limit } 
    });
    
    // Handle the response format from the backend
    if (response.data && response.data.success) {
      // The resources are in the data.hits array
      const hits = response.data.data && response.data.data.hits ? response.data.data.hits : [];
      const total = response.data.data && response.data.data.total ? response.data.data.total : 0;
      
      return {
        resources: hits,
        total: total,
        page: response.data.meta?.page || page,
        limit: response.data.meta?.limit || limit,
        query
      };
    }
    
    // Fallback
    return {
      resources: [],
      total: 0,
      page,
      limit,
      query
    };
  },
  
  // Get search suggestions as user types
  getSuggestions: async (query: string, limit: number = 5): Promise<SearchSuggestion[]> => {
    try {
      const response = await api.get('/api/search/suggestions', { 
        params: { q: query, limit } 
      });
      
      // Handle API response format: {"success":true,"data":["suggestion1", "suggestion2"],"meta":{"authenticated":false}}
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        // Handle the case where data is an array of strings
        return response.data.data.map((suggestion: any) => {
          if (typeof suggestion === 'string') {
            return {
              text: suggestion,
              type: 'query'
            };
          } else if (typeof suggestion === 'object' && suggestion !== null) {
            return {
              text: suggestion.text || suggestion.query || suggestion.term || '',
              type: suggestion.type || 'query',
              count: 0
            };
          }
        }).filter((s: any) => !!s.text);
      } else if (Array.isArray(response.data)) {
        return response.data.map((suggestion: any) => {
          if (typeof suggestion === 'string') {
            return {
              text: suggestion,
              type: 'query'
            };
          } else {
            return {
              text: suggestion.text || suggestion.query || suggestion.term || '',
              type: suggestion.type || 'query',
              count: 0
            };
          }
        }).filter((s: any) => !!s.text);
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      return [];
    }
  },
  
  // Save a search query to user's history
  saveSearch: async (query: string): Promise<{ id: string; query: string }> => {
    const response = await api.post('/search/history', { query });
    return response.data;
  },
  
  // Get user's search history
  getSearchHistory: async (): Promise<{ id: string; query: string; createdAt: string }[]> => {
    const response = await api.get('/search/history');
    return response.data;
  },
  
  // Delete a search from history
  deleteSearch: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/search/history/${id}`);
    return response.data;
  },
  
  // Get popular/trending searches
  getTrendingSearches: async (): Promise<{ query: string; count: number }[]> => {
    const response = await api.get('/search/trending');
    return response.data;
  },
  
  // Advanced search with more complex query options
  advancedSearch: async (query: string, filters: any = {}, page: number = 1, limit: number = 10): Promise<SearchResult> => {
    // Convert filters to query parameters
    const params: any = { q: query, page, limit, ...filters };
    
    const response = await api.get('/api/search/advanced', { params });
    
    if (response.data && response.data.success) {
      // The resources are in the data.hits array
      const hits = response.data.data && response.data.data.hits ? response.data.data.hits : [];
      const total = response.data.data && response.data.data.total ? response.data.data.total : 0;
      
      return {
        resources: hits,
        total: total,
        page: response.data.meta?.page || page,
        limit: response.data.meta?.limit || limit,
        query
      };
    }
    
    return {
      resources: [],
      total: 0,
      page,
      limit,
      query
    };
  }
};

export default searchService;
