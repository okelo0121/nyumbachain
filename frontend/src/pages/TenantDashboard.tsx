import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, Home, ReceiptText, ShieldCheck, WalletCards, Wrench } from 'lucide-react';
import { Sidebar, MobileNav } from '@/components/layout/Sidebar';
import { featuredProperties, formatUsdc } from '@/data/properties';

const tenantItems = [
    { icon: 'dashboard', label: 'Overview', href: '/tenant/dashboard', active: true },
    { icon: 'home_work', label: 'Browse', href: '/search' },
    { icon: 'description', label: 'Applications', href: '/tenant/applications' },
    { icon: 'account_balance_wallet', label: 'Wallet', href: '/tenant/wallet' },
    { icon: 'settings', label: 'Settings', href: '/settings' },
];

const home = featuredProperties[0];

export default function TenantDashboard() {
    return (
        <div className="min-h-screen bg-background md:pl-72">
            <Sidebar items={tenantItems} user={{ name: 'K. Mwangi', address: 'GC7...49W' }} />

            <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <header className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                        <div>
                            <p className="section-kicker">Tenant home</p>
                            <h1 className="dashboard-title mt-3">Jambo, Kamau.</h1>
                            <p className="mt-2 text-muted-foreground">Your smart tenancy is active, funded, and easy to understand.</p>
                        </div>
                        <Link to="/search" className="secondary-button w-fit">
                            Browse homes
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </header>

                    <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="surface-card overflow-hidden">
                            <div className="relative h-72">
                                <img src={home.image} alt={home.title} className="h-full w-full object-cover" />
                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,25,45,0.02),rgba(8,25,45,0.62))]" />
                                <div className="absolute bottom-5 left-5 right-5 text-white">
                                    <p className="text-sm font-bold text-white/80">Active tenancy</p>
                                    <h2 className="mt-1 text-3xl font-bold">{home.title}</h2>
                                    <p className="mt-1 text-white/82">{home.neighborhood}, {home.city}</p>
                                </div>
                            </div>
                            <div className="grid gap-4 p-5 md:grid-cols-3">
                                <div className="rounded-[8px] bg-muted p-4">
                                    <CalendarDays className="mb-3 h-5 w-5 text-primary" />
                                    <p className="text-sm text-muted-foreground">Next rent</p>
                                    <p className="mt-1 text-xl font-bold">June 5</p>
                                </div>
                                <div className="rounded-[8px] bg-muted p-4">
                                    <WalletCards className="mb-3 h-5 w-5 text-primary" />
                                    <p className="text-sm text-muted-foreground">Monthly rent</p>
                                    <p className="mt-1 text-xl font-bold">{formatUsdc(home.price)} USDC</p>
                                </div>
                                <div className="rounded-[8px] bg-muted p-4">
                                    <ShieldCheck className="mb-3 h-5 w-5 text-primary" />
                                    <p className="text-sm text-muted-foreground">Deposit</p>
                                    <p className="mt-1 text-xl font-bold">Protected</p>
                                </div>
                            </div>
                        </div>

                        <div className="surface-card p-6">
                            <h2 className="text-2xl font-bold">Payment flow</h2>
                            <div className="mt-6 space-y-4">
                                {[
                                    ['Wallet funded', '2,450 USDC available', true],
                                    ['Rent scheduled', 'Auto-release on payment day', true],
                                    ['Receipt issued', 'Email and on-chain record', false],
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
                </div>
            </main>

            <MobileNav items={tenantItems} />
        </div>
    );
}
