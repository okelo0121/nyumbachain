import { CalendarClock, CircleDollarSign, Mail, ShieldCheck, Users } from 'lucide-react';
import { Sidebar, MobileNav } from '@/components/layout/Sidebar';
import { formatUsdc } from '@/data/properties';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

const landlordItems = [
    { icon: 'dashboard', label: 'Overview', href: '/landlord/dashboard' },
    { icon: 'home_work', label: 'Properties', href: '/landlord/properties' },
    { icon: 'add', label: 'Add Property', href: '/landlord/properties/new' },
    { icon: 'description', label: 'Applications', href: '/landlord/applications' },
    { icon: 'people', label: 'Tenants', href: '/landlord/tenants', active: true },
    { icon: 'settings', label: 'Settings', href: '/settings' },
];

export default function LandlordTenants() {
    const { user } = useAuthStore();

    const formattedWallet = user?.stellar_wallet 
        ? `${user.stellar_wallet.slice(0, 6)}...${user.stellar_wallet.slice(-6)}` 
        : 'No wallet';

    // Fetch landlord's active tenancies
    const { data: tenanciesData, isLoading } = useQuery({
        queryKey: ['landlordTenancies', user?.id],
        queryFn: () => api.get('/tenancies/mine').then((res) => res.data),
        enabled: !!user?.id,
    });

    const tenancies = tenanciesData?.tenancies || [];

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm font-semibold text-muted-foreground">Loading tenants...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background md:pl-72">
            <Sidebar items={landlordItems} user={{ name: user?.full_name || 'Landlord', address: formattedWallet }} />

            <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <header className="mb-8">
                        <p className="section-kicker">Relationships</p>
                        <h1 className="dashboard-title mt-3">Tenants</h1>
                        <p className="mt-2 max-w-2xl text-muted-foreground">See lease health, rent automation status, deposits, and tenant communication in one place.</p>
                    </header>

                    {tenancies.length === 0 ? (
                        <section className="surface-card flex flex-col items-center justify-center py-20 text-center">
                            <Users className="mb-4 h-12 w-12 text-muted-foreground/60" />
                            <h3 className="text-lg font-bold">No tenants yet</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Once you approve tenant applications and their leases start, they will show up here.</p>
                        </section>
                    ) : (
                        <section className="surface-card overflow-hidden">
                            <div className="hidden grid-cols-[1.2fr_1fr_0.8fr_0.8fr_auto] gap-4 border-b border-border px-5 py-4 text-sm font-bold text-muted-foreground lg:grid">
                                <span>Tenant</span>
                                <span>Property</span>
                                <span>Lease Period</span>
                                <span>Rent</span>
                                <span>Status</span>
                            </div>
                            <div className="divide-y divide-border">
                                {tenancies.map((tenancy: any) => {
                                    const tenantName = tenancy.tenant?.full_name || 'Anonymous Tenant';
                                    const propertyTitle = tenancy.unit?.property?.title || 'Unknown Property';
                                    const neighborhood = tenancy.unit?.property?.address?.split(',')[0] || 'Neighborhood';
                                    
                                    const startDate = new Date(tenancy.start_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
                                    const endDate = new Date(tenancy.end_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
                                    const leaseLabel = `${startDate} - ${endDate}`;

                                    const rent = Number(tenancy.monthly_rent_usdc) || 0;
                                    const initials = tenantName.split(' ').map((part: string) => part[0]).join('').slice(0, 2).toUpperCase();

                                    return (
                                        <div key={tenancy.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_auto] lg:items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                                                    {initials}
                                                </div>
                                                <div>
                                                    <p className="font-bold">{tenantName}</p>
                                                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Mail className="h-3.5 w-3.5" />
                                                        {tenancy.tenant?.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-semibold">{propertyTitle}</p>
                                                <p className="text-sm text-muted-foreground">{neighborhood}</p>
                                            </div>
                                            <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                                <CalendarClock className="h-4 w-4 text-primary" />
                                                {leaseLabel}
                                            </p>
                                            <p className="flex items-center gap-2 font-bold text-primary">
                                                <CircleDollarSign className="h-4 w-4" />
                                                {formatUsdc(rent)} USDC
                                            </p>
                                            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                                                <ShieldCheck className="h-4 w-4" />
                                                <span className="capitalize">{tenancy.status}</span>
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </div>
            </main>

            <MobileNav items={landlordItems} />
        </div>
    );
}
