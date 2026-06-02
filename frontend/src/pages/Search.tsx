import { useState } from 'react';
import { Link } from 'react-router-dom';

interface Property {
    id: string;
    name: string;
    location: string;
    price: string;
    beds: number;
    baths: number;
    image: string;
}

const PROPERTIES: Property[] = [
    {
        id: 'horizon-peak',
        name: 'Horizon Peak Penthouse',
        location: 'Westlands Urban District',
        price: '85,000',
        beds: 3,
        baths: 2,
        image: 'https://images.unsplash.com/photo-1520603089958-2f0d9b7e5c6b?w=400&h=200&fit=crop',
    },
    {
        id: 'sapphire-lofts',
        name: 'Sapphire Smart Lofts',
        location: 'Riverside Node',
        price: '65,000',
        beds: 1,
        baths: 1,
        image: 'https://images.unsplash.com/photo-1554995207-c18c2036b1f3?w=400&h=200&fit=crop',
    },
    {
        id: 'marble-manor',
        name: 'Marble Garden Manor',
        location: 'Karen Heights',
        price: '120,000',
        beds: 5,
        baths: 4,
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0fd?w=400&h=200&fit=crop',
    },
];

export default function Search() {
    const [search, setSearch] = useState('');

    const filtered = PROPERTIES.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.location.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background p-lg">
            <div className="max-w-6xl mx-auto pt-20 pb-xl">
                <h1 className="font-display-lg text-center mb-12">Find Your Perfect Home</h1>
                
                <div className="relative mb-8 max-w-2xl mx-auto">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full p-md pl-12 rounded-lg border border-border bg-white"
                        placeholder="Search by location, property type..."
                    />
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-xl">
                    {filtered.map((p) => (
                        <Link key={p.id} to={`/properties/${p.id}`} className="glass-card rounded-xl overflow-hidden hover:scale-[1.02] transition-transform">
                            <img className="w-full h-48 object-cover" src={p.image} alt={p.name} />
                            <div className="p-lg">
                                <h3 className="font-headline-md mb-2">{p.name}</h3>
                                <p className="text-on-surface-variant text-body-md mb-4">{p.location}</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-4 text-sm">
                                        <span>{p.beds} bd</span>
                                        <span>{p.baths} ba</span>
                                    </div>
                                    <p className="font-headline-md text-primary">{p.price} USDC/mo</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}