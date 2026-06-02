import { CalendarClock, CircleDollarSign, Mail, ShieldCheck } from 'lucide-react';
import { Sidebar, MobileNav } from '@/components/layout/Sidebar';
import { featuredProperties, formatUsdc } from '@/data/properties';

const landlordItems = [
    { icon: 'dashboard', label: 'Overview', href: '/landlord/dashboard' },
    { icon: 'home_work', label: 'Properties', href: '/landlord/properties' },
    { icon: 'add', label: 'Add Property', href: '/landlord/properties/new' },
    { icon: 'description', label: 'Applications', href: '/landlord/applications' },
    { icon: 'people', label: 'Tenants', href: '/landlord/tenants', active: true },
    { icon: 'settings', label: 'Settings', href: '/settings' },
];

const tenants = [
    { name: 'Sarah Wanjiku', property: featuredProperties[0], lease: 'Jan 2026 - Dec 2026', status: 'Active' },
    { name: 'James Mwangi', property: featuredProperties[1], lease: 'Mar 2026 - Feb 2027', status: 'Rent due soon' },
    { name: 'Nadia Atwine', property: featuredProperties[3], lease: 'Apr 2026 - Sep 2026', status: 'Inspection window' },
];

export default function LandlordTenants() {
    return (
        <div className="min-h-screen bg-background md:pl-72">
            <Sidebar items={landlordItems} user={{ name: 'O. Otieno', address: 'GA5...9KXW' }} />

            <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <header className="mb-8">
                        <p className="section-kicker">Relationships</p>
                        <h1 className="dashboard-title mt-3">Tenants</h1>
                        <p className="mt-2 max-w-2xl text-muted-foreground">See lease health, rent automation status, deposits, and tenant communication in one place.</p>
                    </header>

                    <section className="surface-card overflow-hidden">
                        <div className="hidden grid-cols-[1.2fr_1fr_0.8fr_0.8fr_auto] gap-4 border-b border-border px-5 py-4 text-sm font-bold text-muted-foreground lg:grid">
                            <span>Tenant</span>
                            <span>Property</span>
                            <span>Lease</span>
                            <span>Rent</span>
                            <span>Status</span>
                        </div>
                        <div className="divide-y divide-border">
                            {tenants.map((tenant) => (
                                <div key={tenant.name} className="grid gap-4 px-5 py-5 lg:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_auto] lg:items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                                            {tenant.name.split(' ').map((part) => part[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="font-bold">{tenant.name}</p>
                                            <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Mail className="h-3.5 w-3.5" />
                                                receipts enabled
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-semibold">{tenant.property.title}</p>
                                        <p className="text-sm text-muted-foreground">{tenant.property.neighborhood}</p>
                                    </div>
                                    <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                        <CalendarClock className="h-4 w-4 text-primary" />
                                        {tenant.lease}
                                    </p>
                                    <p className="flex items-center gap-2 font-bold text-primary">
                                        <CircleDollarSign className="h-4 w-4" />
                                        {formatUsdc(tenant.property.price)} USDC
                                    </p>
                                    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                                        <ShieldCheck className="h-4 w-4" />
                                        {tenant.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            <MobileNav items={landlordItems} />
        </div>
    );
}
