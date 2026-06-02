import { Sidebar, MobileNav } from '@/components/layout/Sidebar';

const LANDLORD_SIDEBAR_ITEMS = [
    { icon: 'dashboard', label: 'Overview', href: '/landlord/dashboard' },
    { icon: 'home_work', label: 'Properties', href: '/landlord/properties' },
    { icon: 'add', label: 'Add Property', href: '/landlord/properties/new' },
    { icon: 'description', label: 'Applications', href: '/landlord/applications' },
    { icon: 'people', label: 'Tenants', href: '/landlord/tenants' },
    { icon: 'settings', label: 'Settings', href: '/settings' },
];

export default function LandlordProperties() {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar items={LANDLORD_SIDEBAR_ITEMS} user={{ name: 'O. Otieno', address: 'GA5...9KXW' }} />
            
            <main className="flex-1 md:ml-64 p-lg">
                <header className="mb-8">
                    <h1 className="font-display-lg">Properties</h1>
                    <p className="text-on-surface-variant">Manage your rental properties.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                    <div className="card card-shadow-md p-lg hover:card-shadow-lg transition-shadow cursor-pointer">
                        <img className="w-full h-48 object-cover rounded-lg mb-4" src="https://images.unsplash.com/photo-1520603089958-2f0d9b7e5c6b?w=400&h=200&fit=crop" alt="Property" />
                        <h3 className="font-headline-md mb-2">Kilimani Apartment</h3>
                        <p className="text-on-surface-variant mb-4">2 Bed • 1 Bath • KSh 85,000/mo</p>
                        <div className="flex justify-between items-center">
                            <span className="text-success bg-success/10 px-3 py-1 rounded-full text-label-sm">Occupied</span>
                            <button className="text-primary font-button-text">View Details</button>
                        </div>
                    </div>
                </div>
            </main>

            <MobileNav items={LANDLORD_SIDEBAR_ITEMS} />
        </div>
    );
}