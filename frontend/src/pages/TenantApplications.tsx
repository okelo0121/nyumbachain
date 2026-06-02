import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, Clock, FileText, ShieldCheck } from 'lucide-react';
import { Sidebar, MobileNav } from '@/components/layout/Sidebar';
import { featuredProperties, formatUsdc } from '@/data/properties';

const tenantItems = [
    { icon: 'dashboard', label: 'Overview', href: '/tenant/dashboard' },
    { icon: 'home_work', label: 'Browse', href: '/search' },
    { icon: 'description', label: 'Applications', href: '/tenant/applications', active: true },
    { icon: 'account_balance_wallet', label: 'Wallet', href: '/tenant/wallet' },
    { icon: 'settings', label: 'Settings', href: '/settings' },
];

const applications = [
    { property: featuredProperties[0], status: 'Pending landlord review', progress: 68 },
    { property: featuredProperties[1], status: 'Approved - fund deposit', progress: 92 },
    { property: featuredProperties[3], status: 'More info requested', progress: 45 },
];

export default function TenantApplications() {
    return (
        <div className="min-h-screen bg-background md:pl-72">
            <Sidebar items={tenantItems} user={{ name: 'K. Mwangi', address: 'GC7...49W' }} />

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
                        {applications.map((application) => (
                            <article key={application.property.id} className="surface-card p-5">
                                <div className="grid gap-5 md:grid-cols-[150px_1fr_auto] md:items-center">
                                    <img src={application.property.image} alt={application.property.title} className="h-36 w-full rounded-[8px] object-cover md:w-36" />
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-xl font-bold">{application.property.title}</h2>
                                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{application.status}</span>
                                        </div>
                                        <p className="mt-1 text-muted-foreground">{application.property.neighborhood}, {application.property.city}</p>
                                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                            <div className="rounded-[8px] bg-muted p-3">
                                                <p className="text-xs font-bold text-muted-foreground">Rent</p>
                                                <p className="font-bold">{formatUsdc(application.property.price)} USDC</p>
                                            </div>
                                            <div className="rounded-[8px] bg-muted p-3">
                                                <p className="text-xs font-bold text-muted-foreground">Deposit</p>
                                                <p className="font-bold">{formatUsdc(application.property.deposit)} USDC</p>
                                            </div>
                                            <div className="rounded-[8px] bg-muted p-3">
                                                <p className="text-xs font-bold text-muted-foreground">Escrow</p>
                                                <p className="font-bold">{application.property.escrowState}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                                            <div className="h-full rounded-full bg-primary" style={{ width: `${application.progress}%` }} />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 md:w-40">
                                        <button className="primary-button py-2 text-xs">
                                            <FileText className="h-4 w-4" />
                                            View
                                        </button>
                                        <button className="secondary-button py-2 text-xs">
                                            <Clock className="h-4 w-4" />
                                            Timeline
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
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
