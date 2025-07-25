 'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { CreateProjectForm } from '@/components/projects/create-project-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectInfo } from '@/types/api';
import { gerritApi } from '@/lib/api';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function Home() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [projects, setProjects] = useState<Record<string, ProjectInfo>>({});
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated]);

  const loadProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const projectsData = await gerritApi.queryProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleProjectCreated = () => {
    loadProjects();
  };

  const handleProjectClick = (projectName: string) => {
    router.push(`/projects/${encodeURIComponent(projectName)}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        {isLoginMode ? (
          <LoginForm onSwitchToRegister={() => setIsLoginMode(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLoginMode(true)} />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Gerrit</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.name || user?.username || 'User'}
              </span>
              <Button variant="outline" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
            <p className="text-gray-600">Manage your Git repositories</p>
          </div>
          <CreateProjectForm onProjectCreated={handleProjectCreated} />
        </div>

        {/* Projects Grid */}
        {isLoadingProjects ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading projects...</p>
          </div>
        ) : Object.keys(projects).length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No projects found</p>
              <p className="text-sm text-gray-400 mt-1">
                Create your first project to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(projects).map(([name, project]) => (
              <Card 
                key={name} 
                className="hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
                onClick={() => handleProjectClick(name)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{name}</CardTitle>
                  {project.description && (
                    <CardDescription>{project.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">State:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        project.state === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {project.state}
                      </span>
                    </div>
                    {project.branches && Object.keys(project.branches).length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Branches:</span>
                        <span className="text-gray-900">
                          {Object.keys(project.branches).length}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
