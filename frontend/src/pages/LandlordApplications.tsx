import { Sidebar, MobileNav } from '@/components/layout/Sidebar';

const LANDLORD_SIDEBAR_ITEMS = [
    { icon: 'dashboard', label: 'Overview', href: '/landlord/dashboard' },
    { icon: 'home_work', label: 'Properties', href: '/landlord/properties' },
    { icon: 'add', label: 'Add Property', href: '/landlord/properties/new' },
    { icon: 'description', label: 'Applications', href: '/landlord/applications', active: true },
    { icon: 'people', label: 'Tenants', href: '/landlord/tenants' },
    { icon: 'settings', label: 'Settings', href: '/settings' },
];

export default function LandlordApplications() {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar items={LANDLORD_SIDEBAR_ITEMS} user={{ name: 'O. Otieno', address: 'GA5...9KXW' }} />
            
            <main className="flex-1 md:ml-64 p-lg">
                <header className="mb-8">
                    <h1 className="font-display-lg">Applications</h1>
                    <p className="text-on-surface-variant">Review tenant applications.</p>
                </header>

                <div className="card card-shadow-md p-lg">
                    <div className="space-y-4">
                        <div className="border-b border-border pb-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-headline-md">Sarah Wanjiku</h3>
                                <span className="text-on-surface-variant text-label-sm">Applied 2 days ago</span>
                            </div>
                            <p className="text-on-surface-variant mb-4">Unit #301 • 2 Bedroom • 1 Bath</p>
                            <div className="flex gap-2">
                                <button className="bg-primary-container text-on-primary-container px-4 py-2 rounded-lg font-button-text shadow-sm">Approve</button>
                                <button className="border border-border px-4 py-2 rounded-lg font-button-text">Request Info</button>
                                <button className="border border-border px-4 py-2 rounded-lg text-error font-button-text">Decline</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <MobileNav items={LANDLORD_SIDEBAR_ITEMS} />
        </div>
    );
}