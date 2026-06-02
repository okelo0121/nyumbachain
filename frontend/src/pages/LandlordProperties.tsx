import { Link } from 'react-router-dom';
import { ArrowUpRight, BedDouble, CircleDollarSign, Home, Plus } from 'lucide-react';
import { Sidebar, MobileNav } from '@/components/layout/Sidebar';
import { featuredProperties, formatUsdc } from '@/data/properties';

const landlordItems = [
    { icon: 'dashboard', label: 'Overview', href: '/landlord/dashboard' },
    { icon: 'home_work', label: 'Properties', href: '/landlord/properties', active: true },
    { icon: 'add', label: 'Add Property', href: '/landlord/properties/new' },
    { icon: 'description', label: 'Applications', href: '/landlord/applications' },
    { icon: 'people', label: 'Tenants', href: '/landlord/tenants' },
    { icon: 'settings', label: 'Settings', href: '/settings' },
];

export default function LandlordProperties() {
    return (
        <div className="min-h-screen bg-background md:pl-72">
            <Sidebar items={landlordItems} user={{ name: 'O. Otieno', address: 'GA5...9KXW' }} />

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

                    <div className="grid gap-6 lg:grid-cols-3">
                        {featuredProperties.map((property: typeof featuredProperties[0]) => (
                            <article key={property.id} className="surface-card overflow-hidden">
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <img src={property.image} alt={property.title} className="h-full w-full object-cover" />
                                    <span className="absolute left-3 top-3 rounded-full bg-white/94 px-3 py-1 text-xs font-bold text-primary">
                                        {property.available ? 'Listed' : 'Paused'}
                                    </span>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h2 className="text-xl font-bold">{property.title}</h2>
                                            <p className="text-sm text-muted-foreground">{property.neighborhood}, {property.city}</p>
                                        </div>
                                        <Link to={`/properties/${property.id}`} className="secondary-button px-3 py-2">
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Link>
                                    </div>

                                    <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                                        <div className="rounded-[8px] bg-muted p-3">
                                            <Home className="mb-2 h-4 w-4 text-primary" />
                                            <p className="font-bold">{property.unitType}</p>
                                        </div>
                                        <div className="rounded-[8px] bg-muted p-3">
                                            <BedDouble className="mb-2 h-4 w-4 text-primary" />
                                            <p className="font-bold">{property.beds} beds</p>
                                        </div>
                                        <div className="rounded-[8px] bg-muted p-3">
                                            <CircleDollarSign className="mb-2 h-4 w-4 text-primary" />
                                            <p className="font-bold">{formatUsdc(property.price)}</p>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                                        <span className="text-sm font-semibold text-muted-foreground">Escrow: {property.escrowState}</span>
                                        <button className="font-bold text-primary">Manage</button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </main>

            <MobileNav items={landlordItems} />
        </div>
    );
}
