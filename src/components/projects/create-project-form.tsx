'use client';

import { useState } from 'react';
import { gerritApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ProjectInput, ProjectState } from '@/types/api';

interface CreateProjectFormProps {
  onProjectCreated?: () => void;
}

export function CreateProjectForm({ onProjectCreated }: CreateProjectFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      toast.error('Project name is required');
      return;
    }

    // Basic project name validation (alphanumeric, dots, dashes, underscores)
    const projectNameRegex = /^[a-zA-Z0-9._/-]+$/;
    if (!projectNameRegex.test(projectName)) {
      toast.error('Project name can only contain letters, numbers, dots, dashes, underscores, and forward slashes');
      return;
    }

    setIsLoading(true);
    try {
      const projectInput: ProjectInput = {
        name: projectName,
        description: description.trim() || undefined,
        createEmptyCommit: true,
        state: ProjectState.ACTIVE,
      };

      await gerritApi.createProject(projectName, projectInput);
      toast.success(`Project "${projectName}" created successfully!`);
      
      // Reset form
      setProjectName('');
      setDescription('');
      setIsOpen(false);
      
      // Notify parent component
      onProjectCreated?.();
    } catch (error) {
      console.error('Project creation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create New Project</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Create a new Git repository in Gerrit
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProjectName(e.target.value)}
              placeholder="e.g., my-project"
              required
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              Use lowercase letters, numbers, dots, dashes, underscores, and forward slashes
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              type="text"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
              placeholder="Brief description of the project"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 