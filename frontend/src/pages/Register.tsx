import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Mail, Phone, User, WalletCards } from 'lucide-react';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/utils/cn';

type Role = 'tenant' | 'landlord';

export default function Register() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const [role, setRole] = useState<Role>('tenant');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [stellarWallet, setStellarWallet] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const payload = {
                email,
                password,
                role,
                full_name: fullName,
                phone: phone || undefined,
                stellar_wallet: stellarWallet || undefined,
            };

            const res = await api.post('/auth/register', payload);
            const { accessToken, user } = res.data;
            setAuth(accessToken, user);

            if (user.role === 'landlord') {
                navigate('/landlord/dashboard');
            } else {
                navigate('/tenant/dashboard');
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            const data = err.response?.data;
            if (data?.details && Array.isArray(data.details)) {
                const messages = data.details.map((d: any) => `${d.field}: ${d.message}`).join(', ');
                setError(`Validation failed: ${messages}`);
            } else {
                setError(data?.error || 'Failed to create account.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid min-h-screen bg-background lg:grid-cols-[0.9fr_1fr]">
            <main className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-12">
                <div className="w-full max-w-xl">
                    <Link to="/" className="text-xl font-extrabold text-primary">NyumbaChain</Link>
                    <div className="mt-10 surface-card p-6 sm:p-8">
                        <div className="mb-8">
                            <p className="section-kicker">Join the network</p>
                            <h1 className="mt-3 text-3xl font-bold">Create your rental profile.</h1>
                            <p className="mt-2 text-muted-foreground">Start as a tenant looking for a home or a landlord ready to automate rent collection.</p>
                        </div>

                        <div className="mb-6 grid grid-cols-2 gap-3">
                            {(['tenant', 'landlord'] as Role[]).map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setRole(option)}
                                    className={cn(
                                        'rounded-[8px] border p-4 text-left transition',
                                        role === option ? 'border-primary bg-primary text-white shadow-[0_12px_28px_rgba(15,45,78,0.18)]' : 'border-border bg-white hover:border-primary/40',
                                    )}
                                    type="button"
                                >
                                    {option === 'tenant' ? <User className="mb-4 h-5 w-5" /> : <Building2 className="mb-4 h-5 w-5" />}
                                    <span className="block font-bold capitalize">{option}</span>
                                    <span className={cn('mt-1 block text-sm', role === option ? 'text-white/75' : 'text-muted-foreground')}>
                                        {option === 'tenant' ? 'Find and pay for homes' : 'List and manage rentals'}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {error && (
                            <div className="mb-4 rounded-[8px] bg-destructive/10 p-3 text-sm font-semibold text-destructive">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <label className="block">
                                <span className="mb-2 block text-sm font-bold">Full name</span>
                                <span className="relative block">
                                    <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                    <input 
                                        className="field pl-12" 
                                        placeholder="Enter your full name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                    />
                                </span>
                            </label>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block">
                                    <span className="mb-2 block text-sm font-bold">Email</span>
                                    <span className="relative block">
                                        <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                        <input 
                                            className="field pl-12" 
                                            placeholder="you@example.com" 
                                            type="email" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </span>
                                </label>
                                <label className="block">
                                    <span className="mb-2 block text-sm font-bold">Phone</span>
                                    <span className="relative block">
                                        <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                        <input 
                                            className="field pl-12" 
                                            placeholder="+256..." 
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                        />
                                    </span>
                                </label>
                            </div>
                            
                            <label className="block">
                                <span className="mb-2 block text-sm font-bold">
                                    Stellar public key (optional - will auto-generate custodial wallet if empty)
                                </span>
                                <span className="relative block">
                                    <WalletCards className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                    <input 
                                        className="field pl-12 font-mono" 
                                        placeholder="G..." 
                                        value={stellarWallet}
                                        onChange={(e) => setStellarWallet(e.target.value)}
                                    />
                                </span>
                            </label>
                            
                            <label className="block">
                                <span className="mb-2 block text-sm font-bold">Password</span>
                                <input 
                                    className="field" 
                                    placeholder="Create a password" 
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </label>

                            <button className="primary-button w-full animate-hover" type="submit" disabled={loading}>
                                {loading ? 'Creating account...' : `Create ${role} account`}
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            Already have an account? <Link to="/auth/login" className="font-bold text-primary">Sign in</Link>
                        </p>
                    </div>
                </div>
            </main>

            <section className="relative hidden overflow-hidden lg:block">
                <img
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80"
                    alt="Modern African rental home exterior"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,25,45,0.04),rgba(8,25,45,0.72))]" />
                <div className="absolute bottom-10 left-10 right-10 text-white">
                    <h2 className="max-w-xl text-5xl font-bold leading-tight">A modern rental profile for homes, money, and trust.</h2>
                    <p className="mt-4 max-w-lg text-lg leading-8 text-white/82">
                        Every account is built around verified identities, protected deposits, and simple USDC payment records.
                    </p>
                </div>
            </section>
        </div>
    );
}
