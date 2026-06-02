import { Sidebar, MobileNav } from '@/components/layout/Sidebar';

const TENANT_SIDEBAR_ITEMS = [
    { icon: 'dashboard', label: 'Overview', href: '/tenant/dashboard' },
    { icon: 'home_work', label: 'Properties', href: '/properties' },
    { icon: 'description', label: 'Applications', href: '/tenant/applications' },
    { icon: 'account_balance_wallet', label: 'Wallet', href: '/tenant/wallet', active: true },
    { icon: 'settings', label: 'Settings', href: '/settings' },
];

export default function TenantWallet() {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar items={TENANT_SIDEBAR_ITEMS} user={{ name: 'K. Mwangi', address: 'GC7...49W' }} />
            
            <main className="flex-1 md:ml-64 p-lg md:p-xl">
                <header className="mb-8">
                    <h1 className="font-display-lg">Wallet</h1>
                    <p className="text-on-surface-variant">Manage your funds and transactions.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-8">
                    <div className="card card-shadow-md p-lg">
                        <p className="text-on-surface-variant text-label-sm mb-2">Available Balance</p>
                        <h3 className="font-display-lg text-primary">2,450.00 USDC</h3>
                    </div>
                    <div className="card card-shadow-md p-lg">
                        <p className="text-on-surface-variant text-label-sm mb-2">Deposit Balance</p>
                        <h3 className="font-display-lg text-secondary">2,000.00 USDC</h3>
                    </div>
                    <div className="card card-shadow-md p-lg">
                        <p className="text-on-surface-variant text-label-sm mb-2">Staked</p>
                        <h3 className="font-display-lg text-tertiary">0.00 USDC</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
                    <div className="card card-shadow-lg p-lg">
                        <h3 className="font-headline-md mb-4">Funding</h3>
                        <div className="flex items-center gap-6">
                            <div className="w-32 h-32 bg-surface rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-on-surface-variant">QR Code</span>
                            </div>
                            <div className="space-y-3">
                                <button className="bg-primary-container text-on-primary-container px-6 py-md rounded-lg font-button-text shadow-sm hover:shadow-md transition-shadow">
                                    Fund Wallet
                                </button>
                                <button className="text-primary font-button-text">Withdraw Funds</button>
                            </div>
                        </div>
                    </div>

                    <div className="card card-shadow-lg p-lg">
                        <h3 className="font-headline-md mb-4">Recent Transactions</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                                <div>
                                    <p className="font-button-text">Rent Payment</p>
                                    <p className="text-on-surface-variant text-label-sm">Mar 24, 2024</p>
                                </div>
                                <p className="text-success">+1,200.00 USDC</p>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                                <div>
                                    <p className="font-button-text">Maintenance Fee</p>
                                    <p className="text-on-surface-variant text-label-sm">Mar 22, 2024</p>
                                </div>
                                <p className="text-error">-45.00 USDC</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <MobileNav items={TENANT_SIDEBAR_ITEMS} />
        </div>
    );
}