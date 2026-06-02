import { Camera, CheckCircle2, MapPin, ShieldCheck, Upload } from 'lucide-react';
import { Sidebar, MobileNav } from '@/components/layout/Sidebar';

const landlordItems = [
    { icon: 'dashboard', label: 'Overview', href: '/landlord/dashboard' },
    { icon: 'home_work', label: 'Properties', href: '/landlord/properties' },
    { icon: 'add', label: 'Add Property', href: '/landlord/properties/new', active: true },
    { icon: 'description', label: 'Applications', href: '/landlord/applications' },
    { icon: 'people', label: 'Tenants', href: '/landlord/tenants' },
    { icon: 'settings', label: 'Settings', href: '/settings' },
];

export default function NewProperty() {
    return (
        <div className="min-h-screen bg-background md:pl-72">
            <Sidebar items={landlordItems} user={{ name: 'O. Otieno', address: 'GA5...9KXW' }} />

            <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <section>
                        <p className="section-kicker">List a home</p>
                        <h1 className="dashboard-title mt-3">Create a listing that feels ready to book.</h1>
                        <p className="mt-2 max-w-2xl text-muted-foreground">Capture the essentials tenants expect: photos, location, unit details, rent, deposit, and escrow terms.</p>

                        <form className="mt-8 space-y-6">
                            <div className="surface-card p-6">
                                <h2 className="text-2xl font-bold">Property basics</h2>
                                <div className="mt-5 grid gap-4 md:grid-cols-2">
                                    <label>
                                        <span className="mb-2 block text-sm font-bold">Property title</span>
                                        <input className="field rounded-[8px]" placeholder="Horizon Peak Penthouse" />
                                    </label>
                                    <label>
                                        <span className="mb-2 block text-sm font-bold">Property type</span>
                                        <select className="field rounded-[8px]">
                                            <option>Apartment</option>
                                            <option>House</option>
                                            <option>Studio</option>
                                            <option>Bedsitter</option>
                                        </select>
                                    </label>
                                    <label className="md:col-span-2">
                                        <span className="mb-2 block text-sm font-bold">Description</span>
                                        <textarea className="field min-h-32 rounded-[8px]" placeholder="Describe the home, neighborhood, utilities, and lease expectations." />
                                    </label>
                                </div>
                            </div>

                            <div className="surface-card p-6">
                                <h2 className="text-2xl font-bold">Location and unit terms</h2>
                                <div className="mt-5 grid gap-4 md:grid-cols-2">
                                    <label>
                                        <span className="mb-2 block text-sm font-bold">City</span>
                                        <input className="field rounded-[8px]" placeholder="Kampala" />
                                    </label>
                                    <label>
                                        <span className="mb-2 block text-sm font-bold">Neighborhood</span>
                                        <input className="field rounded-[8px]" placeholder="Ntinda" />
                                    </label>
                                    <label>
                                        <span className="mb-2 block text-sm font-bold">Monthly rent (USDC)</span>
                                        <input className="field rounded-[8px]" placeholder="850" type="number" />
                                    </label>
                                    <label>
                                        <span className="mb-2 block text-sm font-bold">Deposit (USDC)</span>
                                        <input className="field rounded-[8px]" placeholder="1700" type="number" />
                                    </label>
                                    <label>
                                        <span className="mb-2 block text-sm font-bold">Bedrooms</span>
                                        <input className="field rounded-[8px]" placeholder="2" type="number" />
                                    </label>
                                    <label>
                                        <span className="mb-2 block text-sm font-bold">Bathrooms</span>
                                        <input className="field rounded-[8px]" placeholder="2" type="number" />
                                    </label>
                                </div>
                            </div>

                            <div className="surface-card p-6">
                                <h2 className="text-2xl font-bold">Photos</h2>
                                <div className="mt-5 rounded-[8px] border border-dashed border-primary/30 bg-primary/5 p-8 text-center">
                                    <Camera className="mx-auto h-10 w-10 text-primary" />
                                    <p className="mt-3 font-bold">Upload bright, high-resolution property photos</p>
                                    <p className="mt-1 text-sm text-muted-foreground">Cloudflare R2 photo uploads remain handled by the existing backend.</p>
                                    <button className="secondary-button mt-5" type="button">
                                        <Upload className="h-4 w-4" />
                                        Choose images
                                    </button>
                                </div>
                            </div>

                            <button className="primary-button" type="button">
                                Publish property
                                <CheckCircle2 className="h-4 w-4" />
                            </button>
                        </form>
                    </section>

                    <aside className="lg:sticky lg:top-6 lg:self-start">
                        <div className="surface-card p-6">
                            <h2 className="text-xl font-bold">Listing readiness</h2>
                            <div className="mt-5 space-y-4">
                                {[
                                    ['Location verified', MapPin],
                                    ['Photos added', Camera],
                                    ['Escrow terms set', ShieldCheck],
                                ].map(([label, Icon]) => (
                                    <div key={label as string} className="flex items-center gap-3 rounded-[8px] bg-muted p-3">
                                        <Icon className="h-5 w-5 text-primary" />
                                        <span className="font-semibold">{label as string}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            <MobileNav items={landlordItems} />
        </div>
    );
}
