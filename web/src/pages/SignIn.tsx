import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bookmark } from 'lucide-react';

export function SignIn() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (login(username, password)) {
            navigate('/bookmarks');
        } else {
            setError('Invalid credentials. Try admin/admin');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-8 space-y-2">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                        <Bookmark className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Re-Visit</h1>
                    <p className="text-muted-foreground text-sm">Manage your bookmarks with ease</p>
                </div>

                <Card className="border-border/50 shadow-xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl">Sign in</CardTitle>
                        <CardDescription>
                            Enter your credentials to access your bookmarks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="admin"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="transition-all"
                                />
                            </div>
                            {error && (
                                <p className="text-sm text-destructive animate-in fade-in-50 duration-200">
                                    {error}
                                </p>
                            )}
                            <Button type="submit" className="w-full" size="lg">
                                Sign in
                            </Button>
                        </form>
                        <div className="mt-4 text-center">
                            <p className="text-xs text-muted-foreground">
                                Demo credentials: <span className="font-mono">admin / admin</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
