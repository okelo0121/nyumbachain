import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { divIcon } from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { Bath, BedDouble, Filter, Home, MapPin, Search as SearchIcon, ShieldCheck, SlidersHorizontal, Star } from 'lucide-react';
import { featuredProperties, formatUsdc } from '@/data/properties';
import { cn } from '@/utils/cn';

const filters = ['Available now', 'Protected deposit', 'Furnished', 'Parking', 'Backup power'];

export default function Search() {
    const [query, setQuery] = useState('');
    const [selectedId, setSelectedId] = useState(featuredProperties[0]?.id ?? '');
    const [activeFilter, setActiveFilter] = useState('Available now');

    const filteredProperties = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        return featuredProperties.filter((property) => {
            const matchesQuery =
                !normalized ||
                [property.title, property.city, property.neighborhood, property.country, property.unitType]
                    .join(' ')
                    .toLowerCase()
                    .includes(normalized);
            const matchesAvailability = activeFilter !== 'Available now' || property.available;
            const matchesAmenity =
                !['Furnished', 'Parking', 'Backup power'].includes(activeFilter) ||
                property.amenities.includes(activeFilter);
            return matchesQuery && matchesAvailability && matchesAmenity;
        });
    }, [activeFilter, query]);

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-40 border-b border-border bg-white/92 backdrop-blur-xl">
                <div className="page-shell flex min-h-20 flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                    <Link to="/" className="text-xl font-extrabold text-primary">NyumbaChain</Link>

                    <div className="flex flex-1 items-center gap-3 rounded-full border border-border bg-white p-2 shadow-[0_12px_32px_rgba(18,29,45,0.07)] lg:max-w-2xl">
                        <SearchIcon className="ml-3 h-5 w-5 text-primary" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"
                            placeholder="Search city, neighborhood, home type"
                        />
                        <button className="primary-button px-4 py-2">
                            <SlidersHorizontal className="h-4 w-4" />
                            <span className="hidden sm:inline">Search</span>
                        </button>
                    </div>

                    <div className="hidden items-center gap-2 lg:flex">
                        <Link to="/auth/login" className="secondary-button py-2">Sign in</Link>
                        <Link to="/auth/register" className="primary-button py-2">List a home</Link>
                    </div>
                </div>

                <div className="page-shell flex gap-2 overflow-x-auto pb-4">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={cn(
                                'chip shrink-0',
                                activeFilter === filter && 'border-primary bg-primary text-white hover:border-primary',
                            )}
                        >
                            <Filter className="h-4 w-4" />
                            {filter}
                        </button>
                    ))}
                </div>
            </header>

            <main className="grid min-h-[calc(100vh-145px)] lg:grid-cols-[minmax(0,1fr)_42vw]">
                <section className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-end justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-muted-foreground">{filteredProperties.length} homes with escrow-ready leases</p>
                            <h1 className="mt-1 text-3xl font-bold">Stay in homes that make payments simple.</h1>
                        </div>
                        <button className="secondary-button hidden md:inline-flex">
                            <MapPin className="h-4 w-4" />
                            Map synced
                        </button>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {filteredProperties.map((property) => (
                            <Link
                                key={property.id}
                                to={`/properties/${property.id}`}
                                onMouseEnter={() => setSelectedId(property.id)}
                                onFocus={() => setSelectedId(property.id)}
                                className="group"
                            >
                                <article
                                    className={cn(
                                        'rounded-[8px] bg-transparent transition duration-300',
                                        selectedId === property.id && 'scale-[1.01]',
                                    )}
                                >
                                    <div className="relative aspect-[4/3] overflow-hidden rounded-[8px] bg-muted">
                                        <img
                                            src={property.image}
                                            alt={property.title}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute left-3 top-3 flex gap-2">
                                            <span className="rounded-full bg-white/94 px-3 py-1 text-xs font-bold text-primary shadow-sm">
                                                {property.available ? 'Available' : 'Waitlist'}
                                            </span>
                                            <span className="rounded-full bg-white/94 px-3 py-1 text-xs font-bold text-foreground shadow-sm">
                                                Escrow {property.escrowState}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="pt-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h2 className="text-lg font-bold">{property.title}</h2>
                                                <p className="text-sm text-muted-foreground">{property.neighborhood}, {property.city}</p>
                                            </div>
                                            <span className="flex items-center gap-1 text-sm font-bold">
                                                <Star className="h-4 w-4 fill-secondary text-secondary" />
                                                {property.rating}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                                            <span className="inline-flex items-center gap-1"><BedDouble className="h-4 w-4" /> {property.beds} beds</span>
                                            <span className="inline-flex items-center gap-1"><Bath className="h-4 w-4" /> {property.baths} baths</span>
                                            <span className="inline-flex items-center gap-1"><Home className="h-4 w-4" /> {property.sqm} sqm</span>
                                        </div>
                                        <div className="mt-4 flex items-end justify-between gap-3">
                                            <p className="font-bold">{formatUsdc(property.price)} USDC <span className="font-normal text-muted-foreground">/ month</span></p>
                                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                                                <ShieldCheck className="h-4 w-4" />
                                                Deposit protected
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                </section>

                <aside className="sticky top-[145px] hidden h-[calc(100vh-145px)] p-4 lg:block">
                    <div className="h-full overflow-hidden rounded-[8px] border border-border shadow-[0_20px_50px_rgba(18,29,45,0.10)]">
                        <MapContainer center={[-1.2762, 36.7987]} zoom={12} scrollWheelZoom className="h-full">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {featuredProperties.map((property) => (
                                <Marker
                                    key={property.id}
                                    position={property.coordinates}
                                    eventHandlers={{
                                        mouseover: () => setSelectedId(property.id),
                                        click: () => setSelectedId(property.id),
                                    }}
                                    icon={divIcon({
                                        className: cn('map-price-marker', selectedId === property.id && 'is-selected'),
                                        html: `<span>${formatUsdc(property.price)} USDC</span>`,
                                        iconSize: [88, 38],
                                        iconAnchor: [44, 19],
                                    })}
                                >
                                    <Popup>
                                        <Link to={`/properties/${property.id}`} className="block w-64 overflow-hidden rounded-[8px] bg-white">
                                            <img src={property.image} alt={property.title} className="h-32 w-full object-cover" />
                                            <div className="p-3">
                                                <p className="font-bold text-foreground">{property.title}</p>
                                                <p className="text-sm text-muted-foreground">{property.neighborhood}, {property.city}</p>
                                                <p className="mt-2 font-bold text-primary">{formatUsdc(property.price)} USDC / month</p>
                                            </div>
                                        </Link>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </aside>
            </main>
        </div>
    );
}
