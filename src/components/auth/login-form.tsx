'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(username, password);
      toast.success('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Call to Action */}
      <div className="flex-1 bg-green-400 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-black">Call to Action</h1>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 bg-gray-100 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border-2 border-gray-300 p-8 shadow-sm">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-black">Gerrit Login</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                  placeholder="username"
                  required
                  disabled={isLoading}
                  className="h-12 text-lg border-2 border-gray-300 rounded-md px-4 placeholder:text-gray-500"
                />
              </div>
              
              <div className="space-y-2">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="password"
                  required
                  disabled={isLoading}
                  className="h-12 text-lg border-2 border-gray-300 rounded-md px-4 placeholder:text-gray-500"
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-green-400 hover:bg-green-500 text-black font-semibold px-8 py-3 rounded-md text-lg border-0"
                >
                  {isLoading ? 'submitting...' : 'submit'}
                </Button>
              </div>
            </form>
            
            <div className="text-center mt-6">
              <Button
                type="button"
                variant="link"
                onClick={onSwitchToRegister}
                disabled={isLoading}
                className="text-gray-600 hover:text-gray-800"
              >
                Don't have an account? Sign up
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
