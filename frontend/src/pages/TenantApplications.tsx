import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, Clock, FileText, ShieldCheck } from 'lucide-react';
import { Sidebar, MobileNav } from '@/components/layout/Sidebar';
import { formatUsdc } from '@/data/properties';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

const tenantItems = [
    { icon: 'dashboard', label: 'Overview', href: '/tenant/dashboard' },
    { icon: 'home_work', label: 'Browse', href: '/search' },
    { icon: 'description', label: 'Applications', href: '/tenant/applications', active: true },
    { icon: 'account_balance_wallet', label: 'Wallet', href: '/tenant/wallet' },
    { icon: 'settings', label: 'Settings', href: '/settings' },
];

export default function TenantApplications() {
    const { user } = useAuthStore();

    const formattedWallet = user?.stellar_wallet 
        ? `${user.stellar_wallet.slice(0, 6)}...${user.stellar_wallet.slice(-6)}` 
        : 'No wallet';

    // Fetch tenant's applications from the backend
    const { data: applications, isLoading } = useQuery({
        queryKey: ['myApplications', user?.id],
        queryFn: () => api.get('/applications/mine').then((res) => res.data),
        enabled: !!user?.id,
    });

    const tenantApps = applications || [];

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm font-semibold text-muted-foreground">Loading applications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background md:pl-72">
            <Sidebar items={tenantItems} user={{ name: user?.full_name || 'Tenant', address: formattedWallet }} />

            <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                        <div>
                            <p className="section-kicker">Rental journey</p>
                            <h1 className="dashboard-title mt-3">Applications</h1>
                            <p className="mt-2 text-muted-foreground">Track every home you applied for, from landlord review to deposit funding.</p>
                        </div>
                        <Link to="/search" className="primary-button w-fit">
                            Find another home
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </header>

                    <div className="grid gap-5">
                        {tenantApps.length === 0 ? (
                            <div className="surface-card flex flex-col items-center justify-center py-20 text-center">
                                <FileText className="mb-4 h-12 w-12 text-muted-foreground/60" />
                                <h3 className="text-lg font-bold">No applications submitted</h3>
                                <p className="mt-1 text-sm text-muted-foreground">Explore available rental stays and apply to see your applications here.</p>
                            </div>
                        ) : (
                            tenantApps.map((application: any) => {
                                const property = application.unit?.property;
                                const propertyTitle = property?.title || 'Unknown Property';
                                const propertyImage = property?.photos?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
                                const neighborhood = property?.address?.split(',')[0] || 'Neighborhood';
                                const city = property?.city || 'City';
                                
                                const rent = Number(application.unit?.monthly_rent_usdc) || 0;
                                const deposit = Number(application.unit?.deposit_usdc) || 0;

                                // Custom status labeling and progress percentage mapping
                                let progressPercent = 50;
                                let statusLabel = 'Pending review';
                                if (application.status === 'approved') {
                                    progressPercent = 100;
                                    statusLabel = 'Approved - escrow ready';
                                } else if (application.status === 'rejected') {
                                    progressPercent = 100;
                                    statusLabel = 'Declined';
                                }

                                return (
                                    <article key={application.id} className="surface-card p-5">
                                        <div className="grid gap-5 md:grid-cols-[150px_1fr_auto] md:items-center">
                                            <img src={propertyImage} alt={propertyTitle} className="h-36 w-full rounded-[8px] object-cover md:w-36" />
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="text-xl font-bold">{propertyTitle} (Unit {application.unit?.unit_number || '#'})</h2>
                                                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary capitalize">{statusLabel}</span>
                                                </div>
                                                <p className="mt-1 text-muted-foreground">{neighborhood}, {city}</p>
                                                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                                    <div className="rounded-[8px] bg-muted p-3">
                                                        <p className="text-xs font-bold text-muted-foreground">Rent</p>
                                                        <p className="font-bold">{formatUsdc(rent)} USDC</p>
                                                    </div>
                                                    <div className="rounded-[8px] bg-muted p-3">
                                                        <p className="text-xs font-bold text-muted-foreground">Deposit</p>
                                                        <p className="font-bold">{formatUsdc(deposit)} USDC</p>
                                                    </div>
                                                    <div className="rounded-[8px] bg-muted p-3">
                                                        <p className="text-xs font-bold text-muted-foreground">Escrow State</p>
                                                        <p className="font-bold capitalize">{application.status === 'approved' ? 'Active' : 'Awaiting confirmation'}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                                                    <div className="h-full rounded-full bg-primary animate-[pulse_2s_infinite]" style={{ width: `${progressPercent}%` }} />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 md:w-40">
                                                <Link to={property ? `/properties/${property.id}` : '#'} className="primary-button py-2 text-xs flex justify-center items-center gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    View Details
                                                </Link>
                                                <button className="secondary-button py-2 text-xs flex justify-center items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    Timeline
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })
                        )}
                    </div>

                    <section className="mt-8 grid gap-4 md:grid-cols-2">
                        <div className="surface-card p-6">
                            <CheckCircle2 className="mb-5 h-7 w-7 text-success" />
                            <h2 className="text-xl font-bold">What approval unlocks</h2>
                            <p className="mt-2 leading-7 text-muted-foreground">Once approved, your wallet funds the deposit and first rent, the tenancy contract is created, and future rent can execute automatically.</p>
                        </div>
                        <div className="surface-card p-6">
                            <ShieldCheck className="mb-5 h-7 w-7 text-primary" />
                            <h2 className="text-xl font-bold">Deposit remains protected</h2>
                            <p className="mt-2 leading-7 text-muted-foreground">The security deposit is locked with return rules and an inspection window instead of disappearing into a private account.</p>
                        </div>
                    </section>
                </div>
            </main>

            <MobileNav items={tenantItems} />
        </div>
    );
}
