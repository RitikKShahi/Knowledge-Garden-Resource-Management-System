import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import resourcesService, { Resource } from '../services/resourcesService';
import { BookOpen, Database, Users, FileText, Search, Download } from 'lucide-react';

const Home: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all resources
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true);
        const result = await resourcesService.getResources();
        console.log('Fetched resources:', result);
        setResources(Array.isArray(result.resources) ? result.resources : []);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching resources:', err);
        setError('Failed to load resources. Please try again later.');
        setResources([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, []);

  // Format date for better display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Dummy statistics for display
  const stats = {
    totalDocuments: resources.length || 42,
    totalUsers: 156,
    totalDownloads: 1893,
    totalViews: 7245,
    categories: 12,
    searchesPerDay: 78
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl overflow-hidden shadow-xl mb-16">
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Welcome to Knowledge Garden
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            A collaborative platform for sharing educational resources, research papers, and documentation in a structured, searchable environment.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/resources" className="px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg shadow-md hover:bg-blue-50 transition-colors">
              Browse Resources
            </Link>
            <Link to="/search" className="px-8 py-3 bg-blue-800 text-white font-semibold rounded-lg shadow-md hover:bg-blue-900 transition-colors">
              Search Knowledge
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Growing Knowledge Ecosystem</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Documents</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.totalDocuments}</p>
              </div>
            </div>
            <p className="text-gray-500">Shared resources in our database</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Users</h3>
                <p className="text-3xl font-bold text-green-600">{stats.totalUsers}</p>
              </div>
            </div>
            <p className="text-gray-500">Active members in our community</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-100 rounded-full mr-4">
                <Database className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Categories</h3>
                <p className="text-3xl font-bold text-purple-600">{stats.categories}</p>
              </div>
            </div>
            <p className="text-gray-500">Organized knowledge domains</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-amber-100 rounded-full mr-4">
                <Download className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Downloads</h3>
                <p className="text-3xl font-bold text-amber-600">{stats.totalDownloads}</p>
              </div>
            </div>
            <p className="text-gray-500">Resources downloaded by users</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-red-100 rounded-full mr-4">
                <BookOpen className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Views</h3>
                <p className="text-3xl font-bold text-red-600">{stats.totalViews}</p>
              </div>
            </div>
            <p className="text-gray-500">Total resource views</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-sky-100 rounded-full mr-4">
                <Search className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Searches</h3>
                <p className="text-3xl font-bold text-sky-600">{stats.searchesPerDay}</p>
              </div>
            </div>
            <p className="text-gray-500">Average searches per day</p>
          </div>
        </div>
      </section>

      {/* About Knowledge Garden */}
      <section className="mb-16">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">What is Knowledge Garden?</h2>
          
          <div className="space-y-6 text-gray-600">
            <p>
              Knowledge Garden is a collaborative platform that helps teams, organizations, and educational institutions organize, share, and discover knowledge resources in a structured environment.
            </p>
            
            <p>
              Built with a microservices architecture, Knowledge Garden offers a scalable solution for managing documents, research papers, educational materials, and more. The platform leverages modern technologies like event-driven communication, distributed search, and cloud storage to provide a robust knowledge management system.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Key Features</h3>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>Secure document upload and storage with metadata management</li>
              <li>Advanced search capabilities powered by Elasticsearch</li>
              <li>User management with role-based permissions</li>
              <li>Resource categorization and tagging</li>
              <li>Analytics on resource usage and engagement</li>
              <li>Integration with existing knowledge systems</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Latest Resources Section */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Latest Resources</h2>
          <Link to="/resources" className="text-blue-600 hover:text-blue-800 font-medium">View All Resources →</Link>
        </div>
        
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
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No resources available yet</h3>
            <p className="text-gray-500 mb-6">Be the first one to contribute to our knowledge database.</p>
            <Link to="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Login to Contribute
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <div key={resource._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {resource.resourceType}
                    </span>
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {formatDate(resource.created_at || '')}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                    {resource.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {resource.description || 'No description provided.'}
                  </p>
                  
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
                  <a 
                    href={resource.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" /> View Document
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Call to Action */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 md:p-12 text-center">
          <h2 className="text-3xl text-white font-bold mb-4">Ready to share your knowledge?</h2>
          <p className="text-indigo-100 max-w-2xl mx-auto mb-8">
            Join our growing community and contribute to the collective knowledge. Upload documents, collaborate with other researchers, and help build a comprehensive knowledge ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/register" className="px-8 py-3 bg-white text-indigo-700 font-semibold rounded-lg shadow-md hover:bg-indigo-50 transition-colors">
              Create Account
            </Link>
            <Link to="/login" className="px-8 py-3 bg-indigo-800 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-900 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
