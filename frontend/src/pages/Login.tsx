import { Link } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, WalletCards } from 'lucide-react';

export default function Login() {
    return (
        <div className="grid min-h-screen bg-background lg:grid-cols-[1fr_0.9fr]">
            <section className="relative hidden overflow-hidden lg:block">
                <img
                    src="https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1400&q=80"
                    alt="Warm modern apartment interior"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,25,45,0.10),rgba(8,25,45,0.74))]" />
                <div className="absolute bottom-10 left-10 right-10 text-white">
                    <p className="section-kicker text-white">Welcome back</p>
                    <h1 className="mt-3 max-w-2xl text-5xl font-bold leading-tight">
                        Continue managing your home, wallet, and lease from one calm place.
                    </h1>
                </div>
            </section>

            <main className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-12">
                <div className="w-full max-w-md">
                    <Link to="/" className="text-xl font-extrabold text-primary">NyumbaChain</Link>
                    <div className="mt-10 surface-card p-6 sm:p-8">
                        <div className="mb-8">
                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <LockKeyhole className="h-6 w-6" />
                            </div>
                            <h2 className="text-3xl font-bold">Sign in</h2>
                            <p className="mt-2 text-muted-foreground">Access rental applications, landlord tools, and Stellar-backed payment history.</p>
                        </div>

                        <form className="space-y-4">
                            <label className="block">
                                <span className="mb-2 block text-sm font-bold">Email address</span>
                                <span className="relative block">
                                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                    <input className="field pl-12" placeholder="you@example.com" type="email" />
                                </span>
                            </label>
                            <label className="block">
                                <span className="mb-2 block text-sm font-bold">Password</span>
                                <input className="field" placeholder="Enter your password" type="password" />
                            </label>

                            <button className="primary-button w-full" type="button">
                                Sign in securely
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </form>

                        <div className="my-6 flex items-center gap-3">
                            <div className="h-px flex-1 bg-border" />
                            <span className="text-xs font-bold text-muted-foreground">or</span>
                            <div className="h-px flex-1 bg-border" />
                        </div>

                        <button className="secondary-button w-full" type="button">
                            <WalletCards className="h-4 w-4" />
                            Continue with Stellar wallet
                        </button>

                        <div className="mt-6 rounded-[8px] bg-muted p-4 text-sm text-muted-foreground">
                            <ShieldCheck className="mb-2 h-5 w-5 text-primary" />
                            Refresh tokens remain in HttpOnly cookies and wallet secrets are never stored in the browser.
                        </div>

                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            New to NyumbaChain? <Link to="/auth/register" className="font-bold text-primary">Create an account</Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
