import { useState } from 'react';
import { CheckCircle2, Clock, FileText, XCircle, X } from 'lucide-react';
import { Sidebar, MobileNav } from '@/components/layout/Sidebar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

const landlordItems = [
    { icon: 'dashboard', label: 'Overview', href: '/landlord/dashboard' },
    { icon: 'home_work', label: 'Properties', href: '/landlord/properties' },
    { icon: 'add', label: 'Add Property', href: '/landlord/properties/new' },
    { icon: 'description', label: 'Applications', href: '/landlord/applications', active: true },
    { icon: 'people', label: 'Tenants', href: '/landlord/tenants' },
    { icon: 'settings', label: 'Settings', href: '/settings' },
];

interface ApprovalForm {
    monthly_rent_usdc: string;
    deposit_usdc: string;
    payment_day: string;
    start_date: string;
}

export default function LandlordApplications() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [form, setForm] = useState<ApprovalForm>({
        monthly_rent_usdc: '',
        deposit_usdc: '',
        payment_day: '1',
        start_date: new Date().toISOString().split('T')[0],
    });

    const formattedWallet = user?.stellar_wallet
        ? `${user.stellar_wallet.slice(0, 6)}...${user.stellar_wallet.slice(-6)}`
        : 'No wallet';

    const { data: applications, isLoading } = useQuery({
        queryKey: ['incomingApplications', user?.id],
        queryFn: () => api.get('/applications/incoming').then((res) => res.data),
        enabled: !!user?.id,
    });

    const approveMutation = useMutation({
        mutationFn: ({ appId, body }: { appId: string; body: object }) =>
            api.put(`/applications/${appId}/approve`, body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incomingApplications'] });
            setSelectedApp(null);
        },
    });

    const rejectMutation = useMutation({
        mutationFn: (appId: string) => api.put(`/applications/${appId}/reject`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incomingApplications'] });
        },
    });

    const openApprovalModal = (application: any) => {
        setSelectedApp(application);
        setForm({
            monthly_rent_usdc: String(application.unit?.monthly_rent_usdc ?? ''),
            deposit_usdc: String(application.unit?.deposit_usdc ?? ''),
            payment_day: '1',
            start_date: new Date().toISOString().split('T')[0],
        });
    };

    const handleApprove = () => {
        if (!selectedApp) return;
        approveMutation.mutate({
            appId: selectedApp.id,
            body: {
                monthly_rent_usdc: parseFloat(form.monthly_rent_usdc),
                deposit_usdc: parseFloat(form.deposit_usdc),
                payment_day: parseInt(form.payment_day),
                start_date: form.start_date,
            },
        });
    };

    const incomingApps = applications || [];

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm font-semibold text-muted-foreground">Loading applications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background md:pl-72">
            <Sidebar items={landlordItems} user={{ name: user?.full_name || 'Landlord', address: formattedWallet }} />

            <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <header className="mb-8">
                        <p className="section-kicker">Tenant pipeline</p>
                        <h1 className="dashboard-title mt-3">Applications</h1>
                        <p className="mt-2 max-w-2xl text-muted-foreground">Review tenant intent, wallet readiness, deposit state, and unit fit before approving a lease.</p>
                    </header>

                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                        <section className="space-y-4">
                            {incomingApps.length === 0 ? (
                                <div className="surface-card flex flex-col items-center justify-center py-20 text-center">
                                    <FileText className="mb-4 h-12 w-12 text-muted-foreground/60" />
                                    <h3 className="text-lg font-bold">No applications yet</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">When tenants apply to your listed units, they will show up here.</p>
                                </div>
                            ) : (
                                incomingApps.map((application: any) => {
                                    const tenantName = application.tenant?.full_name || 'Anonymous Tenant';
                                    const kycStatus = application.tenant?.kyc_verified ? 'KYC Verified' : 'Standard Profile';
                                    const propertyTitle = application.unit?.property?.title || 'Unknown Property';
                                    const propertyImage = application.unit?.property?.photos?.[0] || 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80';
                                    const createdDate = new Date(application.createdAt || application.created_at).toLocaleDateString(undefined, {
                                        month: 'short', day: 'numeric', year: 'numeric',
                                    });
                                    const isPending = application.status === 'pending';

                                    return (
                                        <article key={application.id} className="surface-card p-5">
                                            <div className="grid gap-5 md:grid-cols-[112px_1fr_auto] md:items-center">
                                                <img src={propertyImage} alt={propertyTitle} className="h-28 w-full rounded-[8px] object-cover md:w-28" />
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h2 className="text-xl font-bold">{tenantName}</h2>
                                                        <span className="rounded-full bg-secondary/20 px-3 py-1 text-xs font-bold text-primary">{kycStatus}</span>
                                                    </div>
                                                    <p className="mt-1 text-muted-foreground">{propertyTitle} — Unit {application.unit?.unit_number || '#'}</p>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Listed rent: <span className="font-semibold text-foreground">{application.unit?.monthly_rent_usdc} USDC/mo</span>
                                                        {' · '}Deposit: <span className="font-semibold text-foreground">{application.unit?.deposit_usdc} USDC</span>
                                                    </p>
                                                    <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                                        <Clock className="h-4 w-4" />
                                                        <span className="capitalize">{application.status}</span> · Applied {createdDate}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col gap-2 md:w-40">
                                                    {isPending ? (
                                                        <>
                                                            <button
                                                                onClick={() => openApprovalModal(application)}
                                                                disabled={rejectMutation.isPending}
                                                                className="primary-button py-2 text-xs"
                                                            >
                                                                <CheckCircle2 className="h-4 w-4" />
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => rejectMutation.mutate(application.id)}
                                                                disabled={rejectMutation.isPending}
                                                                className="secondary-button py-2 text-xs text-error hover:bg-error/10 hover:text-error"
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                                {rejectMutation.isPending ? 'Rejecting...' : 'Decline'}
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="text-center text-sm font-bold text-muted-foreground capitalize bg-muted p-2 rounded-[8px]">
                                                            {application.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })
                            )}
                        </section>

                        <aside className="surface-card h-fit p-6">
                            <FileText className="mb-5 h-8 w-8 text-primary" />
                            <h2 className="text-xl font-bold">Approval checklist</h2>
                            <div className="mt-5 space-y-3 text-sm">
                                {['Tenant identity verified', 'Wallet can fund deposit', 'Lease dates confirmed', 'Email receipt enabled'].map((item) => (
                                    <div key={item} className="flex items-center gap-3 rounded-[8px] bg-muted p-3">
                                        <CheckCircle2 className="h-4 w-4 text-success" />
                                        <span className="font-semibold">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            <MobileNav items={landlordItems} />

            {/* Approval Modal */}
            {selectedApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="surface-card w-full max-w-md p-6">
                        <div className="mb-6 flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-bold">Confirm Lease Terms</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    For {selectedApp.tenant?.full_name} — {selectedApp.unit?.property?.title}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedApp(null)}
                                className="rounded-[8px] p-1 hover:bg-muted"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <label className="block">
                                <span className="mb-2 block text-sm font-bold">Monthly Rent (USDC)</span>
                                <input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    className="field"
                                    value={form.monthly_rent_usdc}
                                    onChange={(e) => setForm((f) => ({ ...f, monthly_rent_usdc: e.target.value }))}
                                    placeholder="e.g. 500"
                                />
                                <span className="mt-1 block text-xs text-muted-foreground">Listed default: {selectedApp.unit?.monthly_rent_usdc} USDC</span>
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-bold">Security Deposit (USDC)</span>
                                <input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    className="field"
                                    value={form.deposit_usdc}
                                    onChange={(e) => setForm((f) => ({ ...f, deposit_usdc: e.target.value }))}
                                    placeholder="e.g. 1000"
                                />
                                <span className="mt-1 block text-xs text-muted-foreground">Listed default: {selectedApp.unit?.deposit_usdc} USDC</span>
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-bold">Payment Day of Month</span>
                                <select
                                    className="field"
                                    value={form.payment_day}
                                    onChange={(e) => setForm((f) => ({ ...f, payment_day: e.target.value }))}
                                >
                                    {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                                        <option key={d} value={d}>Day {d}</option>
                                    ))}
                                </select>
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-bold">Lease Start Date</span>
                                <input
                                    type="date"
                                    className="field"
                                    value={form.start_date}
                                    onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                                />
                            </label>
                        </div>

                        <div className="mt-4 rounded-[8px] bg-muted p-3 text-xs text-muted-foreground">
                            These values are written into the Soroban escrow contract on-chain and cannot be changed after approval.
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setSelectedApp(null)}
                                className="secondary-button flex-1"
                                disabled={approveMutation.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={approveMutation.isPending || !form.monthly_rent_usdc || !form.deposit_usdc}
                                className="primary-button flex-1"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                {approveMutation.isPending ? 'Deploying contract...' : 'Approve & Deploy'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
