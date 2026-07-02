import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthContextType, User } from '@/types';
import { useLoginApiAuthLoginPost, useLogoutApiAuthLogoutPost, getCurrentUserApiAuthMeGet } from '@/api/generated/auth/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check session on mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                const resp = await getCurrentUserApiAuthMeGet({ credentials: 'include' });
                if (resp.status === 200) {
                    setUser({ username: resp.data.message });
                }
            } catch {
                // Not logged in
            } finally {
                setIsLoading(false);
            }
        };
        checkSession();
    }, []);

    const loginMutation = useLoginApiAuthLoginPost({
        fetch: { credentials: 'include' }
    });

    const logoutMutation = useLogoutApiAuthLogoutPost({
        fetch: { credentials: 'include' }
    });

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            const resp = await loginMutation.mutateAsync({
                data: { username, password }
            });

            if (resp.status === 200) {
                setUser({ username });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const logout = async () => {
        try {
            await logoutMutation.mutateAsync();
        } catch {
            // Continue with local logout even if API fails
        }
        setUser(null);
    };

    const isAuthenticated = user !== null;

    // Show nothing while checking session
    if (isLoading) {
        return null;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
