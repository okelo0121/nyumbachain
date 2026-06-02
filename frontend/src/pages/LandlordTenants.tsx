import { Sidebar, MobileNav } from '@/components/layout/Sidebar';

const LANDLORD_SIDEBAR_ITEMS = [
    { icon: 'dashboard', label: 'Overview', href: '/landlord/dashboard' },
    { icon: 'home_work', label: 'Properties', href: '/landlord/properties' },
    { icon: 'add', label: 'Add Property', href: '/landlord/properties/new' },
    { icon: 'description', label: 'Applications', href: '/landlord/applications' },
    { icon: 'people', label: 'Tenants', href: '/landlord/tenants', active: true },
    { icon: 'settings', label: 'Settings', href: '/settings' },
];

export default function LandlordTenants() {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar items={LANDLORD_SIDEBAR_ITEMS} user={{ name: 'O. Otieno', address: 'GA5...9KXW' }} />
            
            <main className="flex-1 md:ml-64 p-lg">
                <header className="mb-8">
                    <h1 className="font-display-lg">Tenants</h1>
                    <p className="text-on-surface-variant">Manage your tenants.</p>
                </header>

                <div className="card card-shadow-md p-lg">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-surface rounded-lg">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">SW</div>
                            <div className="flex-1">
                                <p className="font-button-text">Sarah Wanjiku</p>
                                <p className="text-on-surface-variant text-label-sm">Unit #301 • Lease: Jan 2024 - Dec 2024</p>
                            </div>
                            <span className="text-success bg-success/10 px-3 py-1 rounded-full text-label-sm">Active</span>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-surface rounded-lg">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">JM</div>
                            <div className="flex-1">
                                <p className="font-button-text">James Mwangi</p>
                                <p className="text-on-surface-variant text-label-sm">Unit #205 • Lease: Feb 2024 - Jul 2024</p>
                            </div>
                            <span className="text-warning bg-warning/10 px-3 py-1 rounded-full text-label-sm">Expiring</span>
                        </div>
                    </div>
                </div>
            </main>

            <MobileNav items={LANDLORD_SIDEBAR_ITEMS} />
        </div>
    );
}