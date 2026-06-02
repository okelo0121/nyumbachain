import { Sidebar, MobileNav } from '@/components/layout/Sidebar';

const TENANT_SIDEBAR_ITEMS = [
    { icon: 'dashboard', label: 'Overview', href: '/tenant/dashboard' },
    { icon: 'home_work', label: 'Properties', href: '/properties' },
    { icon: 'description', label: 'Applications', href: '/tenant/applications', active: true },
    { icon: 'account_balance_wallet', label: 'Wallet', href: '/tenant/wallet' },
    { icon: 'settings', label: 'Settings', href: '/settings' },
];

export default function TenantApplications() {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar items={TENANT_SIDEBAR_ITEMS} user={{ name: 'K. Mwangi', address: 'GC7...49W' }} />
            
            <main className="flex-1 md:ml-64 p-lg">
                <header className="mb-8">
                    <h1 className="font-display-lg">My Applications</h1>
                    <p className="text-on-surface-variant">Track your property applications.</p>
                </header>

                <div className="card card-shadow-md p-lg">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
                            <div>
                                <p className="font-button-text">Horizon Peak Penthouse</p>
                                <p className="text-on-surface-variant text-label-sm">Application submitted 5 days ago</p>
                            </div>
                            <span className="text-warning bg-warning/10 px-3 py-1 rounded-full text-label-sm">Pending Review</span>
                        </div>
                    </div>
                </div>
            </main>

            <MobileNav items={TENANT_SIDEBAR_ITEMS} />
        </div>
    );
}