import { Sidebar, MobileNav } from '@/components/layout/Sidebar';

const LANDLORD_SIDEBAR_ITEMS = [
    { icon: 'dashboard', label: 'Overview', href: '/landlord/dashboard' },
    { icon: 'home_work', label: 'Properties', href: '/landlord/properties', active: true },
    { icon: 'add', label: 'Add Property', href: '/landlord/properties/new' },
    { icon: 'description', label: 'Applications', href: '/landlord/applications' },
    { icon: 'people', label: 'Tenants', href: '/landlord/tenants' },
    { icon: 'settings', label: 'Settings', href: '/settings' },
];

export default function LandlordDashboard() {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar items={LANDLORD_SIDEBAR_ITEMS} user={{ name: 'O. Otieno', address: 'GA5...9KXW' }} />
            
            <main className="flex-1 md:ml-64 p-lg md:p-xl">
                <header className="mb-8">
                    <h1 className="font-display-lg">Dashboard</h1>
                    <p className="text-on-surface-variant">Welcome back, Otieno!</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-lg mb-8">
                    <div className="card card-shadow-sm p-lg">
                        <p className="text-on-surface-variant text-label-sm mb-2">Total Properties</p>
                        <h3 className="font-display-lg text-primary">12</h3>
                    </div>
                    <div className="card card-shadow-sm p-lg">
                        <p className="text-on-surface-variant text-label-sm mb-2">Monthly Income</p>
                        <h3 className="font-display-lg text-secondary">42,500 USDC</h3>
                    </div>
                    <div className="card card-shadow-sm p-lg">
                        <p className="text-on-surface-variant text-label-sm mb-2">Occupancy Rate</p>
                        <h3 className="font-display-lg text-tertiary">85%</h3>
                    </div>
                    <div className="card card-shadow-sm p-lg">
                        <p className="text-on-surface-variant text-label-sm mb-2">Pending Apps</p>
                        <h3 className="font-display-lg text-warning">3</h3>
                    </div>
                </div>

                <div className="card card-shadow-md p-lg mb-8">
                    <h3 className="font-headline-md mb-4">Recent Applications</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
                            <div>
                                <p className="font-button-text">Sarah Wanjiku</p>
                                <p className="text-on-surface-variant text-label-sm">Unit #301 • Applied 2 days ago</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="bg-primary-container text-on-primary-container px-4 py-2 rounded-lg font-button-text shadow-sm">Approve</button>
                                <button className="border border-border px-4 py-2 rounded-lg font-button-text">Decline</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <MobileNav items={LANDLORD_SIDEBAR_ITEMS} />
        </div>
    );
}