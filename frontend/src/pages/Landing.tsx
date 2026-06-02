import { useEffect } from 'react';
import { Link } from 'react-router-dom';

interface NavLink {
    label: string;
    href: string;
}

const NAV_LINKS: NavLink[] = [
    { label: 'Features', href: '#features' },
    { label: 'Properties', href: '/search' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Contact', href: '#contact' },
];

const STATS = [
    { value: '500+', label: 'Properties Managed' },
    { value: '2,000+', label: 'Happy Tenants' },
    { value: '$500K', label: 'USDC Processed' },
    { value: '99.9%', label: 'Payment Success' },
];

const STEPS = [
    { number: 1, title: 'List Property', description: 'Add your property with details and pricing.' },
    { number: 2, title: 'Tenant Applies', description: 'Tenants submit applications with their details.' },
    { number: 3, title: 'Escrow Created', description: 'Smart contract locks deposit securely on-chain.' },
    { number: 4, title: 'Rent Paid', description: 'Monthly rent is automatically collected via Stellar.' },
    { number: 5, title: 'Deposit Returned', description: 'Security deposit is returned at lease end.' },
];

function GradientText({ children }: { children: React.ReactNode }) {
    return <span className="gradient-text">{children}</span>;
}

export default function Landing() {
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .material-symbols-outlined { font-family: 'Material Symbols Outlined'; font-weight: normal; font-style: normal; }
            .gradient-text { background: linear-gradient(90deg, #6D28D9, #7C3AED); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        `;
        document.head.appendChild(style);
        return (): void => { document.head.removeChild(style); };
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <nav className="fixed top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-border h-20 flex items-center shadow-sm">
                <div className="flex justify-between items-center w-full px-lg max-w-container-max mx-auto">
                    <Link to="/" className="font-headline-md font-bold text-foreground">
                        NyumbaChain
                    </Link>
                    <div className="hidden md:flex gap-xl items-center">
                        {NAV_LINKS.map((link) => (
                            <Link key={link.label} to={link.href} className="text-on-surface-variant hover:text-primary transition-colors">
                                {link.label}
                            </Link>
                        ))}
                    </div>
                    <div className="flex items-center gap-md">
                        <Link to="/auth/login" className="text-primary font-button-text hover:underline">Sign In</Link>
                        <Link to="/auth/register" className="bg-primary-container text-on-primary-container px-lg py-sm rounded-lg font-button-text shadow-sm hover:shadow-md transition-shadow">Get Started</Link>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-2xl px-lg max-w-container-max mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="font-display-lg md:text-display-lg mb-6 text-foreground">
                        Rental Management <GradientText>Powered By Blockchain</GradientText>
                    </h1>
                    <p className="font-body-lg text-on-surface-variant mb-8">
                        Automate rent collection, secure tenant deposits, and manage properties with Stellar-powered smart contracts.
                    </p>
                    <div className="flex justify-center gap-md">
                        <Link to="/search" className="bg-primary-container text-on-primary-container px-xl py-md rounded-lg font-button-text shadow-sm hover:shadow-md transition-shadow">Find Property</Link>
                        <Link to="/auth/register" className="bg-surface text-foreground px-xl py-md rounded-lg font-button-text shadow-sm hover:shadow-md transition-shadow">Become a Landlord</Link>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-lg mb-20">
                    {STATS.map((stat) => (
                        <div key={stat.label} className="card card-shadow-sm p-lg text-center">
                            <h3 className="font-display-lg text-primary mb-2">{stat.value}</h3>
                            <p className="text-on-surface-variant font-label-sm">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="card card-shadow-xl p-xl max-w-4xl mx-auto">
                    <h2 className="font-headline-md text-center mb-12">How It Works</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-xl">
                        {STEPS.map((step) => (
                            <div key={step.number} className="text-center">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mx-auto mb-4 shadow-sm">
                                    {step.number}
                                </div>
                                <h4 className="font-headline-md mb-2">{step.title}</h4>
                                <p className="text-on-surface-variant text-body-md">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <footer className="bg-surface pt-16 pb-8">
                <div className="max-w-container-max mx-auto px-lg">
                    <div className="grid md:grid-cols-4 gap-xl mb-8">
                        <div>
                            <h4 className="font-headline-md text-primary mb-4">NyumbaChain</h4>
                            <p className="text-on-surface-variant text-body-md">Blockchain rental management for Africa.</p>
                        </div>
                        <div>
                            <h5 className="font-button-text mb-4">Product</h5>
                            <div className="space-y-2">
                                <Link className="block text-on-surface-variant hover:text-primary" to="/search">Search Properties</Link>
                                <Link className="block text-on-surface-variant hover:text-primary" to="/auth/login">Dashboard</Link>
                                <Link className="block text-on-surface-variant hover:text-primary" to="/auth/register">Become a Landlord</Link>
                            </div>
                        </div>
                        <div>
                            <h5 className="font-button-text mb-4">Company</h5>
                            <div className="space-y-2">
                                <Link className="block text-on-surface-variant hover:text-primary" to="#">About</Link>
                                <Link className="block text-on-surface-variant hover:text-primary" to="#">Careers</Link>
                                <Link className="block text-on-surface-variant hover:text-primary" to="#">Contact</Link>
                            </div>
                        </div>
                        <div>
                            <h5 className="font-button-text mb-4">Legal</h5>
                            <div className="space-y-2">
                                <Link className="block text-on-surface-variant hover:text-primary" to="#">Privacy</Link>
                                <Link className="block text-on-surface-variant hover:text-primary" to="#">Terms</Link>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-border pt-8 text-center text-on-surface-variant">
                        © 2024 NyumbaChain. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}