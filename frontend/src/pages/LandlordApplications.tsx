import { CheckCircle2, Clock, FileText, MessageCircle, XCircle } from 'lucide-react';
import { Sidebar, MobileNav } from '@/components/layout/Sidebar';
import { featuredProperties } from '@/data/properties';

const landlordItems = [
    { icon: 'dashboard', label: 'Overview', href: '/landlord/dashboard' },
    { icon: 'home_work', label: 'Properties', href: '/landlord/properties' },
    { icon: 'add', label: 'Add Property', href: '/landlord/properties/new' },
    { icon: 'description', label: 'Applications', href: '/landlord/applications', active: true },
    { icon: 'people', label: 'Tenants', href: '/landlord/tenants' },
    { icon: 'settings', label: 'Settings', href: '/settings' },
];

const applications = [
    { name: 'Sarah Wanjiku', property: featuredProperties[0], status: 'Pending review', score: 'Verified wallet', date: '2 days ago' },
    { name: 'Aline Mutesi', property: featuredProperties[1], status: 'Needs info', score: 'Deposit ready', date: 'Yesterday' },
    { name: 'Brian Okello', property: featuredProperties[3], status: 'Pending review', score: 'KYC verified', date: '4 hours ago' },
];

export default function LandlordApplications() {
    return (
        <div className="min-h-screen bg-background md:pl-72">
            <Sidebar items={landlordItems} user={{ name: 'O. Otieno', address: 'GA5...9KXW' }} />

            <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <header className="mb-8">
                        <p className="section-kicker">Tenant pipeline</p>
                        <h1 className="dashboard-title mt-3">Applications</h1>
                        <p className="mt-2 max-w-2xl text-muted-foreground">Review tenant intent, wallet readiness, deposit state, and unit fit before approving a lease.</p>
                    </header>

                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                        <section className="space-y-4">
                            {applications.map((application) => (
                                <article key={application.name} className="surface-card p-5">
                                    <div className="grid gap-5 md:grid-cols-[112px_1fr_auto] md:items-center">
                                        <img src={application.property.image} alt={application.property.title} className="h-28 w-full rounded-[8px] object-cover md:w-28" />
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="text-xl font-bold">{application.name}</h2>
                                                <span className="rounded-full bg-secondary/20 px-3 py-1 text-xs font-bold text-primary">{application.score}</span>
                                            </div>
                                            <p className="mt-1 text-muted-foreground">{application.property.title}</p>
                                            <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                {application.status} · Applied {application.date}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-2 md:w-40">
                                            <button className="primary-button py-2 text-xs">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Approve
                                            </button>
                                            <button className="secondary-button py-2 text-xs">
                                                <MessageCircle className="h-4 w-4" />
                                                Request info
                                            </button>
                                            <button className="secondary-button py-2 text-xs text-error">
                                                <XCircle className="h-4 w-4" />
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </section>

                        <aside className="surface-card h-fit p-6">
                            <FileText className="mb-5 h-8 w-8 text-primary" />
                            <h2 className="text-xl font-bold">Approval checklist</h2>
                            <div className="mt-5 space-y-3 text-sm">
                                {['Tenant identity verified', 'Wallet can fund deposit', 'Lease dates confirmed', 'Email receipt enabled'].map((item) => (
                                    <div key={item} className="flex items-center gap-3 rounded-[8px] bg-muted p-3">
                                        <CheckCircle2 className="h-4 w-4 text-success" />
                                        <span className="font-semibold">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            <MobileNav items={landlordItems} />
        </div>
    );
}
