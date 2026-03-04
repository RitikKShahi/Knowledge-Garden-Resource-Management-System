import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import resourcesService, { Resource } from '../../services/resourcesService';
import authService, { ProfileData } from '../../services/authService';
import { Mail, BookOpen, Calendar, Building, User as UserIcon } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user: reduxUser } = useSelector((state: RootState) => state.auth);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profileLoading, setProfileLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  // Fetch the user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setProfileLoading(true);
        const profile = await authService.getUserProfile();
        setProfileData(profile);
        setProfileError(null);
        console.log('Fetched profile data:', profile);
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setProfileError(err.message || 'Failed to load user profile');
      } finally {
        setProfileLoading(false);
      }
    };

    // Only fetch if we have an auth token
    if (localStorage.getItem('auth_token')) {
      fetchUserProfile();
    } else {
      setProfileError('Authentication required. Please log in.');
      setProfileLoading(false);
    }
  }, []);

  // Fetch the user's resources
  useEffect(() => {
    const fetchUserResources = async () => {
      try {
        setIsLoading(true);
        // Get the user ID from the profile data
        const userId = profileData?.user_id.toString();

        if (userId) {
          // Use the resourcesService to fetch user resources
          const resources = await resourcesService.getUserResources(userId);
          setResources(resources || []);
          setError(null);
        } else {
          // No user ID available, show empty state
          setResources([]);
          setError('User ID not found. Please log in again.');
        }
      } catch (err: any) {
        console.error('Error fetching user resources:', err);
        setError('Failed to load your resources. Please try again later.');
        // For demo purposes, set some mock data if the API fails
        setResources([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch resources if we have the profile data
    if (profileData) {
      fetchUserResources();
    }
  }, [profileData]);

  // If we have profile data, use it; otherwise fall back to Redux state or localStorage
  const name = profileData?.name ||
    (reduxUser ? `${reduxUser.firstName || ''} ${reduxUser.lastName || ''}` : 'User');

  const email = profileData?.email ||
    reduxUser?.email ||
    localStorage.getItem('user_email') ||
    'user@example.com';

  const role = profileData?.role ||
    localStorage.getItem('user_role') ||
    'User';

  const institution = profileData?.institution ||
    localStorage.getItem('user_institution') ||
    'Not specified';

  const joinDate = profileData?.join_date ||
    reduxUser?.createdAt ||
    localStorage.getItem('user_created') ||
    new Date().toISOString();

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

  return (
    <div className="container mx-auto px-4 py-8">
      {profileError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Authentication Error</h3>
            <p className="text-gray-600 mb-4">{profileError}</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      ) : profileLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-gray-600">Loading your profile...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-12 text-center">
              <div className="inline-flex items-center justify-center bg-white p-4 rounded-full mb-4">
                <UserIcon className="h-16 w-16 text-blue-500" />
              </div>
              <h2 className="text-xl font-bold text-white">{name}</h2>
              <p className="text-blue-100">{role}</p>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Profile Information</h3>

              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-800">{email}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Building className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Institution</p>
                    <p className="text-gray-800">{institution}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="text-gray-800">{formatDate(joinDate)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Account Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-md text-center">
                    <p className="text-2xl font-bold text-blue-600">{resources.length}</p>
                    <p className="text-gray-500 text-sm">Resources</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md text-center">
                    <p className="text-2xl font-bold text-green-600">0</p>
                    <p className="text-gray-500 text-sm">Downloads</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Resources Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">My Resources</h2>
              {/* <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"> */}
              {/*   Upload New */}
              {/* </button> */}
            </div>
                        {isLoading ? (
              <div className="py-20 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading your resources...</p>
              </div>
            ) : error ? (
              <div className="py-16 text-center">
                <div className="bg-red-50 border border-red-100 rounded-md p-4 mx-auto max-w-md">
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            ) : resources.length === 0 ? (
              <div className="py-16 text-center">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No resources yet</h3>
                <p className="text-gray-500 mb-6">You haven't uploaded any resources to your Knowledge Garden.</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors">
                  Upload Your First Resource
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {resources.map((resource) => (
                  <div key={resource._id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-1">{resource.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{resource.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            {resource.resourceType}
                          </span>
                          <span className="text-gray-500">
                            Uploaded {formatDate(resource.created_at || '')}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-gray-600 hover:text-blue-600 p-1 transition-colors" title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button className="text-gray-600 hover:text-red-600 p-1 transition-colors" title="Delete">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                      <div className="flex space-x-6 text-sm">
                        <div className="text-gray-500">
                          <span className="font-medium text-gray-700">{resource.view_count}</span> views
                        </div>
                        <div className="text-gray-500">
                          <span className="font-medium text-gray-700">{resource.download_count}</span> downloads
                        </div>
                      </div>
                      <a
                        href={resource.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Document
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
  );
};

export default ProfilePage;
