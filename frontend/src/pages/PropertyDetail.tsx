import { Link } from 'react-router-dom';

export default function PropertyDetail() {
    return (
        <div className="min-h-screen bg-background p-lg">
            <div className="max-w-4xl mx-auto pt-20 pb-xl">
                <Link to="/search" className="text-primary font-label-sm flex items-center gap-1 mb-8 hover:underline">
                    <span className="material-symbols-outlined">chevron_left</span>
                    Back to Search
                </Link>

                <div className="glass-card rounded-xl overflow-hidden mb-8">
                    <img 
                        className="w-full h-64 md:h-96 object-cover" 
                        src="https://images.unsplash.com/photo-1520603089958-2f0d9b7e5c6b?w=800&h=600&fit=crop" 
                        alt="Property" 
                    />
                    
                    <div className="p-xl">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                            <div>
                                <h1 className="font-display-lg mb-2">Horizon Peak Penthouse</h1>
                                <p className="text-on-surface-variant">Westlands Urban District</p>
                            </div>
                            <div className="text-right mt-4 md:mt-0">
                                <p className="font-display-lg text-primary">85,000 USDC</p>
                                <p className="text-on-surface-variant text-body-md">~1,200 USD/mo</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="text-center p-4 bg-surface rounded-lg">
                                <p className="font-headline-md text-primary">3</p>
                                <p className="text-on-surface-variant text-label-sm">Bedrooms</p>
                            </div>
                            <div className="text-center p-4 bg-surface rounded-lg">
                                <p className="font-headline-md text-primary">2</p>
                                <p className="text-on-surface-variant text-label-sm">Bathrooms</p>
                            </div>
                            <div className="text-center p-4 bg-surface rounded-lg">
                                <p className="font-headline-md text-primary">1,200</p>
                                <p className="text-on-surface-variant text-label-sm">sqft</p>
                            </div>
                        </div>

                        <div className="border-t border-border pt-6 mb-6">
                            <h3 className="font-headline-md mb-4">Smart Contract</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-on-surface-variant">Contract Address</span>
                                    <span className="text-primary font-mono text-sm">C4B5...E9R2</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-on-surface-variant">Status</span>
                                    <span className="text-success">Active</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-on-surface-variant">Deposit Required</span>
                                    <span>2,000 USDC</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button className="flex-1 bg-primary-container text-on-primary-container py-md rounded-lg font-button-text hover:brightness-110">
                                Apply to Rent
                            </button>
                            <button className="px-6 border border-border rounded-lg font-button-text hover:bg-surface">
                                Save Property
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}