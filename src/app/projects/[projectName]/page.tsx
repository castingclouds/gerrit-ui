'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { gerritApi } from '@/lib/api';
import { ProjectInfo } from '@/types/api';
import { useAuth } from '@/contexts/auth-context';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectName = params.projectName as string;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const {
    data: project,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['project', projectName],
    queryFn: async () => {
      const decodedName = decodeURIComponent(projectName);
      return await gerritApi.getProject(decodedName);
    },
    enabled: !!projectName,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  const handleBackToProjects = () => {
    router.push('/');
  };

  const handleDeleteProject = async () => {
    try {
      setDeleting(true);
      await gerritApi.deleteProject(decodeURIComponent(projectName), true); // force delete
      // Invalidate the projects cache after deletion
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      router.push('/');
    } catch (err) {
      console.error('Error deleting project:', err);
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error loading project</div>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'Failed to fetch project'}
          </p>
          <button
            onClick={handleBackToProjects}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">Project not found</div>
          <button
            onClick={handleBackToProjects}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const getGitUrl = () => {
    // Construct git URL based on our Git HTTP controller path
    // Use standard Git URL format with .git suffix
    return `http://localhost:8080/git/${projectName}.git`;
  };

  const copyGitUrl = async () => {
    try {
      await navigator.clipboard.writeText(getGitUrl());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
      console.log('Git URL copied to clipboard');
    } catch (err) {
      console.error('Failed to copy Git URL:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = getGitUrl();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'Not set';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const projectProperties = [
    { label: 'Project Name', value: project.name || projectName },
    { label: 'Description', value: project.description },
    { label: 'State', value: project.state },
    { label: 'Git URL', value: getGitUrl(), isUrl: true },
    { label: 'Parent Project', value: project.parent },
    { label: 'Default Branch', value: project.branches?.HEAD },
    { label: 'Web Links', value: project.webLinks },
    { label: 'Project ID', value: project.id },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToProjects}
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Projects</span>
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Project Details</h1>
            <div></div> {/* Spacer for flex layout */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{project.name || projectName}</h2>
            {project.description && (
              <p className="mt-2 text-gray-600">{project.description}</p>
            )}
          </div>

          <div className="px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Project Properties</h3>
            <div className="space-y-4">
              {projectProperties.map((property, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-start">
                  <div className="sm:w-1/3">
                    <dt className="text-sm font-medium text-gray-500">{property.label}</dt>
                  </div>
                  <div className="sm:w-2/3 mt-1 sm:mt-0">
                    <dd className="text-sm text-gray-900">
                      {property.isUrl ? (
                        <div className="flex items-center space-x-2">
                          <a
                            href={property.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline break-all flex-1"
                          >
                            {property.value}
                          </a>
                          <button
                            onClick={copyGitUrl}
                            className="text-gray-400 hover:text-gray-600 p-1"
                            title="Copy Git URL"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <span className={`${property.value === 'Not set' ? 'text-gray-400 italic' : ''} break-words`}>
                          {typeof property.value === 'object' ? (
                            <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                              {formatValue(property.value)}
                            </pre>
                          ) : (
                            formatValue(property.value)
                          )}
                        </span>
                      )}
                    </dd>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Actions */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={copyGitUrl}
                className={`${
                  copySuccess 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white px-4 py-2 rounded-md text-sm flex items-center space-x-2`}
              >
                {copySuccess ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy Git URL</span>
                  </>
                )}
              </button>
              <button
                onClick={handleBackToProjects}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm"
              >
                Back to Projects
              </button>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Delete Project</h3>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete the project <strong>{project?.name || projectName}</strong>? 
                This action will permanently delete the project and its Git repository from the filesystem. 
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={deleting}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {deleting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {deleting ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
