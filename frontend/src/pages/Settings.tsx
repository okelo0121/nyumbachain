import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Wallet, Bell, Mail, Phone, LogOut } from 'lucide-react';
import { Sidebar, MobileNav } from '@/components/layout/Sidebar';
import { useAuthStore } from '@/stores/authStore';

const landlordItems = [
    { icon: 'dashboard', label: 'Overview', href: '/landlord/dashboard' },
    { icon: 'home_work', label: 'Properties', href: '/landlord/properties' },
    { icon: 'add', label: 'Add Property', href: '/landlord/properties/new' },
    { icon: 'description', label: 'Applications', href: '/landlord/applications' },
    { icon: 'people', label: 'Tenants', href: '/landlord/tenants' },
    { icon: 'settings', label: 'Settings', href: '/settings', active: true },
];

const tenantItems = [
    { icon: 'dashboard', label: 'Overview', href: '/tenant/dashboard' },
    { icon: 'home_work', label: 'Browse', href: '/search' },
    { icon: 'description', label: 'Applications', href: '/tenant/applications' },
    { icon: 'account_balance_wallet', label: 'Wallet', href: '/tenant/wallet' },
    { icon: 'settings', label: 'Settings', href: '/settings', active: true },
];

export default function Settings() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const isLandlord = user?.role === 'landlord';
    const sidebarItems = isLandlord ? landlordItems : tenantItems;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const formattedWallet = user?.stellar_wallet 
        ? `${user.stellar_wallet.slice(0, 6)}...${user.stellar_wallet.slice(-6)}` 
        : 'No wallet';

    const [emailAlerts, setEmailAlerts] = useState(true);
    const [stellarAlerts, setStellarAlerts] = useState(true);

    return (
        <div className="min-h-screen bg-background md:pl-72">
            <Sidebar items={sidebarItems} user={{ name: user?.full_name || 'User', address: formattedWallet }} />

            <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    <header className="mb-8">
                        <p className="section-kicker">Preferences</p>
                        <h1 className="dashboard-title mt-3">Settings</h1>
                        <p className="mt-2 text-muted-foreground">Manage your profile, active Stellar credentials, and platform notifications.</p>
                    </header>

                    <div className="space-y-6">
                        {/* Profile Section */}
                        <section className="surface-card p-6">
                            <div className="flex items-center gap-3 border-b border-border pb-4">
                                <User className="h-5 w-5 text-primary" />
                                <h2 className="text-xl font-bold">Profile Details</h2>
                            </div>
                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Full Name</label>
                                    <div className="flex items-center gap-3 rounded-[8px] bg-muted px-4 py-3 font-semibold text-foreground">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        {user?.full_name || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Account Role</label>
                                    <div className="flex items-center gap-3 rounded-[8px] bg-muted px-4 py-3 font-semibold text-foreground capitalize">
                                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                        {user?.role || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Email Address</label>
                                    <div className="flex items-center gap-3 rounded-[8px] bg-muted px-4 py-3 font-semibold text-foreground">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        {user?.email || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Phone Number</label>
                                    <div className="flex items-center gap-3 rounded-[8px] bg-muted px-4 py-3 font-semibold text-foreground">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        {user?.phone || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Stellar Wallet Config */}
                        <section className="surface-card p-6">
                            <div className="flex items-center gap-3 border-b border-border pb-4">
                                <Wallet className="h-5 w-5 text-primary" />
                                <h2 className="text-xl font-bold">Stellar Cryptographic Wallet</h2>
                            </div>
                            <div className="mt-5 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Stellar Public Key</label>
                                    <div className="rounded-[8px] bg-muted px-4 py-3 font-mono text-xs text-foreground break-all select-all">
                                        {user?.stellar_wallet || 'No wallet created.'}
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">All escrow transactions and monthly rent payments are tied to this public identifier on the Stellar network.</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Wallet Provider</label>
                                    <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary capitalize">
                                        Custodial (Encrypted Backend Node)
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Notifications */}
                        <section className="surface-card p-6">
                            <div className="flex items-center gap-3 border-b border-border pb-4">
                                <Bell className="h-5 w-5 text-primary" />
                                <h2 className="text-xl font-bold">Preferences</h2>
                            </div>
                            <div className="mt-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold">Email Notifications</p>
                                        <p className="text-xs text-muted-foreground">Receive real-time email updates for lease approvals and payment status changes.</p>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={emailAlerts}
                                        onChange={() => setEmailAlerts(!emailAlerts)}
                                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold">Stellar Horizon Alerts</p>
                                        <p className="text-xs text-muted-foreground">Trigger toast alerts for on-chain events on Stellar Testnet.</p>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={stellarAlerts}
                                        onChange={() => setStellarAlerts(!stellarAlerts)}
                                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Account Actions */}
                        <section className="surface-card p-6 border border-error/20 bg-error/5">
                            <div className="flex items-center gap-3 border-b border-error/10 pb-4">
                                <LogOut className="h-5 w-5 text-error" />
                                <h2 className="text-xl font-bold text-error">Account Actions</h2>
                            </div>
                            <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <p className="font-bold text-foreground">Sign out of your account</p>
                                    <p className="text-xs text-muted-foreground">This will end your session on this device and return you to the homepage.</p>
                                </div>
                                <button 
                                    onClick={handleLogout}
                                    className="flex items-center justify-center gap-2 rounded-full border border-border bg-white hover:bg-error/5 hover:border-error/30 text-error px-6 py-2.5 text-sm font-bold shadow-sm transition-all"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Log out
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <MobileNav items={sidebarItems} />
        </div>
    );
}
