import React, { useState, useEffect, useCallback, useRef } from 'react';
import searchService, { SearchResult, SearchSuggestion } from '../services/searchService';
import resourcesService, { Resource } from '../services/resourcesService';
import { debounce } from 'lodash';
import { 
  Search as SearchIcon, Filter, Download,
  Book, ChevronDown, CheckSquare, Square, Loader, X 
} from 'lucide-react';

const SearchPage: React.FC = () => {

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Resource[]>([]);
  const [showNoResults, setShowNoResults] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(10);

  // Suggestions state
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Advanced filters state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Refs for dropdown handling
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Options for filters
  const resourceTypes = [
    'article', 'document', 'presentation', 'spreadsheet',
    'image', 'video', 'audio', 'code', 'dataset', 'other'
  ];
  
  const categoryOptions = [
    'documentation', 'research', 'tutorial', 'guide',
    'report', 'academic', 'project', 'reference'
  ];

  // Handle global click for closing suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current && 
        !searchInputRef.current.contains(event.target as Node) &&
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle dropdown for resource types
  const toggleResourceTypeDropdown = () => {
    const dropdown = document.getElementById('resourceTypeDropdown');
    if (dropdown) {
      dropdown.classList.toggle('hidden');
    }
  };

  // Toggle dropdown for categories
  const toggleCategoryDropdown = () => {
    const dropdown = document.getElementById('categoryDropdown');
    if (dropdown) {
      dropdown.classList.toggle('hidden');
    }
  };

  // Toggle type selection
  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };
  
  // Toggle category selection
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedCategories([]);
  };

  // Apply search with filters
  const applySearch = () => {
    let filters: any = {};
    
    if (selectedTypes.length > 0) {
      filters.resourceType = selectedTypes.join(',');
    }
    
    if (selectedCategories.length > 0) {
      filters.categories = selectedCategories.join(',');
    }
    
    performSearch(searchQuery, filters);
    setShowFilters(false);
  };

  // Perform search
  const performSearch = async (query: string, filters: any = {}) => {
    if (!query || !query.trim()) {
      setSearchResults([]);
      setTotalResults(0);
      setShowNoResults(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      let result: SearchResult;
      
      if (Object.keys(filters).length > 0) {
        result = await searchService.advancedSearch(query, filters, currentPage, resultsPerPage);
      } else {
        result = await searchService.search(query, currentPage, resultsPerPage);
      }
      
      // Ensure we have valid resources
      const validResources = Array.isArray(result.resources) ? result.resources : [];
      
      setSearchResults(validResources);
      setTotalResults(result.total || validResources.length);
      setShowNoResults(validResources.length === 0);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setTotalResults(0);
      setShowNoResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch suggestions as user types
  const fetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (!query || !query.trim() || query.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      
      try {
        const suggestionsResult = await searchService.getSuggestions(query);
        // Ensure we have valid suggestions with the required text property
        const validSuggestions = Array.isArray(suggestionsResult) 
          ? suggestionsResult.filter(s => s && typeof s.text === 'string')
          : [];
          
        setSuggestions(validSuggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    }, 300),
    []
  );

  // Update suggestions when search query changes
  useEffect(() => {
    if (searchQuery && searchQuery.trim()) {
      fetchSuggestions(searchQuery);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, fetchSuggestions]);

  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSuggestions(true);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion && suggestion.text) {
      setSearchQuery(suggestion.text);
      setShowSuggestions(false);
      performSearch(suggestion.text);
    }
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
    setShowSuggestions(false);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    
    // Reapply search with the new page
    let filters: any = {};
    
    if (selectedTypes.length > 0) {
      filters.resourceType = selectedTypes.join(',');
    }
    
    if (selectedCategories.length > 0) {
      filters.categories = selectedCategories.join(',');
    }
    
    performSearch(searchQuery, filters);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Unknown date';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (error) {
      return dateString;
    }
  };

  // Handle resource download
  const handleDownloadResource = async (resourceId: string) => {
    try {
      await resourcesService.downloadResource(resourceId);
    } catch (error) {
      console.error('Failed to download resource:', error);
      alert('Failed to download resource. Please try again later.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Search Knowledge Garden</h1>
          <p className="text-gray-600">Find resources, documents, and more</p>
        </div>
        
        <div className="flex mt-4 md:mt-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters {Object.keys(selectedTypes).length + Object.keys(selectedCategories).length > 0 && 
              `(${Object.keys(selectedTypes).length + Object.keys(selectedCategories).length})`}
          </button>
        </div>
      </div>
      
      {/* Search Form */}
      <div className="mb-8">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="relative">
            <input
              type="text"
              ref={searchInputRef}
              value={searchQuery}
              onChange={handleSearchInputChange}
              placeholder="Search for resources, documents, topics..."
              className="w-full px-10 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            {searchQuery && (
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowNoResults(false);
                }}
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          
          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div 
              ref={suggestionsRef}
              className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
            >
              <ul>
                {suggestions.map((suggestion, index) => (
                  <li 
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <SearchIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{suggestion && suggestion.text ? suggestion.text : ''}</span>
                    {suggestion && suggestion.count && (
                      <span className="ml-auto text-xs text-gray-500">{suggestion.count}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <button
            type="submit"
            className="mt-3 w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </form>
      </div>
      
      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Filter Results</h2>
            <button 
              onClick={() => setShowFilters(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {/* Resource Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resource Types</label>
              <div className="relative z-10">
                <button
                  type="button"
                  className="w-full flex justify-between items-center px-4 py-2 border border-gray-300 rounded-md bg-white"
                  onClick={toggleResourceTypeDropdown}
                >
                  <span>{selectedTypes.length > 0 ? `${selectedTypes.length} selected` : 'Select types'}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                <div id="resourceTypeDropdown" className="absolute z-20 hidden mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  <div className="p-2 space-y-1">
                    {resourceTypes.map((type) => (
                      <div key={type} className="flex items-center px-2 py-1 hover:bg-gray-100 rounded cursor-pointer" onClick={() => toggleType(type)}>
                        {selectedTypes.includes(type) ? (
                          <CheckSquare className="h-4 w-4 text-blue-500 mr-2" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400 mr-2" />
                        )}
                        <span className="text-sm capitalize">{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
              <div className="relative z-10">
                <button
                  type="button"
                  className="w-full flex justify-between items-center px-4 py-2 border border-gray-300 rounded-md bg-white"
                  onClick={toggleCategoryDropdown}
                >
                  <span>{selectedCategories.length > 0 ? `${selectedCategories.length} selected` : 'Select categories'}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                <div id="categoryDropdown" className="absolute z-20 hidden mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  <div className="p-2 space-y-1">
                    {categoryOptions.map((category) => (
                      <div key={category} className="flex items-center px-2 py-1 hover:bg-gray-100 rounded cursor-pointer" onClick={() => toggleCategory(category)}>
                        {selectedCategories.includes(category) ? (
                          <CheckSquare className="h-4 w-4 text-blue-500 mr-2" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400 mr-2" />
                        )}
                        <span className="text-sm capitalize">{category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
            >
              Clear Filters
            </button>
            
            <button
              onClick={applySearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
      
      {/* Search Results */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="h-8 w-8 text-blue-500 animate-spin" />
          <span className="ml-2 text-gray-600">Searching...</span>
        </div>
      ) : showNoResults ? (
        <div className="text-center py-16">
          <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No results found</h3>
          <p className="text-gray-500 mb-6">
            Try different search terms or clear your filters
          </p>
        </div>
      ) : searchResults.length > 0 ? (
        <div>
          <div className="mb-4">
            <p className="text-gray-600">Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{searchQuery}"</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {searchResults.map((resource, index) => (
              <div key={resource._id || resource.id || index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-md capitalize">
                      {resource.resourceType || 'document'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(resource.created_at || resource.createdAt || '')}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                    {resource.title}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {resource.description || 'No description provided.'}
                  </p>

                  {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {resource.tags.map((tag, index) => (
                        <span key={index} className="inline-block px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-500">
                        {resource.view_count || 0} views
                      </span>
                      <span className="text-gray-500">
                        {resource.download_count || 0} downloads
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      const resourceId = resource._id || resource.id;
                      if (resourceId) handleDownloadResource(resourceId);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalResults > resultsPerPage && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-1">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, Math.ceil(totalResults / resultsPerPage)) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(Math.min(Math.ceil(totalResults / resultsPerPage), currentPage + 1))}
                  disabled={currentPage === Math.ceil(totalResults / resultsPerPage)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === Math.ceil(totalResults / resultsPerPage)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default SearchPage;
