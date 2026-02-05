import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, Building2, CheckCircle2, User, KeyRound, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ModeToggle } from '@/components/mode-toggle';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [view, setView] = useState<'login' | 'forgot-password' | 'reset-password'>('login');
    const [isLoading, setIsLoading] = useState(false);

    // Login State
    const [employeeId, setEmployeeId] = useState('');
    const [password, setPassword] = useState('');

    // Forgot Password State
    const [resetEmail, setResetEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const from = location.state?.from?.pathname || '/inbox';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!employeeId || !password) {
                toast.error('Please enter both Employee ID and password');
                setIsLoading(false);
                return;
            }

            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeId, password })
            });

            if (!res.ok) {
                const data = await res.json();
                toast.error(data.error || 'Failed to log in');
                return;
            }

            const userData = await res.json();

            // Map role logic if needed, but backend returns role_name
            // Frontend components might expect 'role' to be 'admin' or 'user'
            const formattedUser = {
                ...userData,
                role: userData.role_name?.toLowerCase() === 'admin' ? 'admin' : 'user'
            };

            login(formattedUser);
            toast.success('Logged in successfully');
            navigate(from, { replace: true });
        } catch (error) {
            toast.error('Failed to connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // await fetch('http://localhost:5000/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email: resetEmail }) ... });
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success(`OTP sent to ${resetEmail}`);
            setView('reset-password');
        } catch (error) {
            toast.error('Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setIsLoading(true);
        try {
            // await fetch('http://localhost:5000/api/auth/reset-password', ...);
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Password reset successfully. Please login.');
            setView('login');
        } catch (error) {
            toast.error('Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex">
            {/* Theme Toggle */}
            <div className="absolute top-4 right-4 z-50">
                <ModeToggle />
            </div>

            {/* Left Side */}
            <div className="hidden lg:flex w-1/2 bg-muted relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10"></div>
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 max-w-lg space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white p-2 flex items-center justify-center shadow-sm">
                            <img src="/images/logo.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-3xl font-bold tracking-tight">A-Mesob</span>
                    </div>

                    <h1 className="text-4xl font-bold tracking-tight text-foreground leading-tight">
                        Secure <span className="text-primary">Government</span> Document Access
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Welcome to A-Mesob's unified service portal. Access letters, archives, and inter-ministry communications securely.
                    </p>
                </div>
            </div>

            {/* Right Side */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8">

                    {/* LOGIN VIEW */}
                    {view === 'login' && (
                        <>
                            <div className="text-center space-y-2 lg:text-left">
                                <h2 className="text-3xl font-bold tracking-tight">Sign in</h2>
                                <p className="text-muted-foreground">Enter your Employee ID to access the dashboard</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="employeeId">Employee ID</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="employeeId"
                                                placeholder="EMP-001"
                                                className="pl-10 h-11"
                                                value={employeeId}
                                                onChange={(e) => setEmployeeId(e.target.value)}
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password">Password</Label>
                                            <button
                                                type="button"
                                                onClick={() => setView('forgot-password')}
                                                className="text-sm font-medium text-primary hover:underline"
                                            >
                                                Forgot password?
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="••••••••"
                                                className="pl-10 h-11"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Button className="w-full h-11 text-base" type="submit" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Sign In
                                    </Button>
                                </div>
                            </form>
                        </>
                    )}


                    {/* FORGOT PASSWORD VIEW */}
                    {view === 'forgot-password' && (
                        <>
                            <div className="space-y-2">
                                <button onClick={() => setView('login')} className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
                                </button>
                                <h2 className="text-3xl font-bold tracking-tight">Reset Password</h2>
                                <p className="text-muted-foreground">Enter your email to receive an OTP</p>
                            </div>

                            <form onSubmit={handleSendOtp} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="resetEmail">Email address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="resetEmail"
                                            type="email"
                                            placeholder="name@gov.et"
                                            className="pl-10 h-11"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <Button className="w-full h-11" type="submit" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send OTP'}
                                </Button>
                            </form>
                        </>
                    )}

                    {/* RESET PASSWORD VIEW */}
                    {view === 'reset-password' && (
                        <>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tight">Set New Password</h2>
                                <p className="text-muted-foreground">Enter the OTP sent to {resetEmail}</p>
                            </div>

                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="otp">OTP Code</Label>
                                    <Input
                                        id="otp"
                                        placeholder="123456"
                                        className="h-11 tracking-widest text-center text-lg"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            className="pl-10 h-11"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            className="pl-10 h-11"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <Button className="w-full h-11" type="submit" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset Password'}
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
