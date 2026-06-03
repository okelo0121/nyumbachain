import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, CheckCircle2, MapPin, ShieldCheck, Upload } from 'lucide-react';
import { Sidebar, MobileNav } from '@/components/layout/Sidebar';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';


const landlordItems = [
    { icon: 'dashboard', label: 'Overview', href: '/landlord/dashboard' },
    { icon: 'home_work', label: 'Properties', href: '/landlord/properties' },
    { icon: 'add', label: 'Add Property', href: '/landlord/properties/new', active: true },
    { icon: 'description', label: 'Applications', href: '/landlord/applications' },
    { icon: 'people', label: 'Tenants', href: '/landlord/tenants' },
    { icon: 'settings', label: 'Settings', href: '/settings' },
];

export default function NewProperty() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useAuthStore();
    const formattedWallet = user?.stellar_wallet 
        ? `${user.stellar_wallet.slice(0, 6)}...${user.stellar_wallet.slice(-6)}` 
        : 'No wallet';


    const [title, setTitle] = useState('');
    const [propertyType, setPropertyType] = useState('apartment');
    const [description, setDescription] = useState('');
    const [city, setCity] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [monthlyRent, setMonthlyRent] = useState('');
    const [deposit, setDeposit] = useState('');
    const [bedrooms, setBedrooms] = useState('1');
    const [bathrooms, setBathrooms] = useState('1');
    
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    const handlePublish = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // 1. Create property and default unit in a single request
            const payload = {
                title,
                property_type: propertyType.toLowerCase(),
                description,
                city,
                neighborhood,
                monthly_rent_usdc: Number(monthlyRent),
                deposit_usdc: Number(deposit),
                bedrooms: Number(bedrooms),
                bathrooms: Number(bathrooms),
            };

            const res = await api.post('/properties', payload);
            const createdProperty = res.data;

            // 2. Upload images if selected
            if (selectedFiles.length > 0) {
                const formData = new FormData();
                selectedFiles.forEach((file) => {
                    formData.append('photos', file);
                });

                await api.post(`/properties/${createdProperty.id}/photos`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            // 3. Redirect to landlord properties view
            navigate('/landlord/properties');
        } catch (err: any) {
            console.error('Publish error:', err);
            setError(err.response?.data?.error || 'Failed to list property.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background md:pl-72">
            <Sidebar items={landlordItems} user={{ name: user?.full_name || 'Landlord', address: formattedWallet }} />

            <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <section>
                        <p className="section-kicker">List a home</p>
                        <h1 className="dashboard-title mt-3">Create a listing that feels ready to book.</h1>
                        <p className="mt-2 max-w-2xl text-muted-foreground">Capture the essentials tenants expect: photos, location, unit details, rent, deposit, and escrow terms.</p>

                        {error && (
                            <div className="mt-4 rounded-[8px] bg-destructive/10 p-3 text-sm font-semibold text-destructive">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handlePublish} className="mt-8 space-y-6">
                            <div className="surface-card p-6">
                                <h2 className="text-2xl font-bold">Property basics</h2>
                                <div className="mt-5 grid gap-4 md:grid-cols-2">
                                    <label>
                                        <span className="mb-2 block text-sm font-bold">Property title</span>
                                        <input 
                                            className="field rounded-[8px]" 
                                            placeholder="Horizon Peak Penthouse" 
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                        />
                                    </label>
                                    <label>
                                        <span className="mb-2 block text-sm font-bold">Property type</span>
                                        <select 
                                            className="field rounded-[8px]"
                                            value={propertyType}
                                            onChange={(e) => setPropertyType(e.target.value)}
                                        >
                                            <option value="apartment">Apartment</option>
                                            <option value="house">House</option>
                                            <option value="studio">Studio</option>
                                            <option value="bedsitter">Bedsitter</option>
                                        </select>
                                    </label>
                                    <label className="md:col-span-2">
                                        <span className="mb-2 block text-sm font-bold">Description</span>
                                        <textarea 
                                            className="field min-h-32 rounded-[8px]" 
                                            placeholder="Describe the home, neighborhood, utilities, and lease expectations." 
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="surface-card p-6">
                                <h2 className="text-2xl font-bold">Location and unit terms</h2>
                                <div className="mt-5 grid gap-4 md:grid-cols-2">
                                    <label>
                                        <span className="mb-2 block text-sm font-bold">City</span>
                                        <input 
                                            className="field rounded-[8px]" 
                                            placeholder="Kampala" 
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            required
                                        />
                                    </label>
                                    <label>
                                        <span className="mb-2 block text-sm font-bold">Neighborhood</span>
                                        <input 
                                            className="field rounded-[8px]" 
                                            placeholder="Ntinda" 
                                            value={neighborhood}
                                            onChange={(e) => setNeighborhood(e.target.value)}
                                            required
                                        />
                                    </label>
                                    <label>
                                        <span className="mb-2 block text-sm font-bold">Monthly rent (USDC)</span>
                                        <input 
                                            className="field rounded-[8px]" 
                                            placeholder="850" 
                                            type="number" 
                                            value={monthlyRent}
                                            onChange={(e) => setMonthlyRent(e.target.value)}
                                            required
                                        />
                                    </label>
                                    <label>
                                        <span className="mb-2 block text-sm font-bold">Deposit (USDC)</span>
                                        <input 
                                            className="field rounded-[8px]" 
                                            placeholder="1700" 
                                            type="number" 
                                            value={deposit}
                                            onChange={(e) => setDeposit(e.target.value)}
                                            required
                                        />
                                    </label>
                                    <label>
                                        <span className="mb-2 block text-sm font-bold">Bedrooms</span>
                                        <input 
                                            className="field rounded-[8px]" 
                                            placeholder="2" 
                                            type="number" 
                                            value={bedrooms}
                                            onChange={(e) => setBedrooms(e.target.value)}
                                            required
                                        />
                                    </label>
                                    <label>
                                        <span className="mb-2 block text-sm font-bold">Bathrooms</span>
                                        <input 
                                            className="field rounded-[8px]" 
                                            placeholder="2" 
                                            type="number" 
                                            value={bathrooms}
                                            onChange={(e) => setBathrooms(e.target.value)}
                                            required
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="surface-card p-6">
                                <h2 className="text-2xl font-bold">Photos</h2>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-5 rounded-[8px] border border-dashed border-primary/30 bg-primary/5 p-8 text-center cursor-pointer hover:bg-primary/10 transition"
                                >
                                    <Camera className="mx-auto h-10 w-10 text-primary" />
                                    <p className="mt-3 font-bold">Upload bright, high-resolution property photos</p>
                                    {selectedFiles.length > 0 ? (
                                        <p className="mt-1 text-sm font-semibold text-primary">{selectedFiles.length} file(s) selected</p>
                                    ) : (
                                        <p className="mt-1 text-sm text-muted-foreground">Photos are uploaded securely to Cloudinary.</p>
                                    )}
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileChange}
                                        multiple 
                                        accept="image/*" 
                                        className="hidden" 
                                    />
                                    <button className="secondary-button mt-5" type="button">
                                        <Upload className="h-4 w-4" />
                                        Choose images
                                    </button>
                                </div>
                            </div>

                            <button className="primary-button" type="submit" disabled={loading}>
                                {loading ? 'Publishing listing...' : 'Publish property'}
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
