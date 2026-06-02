import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck, MapPin, Menu, Search, ShieldCheck, Sparkles, WalletCards, X } from 'lucide-react';
import { useState } from 'react';
import { featuredProperties, formatUsdc } from '@/data/properties';

const trustSignals = [
    { label: 'Protected deposits', value: '7-day inspection window' },
    { label: 'Rent execution', value: 'Automated on Stellar' },
    { label: 'Payment rail', value: 'USDC with receipts' },
];

const steps = [
    {
        icon: Search,
        title: 'Find a verified home',
        description: 'Browse large-photo listings, compare escrow terms, and choose a unit with clear monthly pricing.',
    },
    {
        icon: ShieldCheck,
        title: 'Apply with confidence',
        description: 'Applications, approvals, deposits, and tenancy setup stay transparent for both tenant and landlord.',
    },
    {
        icon: WalletCards,
        title: 'Let rent run quietly',
        description: 'USDC rent and protected deposits move through Stellar automation while the product stays human.',
    },
];

export default function Landing() {
    const heroProperty = featuredProperties[0];
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/20 bg-white/82 backdrop-blur-xl">
                <div className="page-shell flex h-20 items-center justify-between">
                    <Link to="/" className="text-xl font-extrabold text-primary">
                        NyumbaChain
                    </Link>
                    <nav className="hidden items-center gap-8 text-sm font-semibold text-foreground md:flex">
                        <a href="#stays" className="hover:text-primary">Stays</a>
                        <a href="#how-it-works" className="hover:text-primary">Automation</a>
                        <Link to="/landlord/dashboard" className="hover:text-primary">Landlords</Link>
                        <Link to="/tenant/dashboard" className="hover:text-primary">Tenants</Link>
                    </nav>
                    <div className="flex items-center gap-2">
                        <Link to="/auth/login" className="secondary-button hidden sm:inline-flex">Sign in</Link>
                        <Link to="/auth/register" className="primary-button hidden md:inline-flex">Get started</Link>
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden flex items-center justify-center p-2 rounded-full hover:bg-muted"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </header>

            {mobileMenuOpen && (
                <div className="fixed inset-0 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)}>
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
                    <div className="absolute inset-x-0 top-20 border-b border-white/20 bg-white/95 backdrop-blur-xl" onClick={(e) => e.stopPropagation()}>
                        <nav className="flex flex-col gap-1 p-4">
                            <a href="#stays" className="rounded-full px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>Stays</a>
                            <a href="#how-it-works" className="rounded-full px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>Automation</a>
                            <Link to="/landlord/dashboard" className="rounded-full px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>Landlords</Link>
                            <Link to="/tenant/dashboard" className="rounded-full px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>Tenants</Link>
                            <Link to="/auth/login" className="mt-2 secondary-button w-full justify-center" onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
                            <Link to="/auth/register" className="primary-button w-full justify-center" onClick={() => setMobileMenuOpen(false)}>Get started</Link>
                        </nav>
                    </div>
                </div>
            )}

            <main>
                <section className="relative min-h-[86vh] overflow-hidden pt-20">
                    <img
                        src={heroProperty.image}
                        alt={heroProperty.title}
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,25,45,0.78),rgba(8,25,45,0.46),rgba(8,25,45,0.10))]" />

                    <div className="page-shell relative flex min-h-[calc(86vh-80px)] items-center py-16">
                        <div className="max-w-3xl fade-up">
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/16 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                                <Sparkles className="h-4 w-4" />
                                Rental operating system
                            </div>
                            <h1 className="hero-title">The future of renting feels effortless.</h1>
                            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/88">
                                Discover beautiful homes across African cities, apply with confidence, and let Stellar-powered escrow handle rent, deposits, and receipts behind the scenes.
                            </p>

                            <div className="mt-9 max-w-4xl rounded-full bg-white p-2 shadow-[0_24px_70px_rgba(8,25,45,0.28)]">
                                <div className="grid grid-cols-1 gap-2 md:grid-cols-[1.1fr_0.9fr_0.7fr_auto]">
                                    <label className="flex items-center gap-3 rounded-full px-4 py-3 hover:bg-muted">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        <span className="min-w-0">
                                            <span className="block text-xs font-bold text-foreground">Where</span>
                                            <span className="block truncate text-sm text-muted-foreground">Nairobi, Kampala, Kigali</span>
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-3 rounded-full px-4 py-3 hover:bg-muted">
                                        <CalendarCheck className="h-5 w-5 text-primary" />
                                        <span>
                                            <span className="block text-xs font-bold text-foreground">Move in</span>
                                            <span className="block text-sm text-muted-foreground">Flexible dates</span>
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-3 rounded-full px-4 py-3 hover:bg-muted">
                                        <ShieldCheck className="h-5 w-5 text-primary" />
                                        <span>
                                            <span className="block text-xs font-bold text-foreground">Escrow</span>
                                            <span className="block text-sm text-muted-foreground">Protected</span>
                                        </span>
                                    </label>
                                    <Link to="/search" className="primary-button min-h-14 w-full rounded-full md:w-auto">
                                        <Search className="h-5 w-5" />
                                        Search
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="page-shell -mt-10 relative z-10">
                    <div className="grid gap-4 md:grid-cols-3">
                        {trustSignals.map((signal) => (
                            <div key={signal.label} className="surface-card p-5">
                                <p className="text-sm font-bold text-primary">{signal.label}</p>
                                <p className="mt-2 text-lg font-semibold">{signal.value}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="stays" className="page-shell py-20">
                    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                        <div>
                            <p className="section-kicker">Featured stays</p>
                            <h2 className="page-title mt-3">Homes that feel premium before the lease even starts.</h2>
                        </div>
                        <Link to="/search" className="secondary-button w-fit">
                            Explore all homes
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {featuredProperties.map((property) => (
                            <Link key={property.id} to={`/properties/${property.id}`} className="group">
                                <article className="overflow-hidden">
                                    <div className="relative aspect-[4/3] overflow-hidden rounded-[8px] bg-muted">
                                        <img
                                            src={property.image}
                                            alt={property.title}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                        />
                                        <span className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1 text-xs font-bold text-primary shadow-sm">
                                            {property.available ? 'Available now' : 'Waitlist'}
                                        </span>
                                    </div>
                                    <div className="pt-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="font-bold">{property.title}</h3>
                                                <p className="text-sm text-muted-foreground">{property.neighborhood}, {property.city}</p>
                                            </div>
                                            <span className="text-sm font-bold">{property.rating}</span>
                                        </div>
                                        <p className="mt-2 text-sm text-muted-foreground">{property.beds} beds · {property.baths} baths · {property.sqm} sqm</p>
                                        <p className="mt-2 font-bold">{formatUsdc(property.price)} USDC <span className="font-normal text-muted-foreground">/ month</span></p>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                </section>

                <section id="how-it-works" className="bg-white py-20">
                    <div className="page-shell">
                        <div className="max-w-3xl">
                            <p className="section-kicker">How it works</p>
                            <h2 className="page-title mt-3">A rental flow people understand, backed by infrastructure they can trust.</h2>
                        </div>
                        <div className="mt-10 grid gap-5 md:grid-cols-3">
                            {steps.map((step) => {
                                const Icon = step.icon;
                                return (
                                    <div key={step.title} className="surface-card p-6">
                                        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-xl font-bold">{step.title}</h3>
                                        <p className="mt-3 leading-7 text-muted-foreground">{step.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
