import { Sidebar, MobileNav } from '@/components/layout/Sidebar';

const TENANT_SIDEBAR_ITEMS = [
    { icon: 'dashboard', label: 'Overview', href: '/tenant/dashboard' },
    { icon: 'home_work', label: 'Properties', href: '/properties' },
    { icon: 'description', label: 'Applications', href: '/tenant/applications' },
    { icon: 'account_balance_wallet', label: 'Wallet', href: '/tenant/wallet', active: true },
    { icon: 'settings', label: 'Settings', href: '/settings' },
];

export default function TenantDashboard() {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar items={TENANT_SIDEBAR_ITEMS} user={{ name: 'K. Mwangi', address: 'GC7...49W' }} />
            
            <main className="flex-1 md:ml-64 p-lg md:p-xl">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-md">
                    <div>
                        <h2 className="font-display-lg">Jambo, Kamau</h2>
                        <p className="text-on-surface-variant">Your smart tenancy is active and secure.</p>
                    </div>
                    <div className="flex items-center gap-md px-md py-sm bg-surface rounded-full shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-success"></div>
                        <span className="text-label-sm">Network: Mainnet</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-lg mb-8">
                    <div className="card card-shadow-sm p-lg">
                        <p className="text-on-surface-variant text-label-sm mb-2">Wallet Balance</p>
                        <h3 className="font-display-lg text-primary">1,250.00 USDC</h3>
                    </div>
                    <div className="card card-shadow-sm p-lg">
                        <p className="text-on-surface-variant text-label-sm mb-2">Deposit Balance</p>
                        <h3 className="font-display-lg text-secondary">2,000.00 USDC</h3>
                    </div>
                    <div className="card card-shadow-sm p-lg">
                        <p className="text-on-surface-variant text-label-sm mb-2">Next Rent Due</p>
                        <h3 className="font-display-lg text-tertiary">08d 14h 22m</h3>
                    </div>
                    <div className="card card-shadow-sm p-lg">
                        <p className="text-on-surface-variant text-label-sm mb-2">Occupancy</p>
                        <h3 className="font-display-lg text-success">85%</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg mb-8">
                    <div className="card card-shadow-md p-lg">
                        <h3 className="font-headline-md mb-4">Active Tenancy</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-on-surface-variant">Property</span>
                                <span>Skyline Residency #402</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-on-surface-variant">Lease Term</span>
                                <span>12 months</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-on-surface-variant">Status</span>
                                <span className="text-success">Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="card card-shadow-md p-lg">
                        <h3 className="font-headline-md mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="p-4 bg-primary/10 rounded-lg text-center card-shadow-sm hover:card-shadow-md transition-shadow">
                                <span className="material-symbols-outlined text-primary text-2xl mb-2">add_card</span>
                                <p className="text-label-sm">Fund Wallet</p>
                            </button>
                            <button className="p-4 bg-surface rounded-lg text-center card-shadow-sm hover:card-shadow-md transition-shadow">
                                <span className="material-symbols-outlined text-foreground text-2xl mb-2">receipt</span>
                                <p className="text-label-sm">View Receipts</p>
                            </button>
                            <button className="p-4 bg-surface rounded-lg text-center card-shadow-sm hover:card-shadow-md transition-shadow">
                                <span className="material-symbols-outlined text-foreground text-2xl mb-2">contract</span>
                                <p className="text-label-sm">View Contract</p>
                            </button>
                            <button className="p-4 bg-error/10 rounded-lg text-center card-shadow-sm hover:card-shadow-md transition-shadow">
                                <span className="material-symbols-outlined text-error text-2xl mb-2">campaign</span>
                                <p className="text-label-sm">Request Fix</p>
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <MobileNav items={TENANT_SIDEBAR_ITEMS} />
        </div>
    );
}