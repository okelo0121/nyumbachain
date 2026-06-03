import { Link } from 'react-router-dom';
import { ArrowUpRight, BedDouble, CircleDollarSign, Home, Plus } from 'lucide-react';
import { Sidebar, MobileNav } from '@/components/layout/Sidebar';
import { formatUsdc } from '@/data/properties';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

const landlordItems = [
    { icon: 'dashboard', label: 'Overview', href: '/landlord/dashboard' },
    { icon: 'home_work', label: 'Properties', href: '/landlord/properties', active: true },
    { icon: 'add', label: 'Add Property', href: '/landlord/properties/new' },
    { icon: 'description', label: 'Applications', href: '/landlord/applications' },
    { icon: 'people', label: 'Tenants', href: '/landlord/tenants' },
    { icon: 'settings', label: 'Settings', href: '/settings' },
];

export default function LandlordProperties() {
    const { user } = useAuthStore();
    const formattedWallet = user?.stellar_wallet 
        ? `${user.stellar_wallet.slice(0, 6)}...${user.stellar_wallet.slice(-6)}` 
        : 'No wallet';

    // Fetch landlord's own properties
    const { data: propertiesData, isLoading } = useQuery({
        queryKey: ['landlordProperties', user?.id],
        queryFn: () => api.get('/properties', { params: { landlord_id: user?.id } }).then((res) => res.data),
        enabled: !!user?.id,
    });

    const properties = propertiesData?.properties || [];

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm font-semibold text-muted-foreground">Loading properties...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background md:pl-72">
            <Sidebar items={landlordItems} user={{ name: user?.full_name || 'Landlord', address: formattedWallet }} />

            <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                        <div>
                            <p className="section-kicker">Portfolio</p>
                            <h1 className="dashboard-title mt-3">Properties</h1>
                            <p className="mt-2 text-muted-foreground">Manage listings, rent terms, unit availability, and escrow readiness.</p>
                        </div>
                        <Link to="/landlord/properties/new" className="primary-button w-fit">
                            <Plus className="h-4 w-4" />
                            Add property
                        </Link>
                    </header>

                    {properties.length > 0 ? (
                        <div className="grid gap-6 lg:grid-cols-3">
                            {properties.map((property: any) => {
                                const defaultUnit = property.units?.[0];
                                const photo = property.photos?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
                                return (
                                    <article key={property.id} className="surface-card overflow-hidden">
                                        <div className="relative aspect-[4/3] overflow-hidden">
                                            <img src={photo} alt={property.title} className="h-full w-full object-cover" />
                                            <span className="absolute left-3 top-3 rounded-full bg-white/94 px-3 py-1 text-xs font-bold text-primary">
                                                {property.is_active ? 'Listed' : 'Paused'}
                                            </span>
                                        </div>
                                        <div className="p-5">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h2 className="text-xl font-bold">{property.title}</h2>
                                                    <p className="text-sm text-muted-foreground">{property.address}, {property.city}</p>
                                                </div>
                                                <Link to={`/properties/${property.id}`} className="secondary-button px-3 py-2">
                                                    <ArrowUpRight className="h-4 w-4" />
                                                </Link>
                                            </div>

                                            <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                                                <div className="rounded-[8px] bg-muted p-3">
                                                    <Home className="mb-2 h-4 w-4 text-primary" />
                                                    <p className="font-bold capitalize">{defaultUnit?.unit_type || property.property_type}</p>
                                                </div>
                                                <div className="rounded-[8px] bg-muted p-3">
                                                    <BedDouble className="mb-2 h-4 w-4 text-primary" />
                                                    <p className="font-bold">{defaultUnit?.unit_type === 'studio' ? '1 room' : 'Multiple'}</p>
                                                </div>
                                                <div className="rounded-[8px] bg-muted p-3">
                                                    <CircleDollarSign className="mb-2 h-4 w-4 text-primary" />
                                                    <p className="font-bold">
                                                        {defaultUnit ? `${formatUsdc(defaultUnit.monthly_rent_usdc)}` : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                                                <span className="text-sm font-semibold text-muted-foreground">
                                                    Type: <span className="capitalize">{property.property_type}</span>
                                                </span>
                                                <Link to={`/properties/${property.id}`} className="font-bold text-primary hover:underline">
                                                    Manage
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="surface-card p-12 text-center flex flex-col items-center justify-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Home className="h-7 w-7" />
                            </div>
                            <h3 className="text-2xl font-bold">No properties listed</h3>
                            <p className="mt-2 text-muted-foreground max-w-md">
                                You haven't added any properties to your rental portfolio yet. Create your first property listing with unit rent pricing to receive applications.
                            </p>
                            <Link to="/landlord/properties/new" className="primary-button mt-6">
                                <Plus className="h-4 w-4" />
                                Add your first property
                            </Link>
                        </div>
                    )}
                </div>
            </main>

            <MobileNav items={landlordItems} />
        </div>
    );
}
