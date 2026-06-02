import { Sidebar, MobileNav } from '@/components/layout/Sidebar';

const LANDLORD_SIDEBAR_ITEMS = [
    { icon: 'dashboard', label: 'Overview', href: '/landlord/dashboard' },
    { icon: 'home_work', label: 'Properties', href: '/landlord/properties' },
    { icon: 'add', label: 'Add Property', href: '/landlord/properties/new', active: true },
    { icon: 'description', label: 'Applications', href: '/landlord/applications' },
    { icon: 'people', label: 'Tenants', href: '/landlord/tenants' },
    { icon: 'settings', label: 'Settings', href: '/settings' },
];

export default function NewProperty() {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar items={LANDLORD_SIDEBAR_ITEMS} user={{ name: 'O. Otieno', address: 'GA5...9KXW' }} />
            
            <main className="flex-1 md:ml-64 p-lg">
                <header className="mb-8">
                    <h1 className="font-display-lg">Add New Property</h1>
                    <p className="text-on-surface-variant">List a new rental property.</p>
                </header>

                <div className="card card-shadow-lg p-xl max-w-2xl">
                    <form className="space-y-6">
                        <div>
                            <label className="text-label-sm mb-2 block">Property Name</label>
                            <input className="w-full p-md rounded-lg border border-border bg-white" placeholder="Enter property name" />
                        </div>
                        <div>
                            <label className="text-label-sm mb-2 block">Location</label>
                            <input className="w-full p-md rounded-lg border border-border bg-white" placeholder="Enter location" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-label-sm mb-2 block">Price (USDC/mo)</label>
                                <input className="w-full p-md rounded-lg border border-border bg-white" placeholder="0" />
                            </div>
                            <div>
                                <label className="text-label-sm mb-2 block">Bedrooms</label>
                                <input type="number" className="w-full p-md rounded-lg border border-border bg-white" placeholder="0" />
                            </div>
                        </div>
                        <button className="w-full bg-primary-container text-on-primary-container py-md rounded-lg font-button-text shadow-sm hover:shadow-md transition-shadow">
                            List Property
                        </button>
                    </form>
                </div>
            </main>

            <MobileNav items={LANDLORD_SIDEBAR_ITEMS} />
        </div>
    );
}