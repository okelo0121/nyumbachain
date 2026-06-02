export interface FeaturedProperty {
    id: string;
    title: string;
    neighborhood: string;
    city: string;
    country: string;
    price: number;
    deposit: number;
    beds: number;
    baths: number;
    sqm: number;
    rating: number;
    available: boolean;
    unitType: string;
    image: string;
    gallery: string[];
    coordinates: [number, number];
    amenities: string[];
    landlord: string;
    escrowState: 'ready' | 'funding' | 'active';
    description: string;
}

export const featuredProperties: FeaturedProperty[] = [
    {
        id: 'horizon-peak',
        title: 'Horizon Peak Penthouse',
        neighborhood: 'Westlands',
        city: 'Nairobi',
        country: 'Kenya',
        price: 1250,
        deposit: 2500,
        beds: 3,
        baths: 2,
        sqm: 126,
        rating: 4.96,
        available: true,
        unitType: '3 bed',
        image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80',
        ],
        coordinates: [-1.2647, 36.8029],
        amenities: ['Furnished', 'Fast Wi-Fi', 'Parking', 'Security'],
        landlord: 'Amani Homes',
        escrowState: 'ready',
        description:
            'A calm, light-filled penthouse designed for long stays, with automated rent escrow, transparent deposit protection, and walkable access to offices and restaurants.',
    },
    {
        id: 'sapphire-lofts',
        title: 'Sapphire Smart Lofts',
        neighborhood: 'Riverside',
        city: 'Nairobi',
        country: 'Kenya',
        price: 840,
        deposit: 1680,
        beds: 1,
        baths: 1,
        sqm: 58,
        rating: 4.88,
        available: true,
        unitType: '1 bed',
        image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=900&q=80',
        ],
        coordinates: [-1.2762, 36.7987],
        amenities: ['Gym', 'Backup power', 'Balcony', 'Concierge'],
        landlord: 'Sapphire Living',
        escrowState: 'active',
        description:
            'A compact serviced loft with warm finishes, reliable utilities, and a simple Stellar-backed payment plan that runs quietly in the background.',
    },
    {
        id: 'marble-manor',
        title: 'Marble Garden Manor',
        neighborhood: 'Karen',
        city: 'Nairobi',
        country: 'Kenya',
        price: 2100,
        deposit: 4200,
        beds: 5,
        baths: 4,
        sqm: 320,
        rating: 4.92,
        available: false,
        unitType: 'house',
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=80',
        ],
        coordinates: [-1.3192, 36.7073],
        amenities: ['Garden', 'Staff quarters', 'Solar', 'Private gate'],
        landlord: 'Marble Estates',
        escrowState: 'funding',
        description:
            'A generous family home with layered security, private gardens, and automated deposit release rules that make longer leases easier to trust.',
    },
    {
        id: 'acacia-courtyard',
        title: 'Acacia Courtyard Studio',
        neighborhood: 'Ntinda',
        city: 'Kampala',
        country: 'Uganda',
        price: 520,
        deposit: 1040,
        beds: 1,
        baths: 1,
        sqm: 42,
        rating: 4.84,
        available: true,
        unitType: 'studio',
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=900&q=80',
        ],
        coordinates: [0.3524, 32.6166],
        amenities: ['Water included', 'Security', 'Work desk', 'Transport access'],
        landlord: 'Acacia Rentals',
        escrowState: 'ready',
        description:
            'A bright studio near daily essentials, built for first-time renters who want clear pricing, verified receipts, and no awkward rent reminders.',
    },
];

export const formatUsdc = (value: number) =>
    new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
    }).format(value);
