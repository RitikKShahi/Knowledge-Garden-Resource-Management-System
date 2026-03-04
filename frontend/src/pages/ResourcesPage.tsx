import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import resourcesService, { Resource, ResourceFilter } from '../services/resourcesService';
import {
  FileUp, Download, Search, Filter, Book, Tag,
  FileText, ChevronDown, CheckSquare, Square, Loader, X
} from 'lucide-react';

const ResourcesPage: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Resources state
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upload state
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Upload form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resourceType: 'article',
    tags: '',
    categories: '',
    isPublic: true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Filter state
  const [filters, setFilters] = useState<ResourceFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Resource type options
  const resourceTypes = ['article', 'book', 'lecture', 'paper', 'presentation', 'video', 'other'];

  // Category options
  const categoryOptions = [
    'documentation', 'research', 'tutorial', 'guide',
    'case study', 'report', 'template', 'other'
  ];

  // Fetch resources
  useEffect(() => {
    fetchResources();
  }, [filters]);

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      const result = await resourcesService.getResources(filters);
      setResources(Array.isArray(result.resources) ? result.resources : []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching resources:', err);
      setError('Failed to load resources. Please try again later.');
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle upload form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle resource upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    if (!formData.title.trim()) {
      setUploadError('Title is required');
      return;
    }

    try {
      setUploadLoading(true);
      setUploadError(null);

      // Create a FormData object for multipart/form-data submission
      const uploadFormData = new FormData();
      
      // Append file with the field name 'file' as shown in the curl
      uploadFormData.append('file', selectedFile);
      
      // Append other fields
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description || '');
      uploadFormData.append('resourceType', formData.resourceType);
      uploadFormData.append('is_public', String(formData.isPublic));
      
      // Convert tags and categories to JSON arrays
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim())
        : [];
      uploadFormData.append('tags', JSON.stringify(tagsArray));
      
      const categoriesArray = formData.categories
        ? formData.categories.split(',').map(category => category.trim())
        : [];
      uploadFormData.append('categories', JSON.stringify(categoriesArray));

      // Make the POST request using the resource service
      const response = await resourcesService.uploadResource(uploadFormData);
      
      console.log('Upload successful:', response);

      // Reset form
      setFormData({
        title: '',
        description: '',
        resourceType: 'document',
        tags: '',
        categories: '',
        isPublic: true
      });
      setSelectedFile(null);
      setUploadSuccess(true);

      // Refresh resources
      fetchResources();

      // Hide success message after 3 seconds
      setTimeout(() => {
        setUploadSuccess(false);
        setShowUploadForm(false);
      }, 3000);

    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Failed to upload resource');
    } finally {
      setUploadLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    const newFilters: ResourceFilter = {};

    if (searchQuery) {
      newFilters.search = searchQuery;
    }

    if (selectedTypes.length > 0) {
      newFilters.resourceType = selectedTypes.join(',');
    }

    if (selectedCategories.length > 0) {
      newFilters.categories = selectedCategories;
    }

    setFilters(newFilters);
    setShowFilters(false);
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

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTypes([]);
    setSelectedCategories([]);
    setFilters({});
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Resources</h1>
          <p className="text-gray-600">Browse, search, and download all available resources</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters {Object.keys(filters).length > 0 && `(${Object.keys(filters).length})`}
          </button>

          {isAuthenticated && (
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileUp className="h-4 w-4 mr-2" />
              Upload Resource
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Filter Resources</h2>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative z-10">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title or description"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Resource Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resource Types</label>
              <div className="relative z-10">
                <button
                  type="button"
                  className="w-full flex justify-between items-center px-4 py-2 border border-gray-300 rounded-md bg-white"
                  onClick={() => document.getElementById('resourceTypeDropdown')?.classList.toggle('hidden')}
                >
                  <span>{selectedTypes.length > 0 ? `${selectedTypes.length} selected` : 'Select types'}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                <div id="resourceTypeDropdown" className="absolute z-20 hidden mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  <div className="p-2 space-y-1">
                    {resourceTypes.map((type) => (
                      <div key={type} className="flex items-center px-2 py-1 hover:bg-gray-100 rounded cursor-pointer" onClick={() => toggleType(type)}>
                        {selectedTypes.includes(type) ? (
                          <CheckSquare className="h-4 w-4 text-blue-600 mr-2" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400 mr-2" />
                        )}
                        <span className="capitalize">{type}</span>
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
                  onClick={() => document.getElementById('categoryDropdown')?.classList.toggle('hidden')}
                >
                  <span>{selectedCategories.length > 0 ? `${selectedCategories.length} selected` : 'Select categories'}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                <div id="categoryDropdown" className="absolute z-20 hidden mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  <div className="p-2 space-y-1">
                    {categoryOptions.map((category) => (
                      <div key={category} className="flex items-center px-2 py-1 hover:bg-gray-100 rounded cursor-pointer" onClick={() => toggleCategory(category)}>
                        {selectedCategories.includes(category) ? (
                          <CheckSquare className="h-4 w-4 text-blue-600 mr-2" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400 mr-2" />
                        )}
                        <span className="capitalize">{category}</span>
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
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Upload New Resource</h2>
            <button
              onClick={() => setShowUploadForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {uploadSuccess ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              Resource uploaded successfully! The page will refresh shortly.
            </div>
          ) : (
            <form onSubmit={handleUpload}>
              {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                  {uploadError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                    File *
                  </label>
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    {selectedFile ? (
                      <div>
                        <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-900 mb-1">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="mt-2 text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <FileUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 mb-1">
                          Click to browse or drag and drop
                        </p>
                        <p className="text-xs text-gray-400">
                          PDF, DOCX, PPTX, XLS, JPG, PNG, etc.
                        </p>
                      </div>
                    )}
                    <input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      style={{ top: 0, left: 0, right: 0, bottom: 0 }}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="resourceType" className="block text-sm font-medium text-gray-700 mb-1">
                    Resource Type *
                  </label>
                  <select
                    id="resourceType"
                    name="resourceType"
                    value={formData.resourceType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {resourceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="e.g. report, financial, quarterly"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="categories" className="block text-sm font-medium text-gray-700 mb-1">
                    Categories (comma separated)
                  </label>
                  <input
                    type="text"
                    id="categories"
                    name="categories"
                    value={formData.categories}
                    onChange={handleInputChange}
                    placeholder="e.g. documentation, tutorial"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublic"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                      Make this resource public (visible to all users)
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="mr-3 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  {uploadLoading ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FileUp className="h-4 w-4 mr-2" />
                      Upload Resource
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Resources List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-4 text-gray-600">Loading resources...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No resources found</h3>
          <p className="text-gray-500 mb-6">
            {Object.keys(filters).length > 0
              ? 'Try changing your search filters or clearing them.'
              : 'No resources have been uploaded yet.'}
          </p>
          {isAuthenticated && (
            <button
              onClick={() => setShowUploadForm(true)}
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload Your First Resource
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <div key={resource._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {resource.resourceType}
                  </span>
                  <span className="mx-2 text-gray-400">•</span>
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
                      <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-500">
                      <span className="font-medium text-gray-700">{resource.view_count}</span> views
                    </span>
                    <span className="text-gray-500">
                      <span className="font-medium text-gray-700">{resource.download_count}</span> downloads
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
      )}
    </div>
  );
};

export default ResourcesPage;
