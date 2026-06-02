import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Bath, BedDouble, CalendarDays, Heart, Home, MapPin, ShieldCheck, Sparkles, WalletCards } from 'lucide-react';
import { featuredProperties, formatUsdc } from '@/data/properties';

export default function PropertyDetail() {
    const { id } = useParams();
    const property = featuredProperties.find((item: typeof featuredProperties[0]) => item.id === id) ?? featuredProperties[0];

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-40 border-b border-border bg-white/92 backdrop-blur-xl">
                <div className="page-shell flex h-20 items-center justify-between">
                    <Link to="/" className="text-xl font-extrabold text-primary">NyumbaChain</Link>
                    <div className="flex items-center gap-2">
                        <Link to="/search" className="secondary-button py-2">
                            <ArrowLeft className="h-4 w-4" />
                            Search
                        </Link>
                        <button className="secondary-button py-2">
                            <Heart className="h-4 w-4" />
                            Save
                        </button>
                    </div>
                </div>
            </header>

            <main className="page-shell py-8">
                <section className="mb-8">
                    <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                        <div>
                            <h1 className="page-title">{property.title}</h1>
                            <p className="mt-2 flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4 text-primary" />
                                {property.neighborhood}, {property.city}, {property.country}
                            </p>
                        </div>
                        <div className="rounded-full border border-border bg-white px-5 py-3 text-sm font-bold text-primary shadow-sm">
                            {property.rating} guest rating · {property.available ? 'Available now' : 'Waitlist open'}
                        </div>
                    </div>

                    <div className="grid gap-3 overflow-hidden rounded-[8px] lg:grid-cols-[1.25fr_0.75fr]">
                        <img src={property.gallery[0]} alt={property.title} className="h-[420px] w-full object-cover" />
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                            {property.gallery.slice(1).map((image: string) => (
                                <img key={image} src={image} alt={property.title} className="h-[204px] w-full object-cover" />
                            ))}
                        </div>
                    </div>
                </section>

                <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px]">
                    <div className="space-y-8">
                        <div className="surface-card p-6">
                            <div className="flex flex-col gap-5 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold">Hosted by {property.landlord}</h2>
                                    <p className="mt-2 text-muted-foreground">{property.description}</p>
                                </div>
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
                                    {property.landlord.charAt(0)}
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-3">
                                <div className="rounded-[8px] bg-muted p-4">
                                    <BedDouble className="mb-3 h-5 w-5 text-primary" />
                                    <p className="font-bold">{property.beds} bedrooms</p>
                                    <p className="text-sm text-muted-foreground">Private sleeping spaces</p>
                                </div>
                                <div className="rounded-[8px] bg-muted p-4">
                                    <Bath className="mb-3 h-5 w-5 text-primary" />
                                    <p className="font-bold">{property.baths} bathrooms</p>
                                    <p className="text-sm text-muted-foreground">Ready for long stays</p>
                                </div>
                                <div className="rounded-[8px] bg-muted p-4">
                                    <Home className="mb-3 h-5 w-5 text-primary" />
                                    <p className="font-bold">{property.sqm} sqm</p>
                                    <p className="text-sm text-muted-foreground">Measured living area</p>
                                </div>
                            </div>
                        </div>

                        <div className="surface-card p-6">
                            <h2 className="text-2xl font-bold">What this place offers</h2>
                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                {property.amenities.map((amenity: string) => (
                                    <div key={amenity} className="flex items-center gap-3 rounded-[8px] border border-border p-4">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                        <span className="font-semibold">{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="surface-card p-6">
                            <h2 className="text-2xl font-bold">Escrow made invisible</h2>
                            <div className="mt-6 grid gap-4 md:grid-cols-3">
                                <div className="rounded-[8px] bg-primary p-5 text-white">
                                    <WalletCards className="mb-4 h-6 w-6" />
                                    <p className="text-sm text-white/70">Monthly rent</p>
                                    <p className="mt-1 text-2xl font-bold">{formatUsdc(property.price)} USDC</p>
                                </div>
                                <div className="rounded-[8px] bg-muted p-5">
                                    <ShieldCheck className="mb-4 h-6 w-6 text-primary" />
                                    <p className="text-sm text-muted-foreground">Protected deposit</p>
                                    <p className="mt-1 text-2xl font-bold">{formatUsdc(property.deposit)} USDC</p>
                                </div>
                                <div className="rounded-[8px] bg-muted p-5">
                                    <CalendarDays className="mb-4 h-6 w-6 text-primary" />
                                    <p className="text-sm text-muted-foreground">Rent release</p>
                                    <p className="mt-1 text-2xl font-bold">Monthly</p>
                                </div>
                            </div>
                            <p className="mt-5 leading-7 text-muted-foreground">
                                The tenant funds a USDC wallet, the smart contract schedules rent release, and both parties receive an immutable payment trail without needing to manage blockchain details.
                            </p>
                        </div>
                    </div>

                    <aside className="lg:sticky lg:top-28 lg:self-start">
                        <div className="surface-card p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground">Monthly rent</p>
                                    <p className="text-3xl font-extrabold text-primary">{formatUsdc(property.price)} USDC</p>
                                </div>
                                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">{property.escrowState}</span>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <label className="rounded-[8px] border border-border p-3">
                                    <span className="block text-xs font-bold text-muted-foreground">Move in</span>
                                    <input type="date" className="mt-1 w-full bg-transparent text-sm font-semibold outline-none" />
                                </label>
                                <label className="rounded-[8px] border border-border p-3">
                                    <span className="block text-xs font-bold text-muted-foreground">Lease</span>
                                    <select className="mt-1 w-full bg-transparent text-sm font-semibold outline-none">
                                        <option>12 months</option>
                                        <option>6 months</option>
                                        <option>3 months</option>
                                    </select>
                                </label>
                            </div>

                            <button className="primary-button mt-5 w-full">
                                Apply to rent
                                <ShieldCheck className="h-4 w-4" />
                            </button>

                            <div className="mt-6 space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">First month rent</span>
                                    <span className="font-semibold">{formatUsdc(property.price)} USDC</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Security deposit</span>
                                    <span className="font-semibold">{formatUsdc(property.deposit)} USDC</span>
                                </div>
                                <div className="flex justify-between border-t border-border pt-3 text-base">
                                    <span className="font-bold">Due to activate lease</span>
                                    <span className="font-extrabold">{formatUsdc(property.price + property.deposit)} USDC</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </section>
            </main>
        </div>
    );
}
