import { Link } from 'react-router-dom';
import { ArrowUpRight, Banknote, CalendarClock, CheckCircle2, Home, Users } from 'lucide-react';
import { Sidebar, MobileNav } from '@/components/layout/Sidebar';
import { featuredProperties, formatUsdc } from '@/data/properties';

const landlordItems = [
    { icon: 'dashboard', label: 'Overview', href: '/landlord/dashboard', active: true },
    { icon: 'home_work', label: 'Properties', href: '/landlord/properties' },
    { icon: 'add', label: 'Add Property', href: '/landlord/properties/new' },
    { icon: 'description', label: 'Applications', href: '/landlord/applications' },
    { icon: 'people', label: 'Tenants', href: '/landlord/tenants' },
    { icon: 'settings', label: 'Settings', href: '/settings' },
];

const metrics = [
    { label: 'Monthly rent secured', value: '4,710 USDC', icon: Banknote, note: '+18% from last month' },
    { label: 'Active tenancies', value: '18', icon: Users, note: '2 leases renewing soon' },
    { label: 'Occupancy', value: '92%', icon: Home, note: '3 units available' },
    { label: 'Pending reviews', value: '5', icon: CalendarClock, note: 'Average response 9h' },
];

export default function LandlordDashboard() {
    return (
        <div className="min-h-screen bg-background md:pl-72">
            <Sidebar items={landlordItems} user={{ name: 'O. Otieno', address: 'GA5...9KXW' }} />

            <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <header className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                        <div>
                            <p className="section-kicker">Landlord studio</p>
                            <h1 className="dashboard-title mt-3">Good afternoon, Otieno.</h1>
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
                                    <p className="mt-2 text-sm text-success">{metric.note}</p>
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
                                <span className="rounded-full bg-muted px-4 py-2 text-sm font-bold text-primary">June 2026</span>
                            </div>

                            <div className="space-y-5">
                                {featuredProperties.slice(0, 3).map((property, index) => (
                                    <div key={property.id} className="grid gap-4 rounded-[8px] border border-border p-4 md:grid-cols-[130px_1fr_auto] md:items-center">
                                        <img src={property.image} alt={property.title} className="h-28 w-full rounded-[8px] object-cover md:w-32" />
                                        <div>
                                            <h3 className="font-bold">{property.title}</h3>
                                            <p className="text-sm text-muted-foreground">{property.neighborhood}, {property.city}</p>
                                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                                                <div className="h-full rounded-full bg-primary" style={{ width: `${88 - index * 9}%` }} />
                                            </div>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <p className="text-sm text-muted-foreground">Monthly rent</p>
                                            <p className="text-xl font-extrabold text-primary">{formatUsdc(property.price)} USDC</p>
                                            <p className="mt-1 text-sm font-semibold text-success">On schedule</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="surface-card p-6">
                            <h2 className="text-2xl font-bold">Applications to review</h2>
                            <div className="mt-6 space-y-4">
                                {['Sarah Wanjiku', 'Aline Mutesi', 'Brian Okello'].map((name, index) => (
                                    <div key={name} className="rounded-[8px] border border-border p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-bold">{name}</p>
                                                <p className="text-sm text-muted-foreground">{featuredProperties[index].title}</p>
                                            </div>
                                            <span className="rounded-full bg-secondary/20 px-3 py-1 text-xs font-bold text-primary">New</span>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <button className="primary-button flex-1 py-2 text-xs">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Approve
                                            </button>
                                            <button className="secondary-button flex-1 py-2 text-xs">Review</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <MobileNav items={landlordItems} />
        </div>
    );
}
