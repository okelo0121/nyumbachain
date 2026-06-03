import { CheckCircle2, Clock, FileText, XCircle } from 'lucide-react';
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

export default function LandlordApplications() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const formattedWallet = user?.stellar_wallet 
        ? `${user.stellar_wallet.slice(0, 6)}...${user.stellar_wallet.slice(-6)}` 
        : 'No wallet';

    // 1. Fetch incoming applications
    const { data: applications, isLoading } = useQuery({
        queryKey: ['incomingApplications', user?.id],
        queryFn: () => api.get('/applications/incoming').then((res) => res.data),
        enabled: !!user?.id,
    });

    // 2. Mutations for application review
    const approveMutation = useMutation({
        mutationFn: (appId: string) => api.put(`/applications/${appId}/approve`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incomingApplications'] });
        },
    });

    const rejectMutation = useMutation({
        mutationFn: (appId: string) => api.put(`/applications/${appId}/reject`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incomingApplications'] });
        },
    });

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
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
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
                                                    <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                                        <Clock className="h-4 w-4" />
                                                        <span className="capitalize">{application.status}</span> · Applied {createdDate}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col gap-2 md:w-40">
                                                    {isPending ? (
                                                        <>
                                                            <button 
                                                                onClick={() => approveMutation.mutate(application.id)}
                                                                disabled={approveMutation.isPending || rejectMutation.isPending}
                                                                className="primary-button py-2 text-xs"
                                                            >
                                                                <CheckCircle2 className="h-4 w-4" />
                                                                {approveMutation.isPending ? 'Approving...' : 'Approve'}
                                                            </button>
                                                            <button 
                                                                onClick={() => rejectMutation.mutate(application.id)}
                                                                disabled={approveMutation.isPending || rejectMutation.isPending}
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
        </div>
    );
}
