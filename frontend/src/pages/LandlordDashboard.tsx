import { Link } from 'react-router-dom';
import { ArrowUpRight, Banknote, CalendarClock, CheckCircle2, Home, Users, XCircle, AlertCircle, Clock } from 'lucide-react';
import { Sidebar, MobileNav } from '@/components/layout/Sidebar';
import { formatUsdc } from '@/data/properties';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

const landlordItems = [
    { icon: 'dashboard', label: 'Overview', href: '/landlord/dashboard', active: true },
    { icon: 'home_work', label: 'Properties', href: '/landlord/properties' },
    { icon: 'add', label: 'Add Property', href: '/landlord/properties/new' },
    { icon: 'description', label: 'Applications', href: '/landlord/applications' },
    { icon: 'people', label: 'Tenants', href: '/landlord/tenants' },
    { icon: 'settings', label: 'Settings', href: '/settings' },
];

export default function LandlordDashboard() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'Landlord';
    const formattedWallet = user?.stellar_wallet 
        ? `${user.stellar_wallet.slice(0, 6)}...${user.stellar_wallet.slice(-6)}` 
        : 'No wallet';

    // 1. Fetch properties (to calculate occupancy basis)
    const { data: propertiesData, isLoading: propsLoading } = useQuery({
        queryKey: ['landlordProperties', user?.id],
        queryFn: () => api.get('/properties', { params: { landlord_id: user?.id } }).then((res) => res.data),
        enabled: !!user?.id,
    });
    const properties = propertiesData?.properties || [];
    const totalUnits = properties.reduce((sum: number, p: any) => sum + (p.units?.length || 0), 0);

    // 2. Fetch active tenancies
    const { data: tenanciesData, isLoading: tenanciesLoading } = useQuery({
        queryKey: ['landlordTenancies', user?.id],
        queryFn: () => api.get('/tenancies/mine').then((res) => res.data),
        enabled: !!user?.id,
    });
    const tenancies = tenanciesData?.tenancies || [];

    // 3. Fetch incoming applications
    const { data: applications, isLoading: appsLoading } = useQuery({
        queryKey: ['incomingApplications', user?.id],
        queryFn: () => api.get('/applications/incoming').then((res) => res.data),
        enabled: !!user?.id,
    });
    const incomingApps = applications || [];
    const pendingApps = incomingApps.filter((app: any) => app.status === 'pending');

    // 4. Mutations for application review
    const approveMutation = useMutation({
        mutationFn: (appId: string) => api.put(`/applications/${appId}/approve`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incomingApplications'] });
            queryClient.invalidateQueries({ queryKey: ['landlordTenancies'] });
            queryClient.invalidateQueries({ queryKey: ['landlordProperties'] });
        },
    });

    const rejectMutation = useMutation({
        mutationFn: (appId: string) => api.put(`/applications/${appId}/reject`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incomingApplications'] });
        },
    });

    const isLoading = propsLoading || tenanciesLoading || appsLoading;

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

    // Calculations
    const monthlyRentSecured = tenancies.reduce((sum: number, t: any) => sum + parseFloat(t.monthly_rent_usdc), 0);
    const occupancyRate = totalUnits > 0 ? Math.round((tenancies.length / totalUnits) * 100) : 0;
    const availableUnits = totalUnits - tenancies.length;

    const metrics = [
        { label: 'Monthly rent secured', value: `${formatUsdc(monthlyRentSecured)} USDC`, icon: Banknote, note: 'Rent running in Soroban escrow' },
        { label: 'Active tenancies', value: String(tenancies.length), icon: Users, note: `${totalUnits} total units listed` },
        { label: 'Occupancy', value: `${occupancyRate}%`, icon: Home, note: `${availableUnits} units available` },
        { label: 'Pending reviews', value: String(pendingApps.length), icon: CalendarClock, note: 'Awaiting landlord action' },
    ];

    return (
        <div className="min-h-screen bg-background md:pl-72">
            <Sidebar items={landlordItems} user={{ name: user?.full_name || 'Landlord', address: formattedWallet }} />

            <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <header className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                        <div>
                            <p className="section-kicker">Landlord studio</p>
                            <h1 className="dashboard-title mt-3">Good afternoon, {firstName}.</h1>
                            <p className="mt-2 text-muted-foreground">Your portfolio is collecting rent, protecting deposits, and moving applications forward.</p>
                        </div>
                        <Link to="/landlord/properties/new" className="primary-button w-fit">
                            Add property
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </header>

                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {metrics.map((metric) => {
                            const Icon = metric.icon;
                            return (
                                <div key={metric.label} className="surface-card p-5">
                                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <p className="text-sm font-semibold text-muted-foreground">{metric.label}</p>
                                    <p className="mt-2 text-3xl font-extrabold">{metric.value}</p>
                                    <p className="mt-2 text-xs text-muted-foreground">{metric.note}</p>
                                </div>
                            );
                        })}
                    </section>

                    <section className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                        <div className="surface-card p-6">
                            <div className="mb-6 flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold">Portfolio performance</h2>
                                    <p className="text-muted-foreground">A calm view of rent expected, collected, and escrowed.</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                {tenancies.length > 0 ? (
                                    tenancies.map((tenancy: any) => {
                                        const prop = tenancy.unit?.property;
                                        const photo = prop?.photos?.[0] || 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80';
                                        return (
                                            <div key={tenancy.id} className="grid gap-4 rounded-[8px] border border-border p-4 md:grid-cols-[130px_1fr_auto] md:items-center">
                                                <img src={photo} alt={prop?.title} className="h-28 w-full rounded-[8px] object-cover md:w-32" />
                                                <div>
                                                    <h3 className="font-bold">{prop?.title}</h3>
                                                    <p className="text-sm text-muted-foreground">{prop?.address}, {prop?.city}</p>
                                                    <div className="mt-3 text-xs text-muted-foreground">
                                                        Tenant: <span className="font-semibold text-foreground">{tenancy.tenant?.full_name}</span>
                                                    </div>
                                                </div>
                                                <div className="text-left md:text-right">
                                                    <p className="text-sm text-muted-foreground">Monthly rent</p>
                                                    <p className="text-xl font-extrabold text-primary">{formatUsdc(tenancy.monthly_rent_usdc)} USDC</p>
                                                    <p className="mt-1 text-sm font-semibold text-success capitalize">Status: {tenancy.status}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                                        <AlertCircle className="h-10 w-10 text-muted-foreground/60 mb-2" />
                                        <p>No active tenancies recorded in your portfolio.</p>
                                        <p className="text-sm text-muted-foreground/80 mt-1">Once you approve tenant applications, active leases will show up here.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="surface-card p-6">
                            <h2 className="text-2xl font-bold">Applications to review</h2>
                            <div className="mt-6 space-y-4">
                                {pendingApps.length > 0 ? (
                                    pendingApps.map((app: any) => (
                                        <div key={app.id} className="rounded-[8px] border border-border p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-bold">{app.tenant?.full_name}</p>
                                                    <p className="text-sm text-muted-foreground">{app.unit?.property?.title}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Type: {app.unit?.unit_type} • Rent: {formatUsdc(app.unit?.monthly_rent_usdc || 0)} USDC
                                                    </p>
                                                    {app.message && <p className="mt-2 text-xs italic text-muted-foreground">"{app.message}"</p>}
                                                </div>
                                                <span className="rounded-full bg-secondary/20 px-3 py-1 text-xs font-bold text-primary">New</span>
                                            </div>
                                            <div className="mt-4 flex gap-2">
                                                <button 
                                                    onClick={() => approveMutation.mutate(app.id)}
                                                    disabled={approveMutation.isPending || rejectMutation.isPending}
                                                    className="primary-button flex-1 py-2 text-xs disabled:opacity-50"
                                                >
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    {approveMutation.isPending ? 'Approving...' : 'Approve'}
                                                </button>
                                                <button 
                                                    onClick={() => rejectMutation.mutate(app.id)}
                                                    disabled={approveMutation.isPending || rejectMutation.isPending}
                                                    className="secondary-button flex-1 py-2 text-xs text-destructive hover:border-destructive/30 disabled:opacity-50"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                                        <Clock className="h-10 w-10 text-muted-foreground/60 mb-2" />
                                        <p>No applications to review.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <MobileNav items={landlordItems} />
        </div>
    );
}
