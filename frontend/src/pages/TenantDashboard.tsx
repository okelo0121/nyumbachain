import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, Home, ReceiptText, ShieldCheck, WalletCards, Wrench, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Sidebar, MobileNav } from '@/components/layout/Sidebar';
import { formatUsdc } from '@/data/properties';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

const tenantItems = [
    { icon: 'dashboard', label: 'Overview', href: '/tenant/dashboard', active: true },
    { icon: 'home_work', label: 'Browse', href: '/search' },
    { icon: 'description', label: 'Applications', href: '/tenant/applications' },
    { icon: 'account_balance_wallet', label: 'Wallet', href: '/tenant/wallet' },
    { icon: 'settings', label: 'Settings', href: '/settings' },
];

export default function TenantDashboard() {
    const { user } = useAuthStore();
    const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'Tenant';
    const formattedWallet = user?.stellar_wallet 
        ? `${user.stellar_wallet.slice(0, 6)}...${user.stellar_wallet.slice(-6)}` 
        : 'No wallet';

    // Fetch active tenancy
    const { data: tenancyData, isLoading: tenancyLoading } = useQuery({
        queryKey: ['myTenancy'],
        queryFn: () => api.get('/tenancies/mine').then((res) => res.data).catch(err => {
            if (err.response?.status === 404) return null;
            throw err;
        }),
        retry: false,
    });

    // Fetch tenant applications
    const { data: applications, isLoading: appsLoading } = useQuery({
        queryKey: ['myApplications'],
        queryFn: () => api.get('/applications/mine').then((res) => res.data),
    });

    const isLoading = tenancyLoading || appsLoading;

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm font-semibold text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const tenancy = tenancyData?.tenancy;
    const nextPaymentDate = tenancyData?.nextPaymentDate;
    const property = tenancy?.unit?.property;

    return (
        <div className="min-h-screen bg-background md:pl-72">
            <Sidebar items={tenantItems} user={{ name: user?.full_name || 'Tenant', address: formattedWallet }} />

            <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <header className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                        <div>
                            <p className="section-kicker">Tenant home</p>
                            <h1 className="dashboard-title mt-3">Jambo, {firstName}.</h1>
                            <p className="mt-2 text-muted-foreground">
                                {tenancy 
                                    ? 'Your smart tenancy is active, funded, and easy to understand.' 
                                    : 'Welcome! You don\'t have an active tenancy yet. Explore available rentals or track your applications below.'}
                            </p>
                        </div>
                        <Link to="/search" className="secondary-button w-fit">
                            Browse homes
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </header>

                    {tenancy ? (
                        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                            <div className="surface-card overflow-hidden">
                                <div className="relative h-72">
                                    <img 
                                        src={property?.photos?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'} 
                                        alt={property?.title} 
                                        className="h-full w-full object-cover" 
                                    />
                                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,25,45,0.02),rgba(8,25,45,0.62))]" />
                                    <div className="absolute bottom-5 left-5 right-5 text-white">
                                        <p className="text-sm font-bold text-white/80">Active tenancy ({tenancy.unit.unit_type})</p>
                                        <h2 className="mt-1 text-3xl font-bold">{property?.title}</h2>
                                        <p className="mt-1 text-white/82">{property?.address}, {property?.city}</p>
                                    </div>
                                </div>
                                <div className="grid gap-4 p-5 md:grid-cols-3">
                                    <div className="rounded-[8px] bg-muted p-4">
                                        <CalendarDays className="mb-3 h-5 w-5 text-primary" />
                                        <p className="text-sm text-muted-foreground">Next rent due</p>
                                        <p className="mt-1 text-xl font-bold">
                                            {nextPaymentDate 
                                                ? new Date(nextPaymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                                : `Day ${tenancy.payment_day}`}
                                        </p>
                                    </div>
                                    <div className="rounded-[8px] bg-muted p-4">
                                        <WalletCards className="mb-3 h-5 w-5 text-primary" />
                                        <p className="text-sm text-muted-foreground">Monthly rent</p>
                                        <p className="mt-1 text-xl font-bold">{formatUsdc(tenancy.monthly_rent_usdc)} USDC</p>
                                    </div>
                                    <div className="rounded-[8px] bg-muted p-4">
                                        <ShieldCheck className="mb-3 h-5 w-5 text-primary" />
                                        <p className="text-sm text-muted-foreground">Deposit protected</p>
                                        <p className="mt-1 text-xl font-bold">{formatUsdc(tenancy.deposit_usdc)} USDC</p>
                                    </div>
                                </div>
                            </div>

                            <div className="surface-card p-6">
                                <h2 className="text-2xl font-bold">Smart Contract</h2>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Your payments are automated on-chain via the Soroban escrow contract.
                                </p>
                                <div className="mt-6 space-y-4">
                                    {[
                                        ['Escrow Deployed', tenancy.escrow_contract_id ? 'Active on Stellar network' : 'Pending deployment', !!tenancy.escrow_contract_id],
                                        ['Rent Schedule', `Releases automatically on day ${tenancy.payment_day} monthly`, true],
                                        ['Safe Deposit', `${formatUsdc(tenancy.deposit_usdc)} USDC locked in escrow`, !!tenancy.escrow_contract_id],
                                    ].map(([title, description, complete]) => (
                                        <div key={title as string} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${complete ? 'bg-primary text-white' : 'bg-muted text-primary'}`}>
                                                    <ShieldCheck className="h-4 w-4" />
                                                </div>
                                                <div className="h-10 w-px bg-border last:hidden" />
                                            </div>
                                            <div>
                                                <p className="font-bold">{title as string}</p>
                                                <p className="text-sm text-muted-foreground">{description as string}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Link to="/tenant/wallet" className="primary-button mt-6 w-full">
                                    Open wallet
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </section>
                    ) : (
                        <section className="grid gap-6 md:grid-cols-1">
                            <div className="surface-card p-8 flex flex-col items-center justify-center text-center">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Home className="h-7 w-7" />
                                </div>
                                <h3 className="text-2xl font-bold">No active lease contract found</h3>
                                <p className="mt-2 text-muted-foreground max-w-lg">
                                    You don't have an active tenancy record on the platform. Find an apartment, apply, and once approved by the landlord, your smart contract lease will appear here.
                                </p>
                                <Link to="/search" className="primary-button mt-6">
                                    Find a home
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </div>

                            {/* Show applications if any exist */}
                            {applications && applications.length > 0 && (
                                <div className="surface-card p-6 mt-4">
                                    <h2 className="text-2xl font-bold mb-4">Your Recent Applications</h2>
                                    <div className="space-y-4">
                                        {applications.map((app: any) => (
                                            <div key={app.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-[8px] border border-border p-4">
                                                <div>
                                                    <h3 className="font-bold">{app.unit?.property?.title}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {app.unit?.unit_type} • {formatUsdc(app.unit?.monthly_rent_usdc || 0)} USDC/month
                                                    </p>
                                                    {app.message && <p className="mt-2 text-xs italic text-muted-foreground">"{app.message}"</p>}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {app.status === 'approved' && (
                                                        <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-bold text-success">
                                                            <CheckCircle className="h-3.5 w-3.5" />
                                                            Approved
                                                        </span>
                                                    )}
                                                    {app.status === 'pending' && (
                                                        <span className="flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1.5 text-xs font-bold text-warning">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            Pending Review
                                                        </span>
                                                    )}
                                                    {app.status === 'rejected' && (
                                                        <span className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive">
                                                            <XCircle className="h-3.5 w-3.5" />
                                                            Rejected
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Dashboard Tools */}
                    {tenancy && (
                        <section className="mt-8 grid gap-5 md:grid-cols-3">
                            {[
                                ['View receipts', ReceiptText, 'Download immutable rent receipts and Stellar transaction links.'],
                                ['Maintenance', Wrench, 'Request landlord action without leaving the tenancy view.'],
                                ['Lease details', Home, 'Review start date, inspection window, and deposit return rules.'],
                            ].map(([title, Icon, description]) => (
                                <button key={title as string} className="surface-card p-5 text-left transition hover:-translate-y-1" type="button">
                                    <Icon className="mb-5 h-6 w-6 text-primary" />
                                    <p className="text-lg font-bold">{title as string}</p>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{description as string}</p>
                                </button>
                            ))}
                        </section>
                    )}
                </div>
            </main>

            <MobileNav items={tenantItems} />
        </div>
    );
}
