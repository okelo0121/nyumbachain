import { ArrowDownLeft, ArrowUpRight, CircleDollarSign, Copy, ReceiptText, ShieldCheck, WalletCards } from 'lucide-react';
import { Sidebar, MobileNav } from '@/components/layout/Sidebar';
import { useAuthStore } from '@/stores/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { formatUsdc } from '@/data/properties';
import axios from 'axios';
import { useState } from 'react';

const tenantItems = [
    { icon: 'dashboard', label: 'Overview', href: '/tenant/dashboard' },
    { icon: 'home_work', label: 'Browse', href: '/search' },
    { icon: 'description', label: 'Applications', href: '/tenant/applications' },
    { icon: 'account_balance_wallet', label: 'Wallet', href: '/tenant/wallet', active: true },
    { icon: 'settings', label: 'Settings', href: '/settings' },
];

export default function TenantWallet() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [copied, setCopied] = useState(false);
    const [fundingError, setFundingError] = useState<string | null>(null);

    const formattedWallet = user?.stellar_wallet 
        ? `${user.stellar_wallet.slice(0, 6)}...${user.stellar_wallet.slice(-6)}` 
        : 'No wallet';

    // 1. Fetch active tenancy
    const { data: tenancyData } = useQuery({
        queryKey: ['myTenancy'],
        queryFn: () => api.get('/tenancies/mine').then((res) => res.data).catch(err => {
            if (err.response?.status === 404) return null;
            throw err;
        }),
        retry: false,
    });

    const tenancy = tenancyData?.tenancy;

    // 2. Fetch escrow contract balance
    const { data: balanceData } = useQuery({
        queryKey: ['escrowBalance', tenancy?.id],
        queryFn: () => api.get(`/tenancies/${tenancy.id}/balance`).then((res) => res.data),
        enabled: !!tenancy?.id,
        retry: false,
    });

    // 3. Fetch payment/transaction history from backend
    const { data: payments } = useQuery({
        queryKey: ['payments', tenancy?.id],
        queryFn: () => api.get(`/tenancies/${tenancy.id}/payments`).then((res) => res.data),
        enabled: !!tenancy?.id,
    });

    // 4. Fetch real account details from Stellar Testnet Horizon
    const { data: horizonAccount } = useQuery({
        queryKey: ['stellarAccount', user?.stellar_wallet],
        queryFn: () => 
            user?.stellar_wallet 
                ? axios.get(`https://horizon-testnet.stellar.org/accounts/${user.stellar_wallet}`).then((res) => res.data)
                : Promise.resolve(null),
        enabled: !!user?.stellar_wallet,
        retry: false,
    });

    // 5. Friendbot funding mutation (for development and testnet activation)
    const fundMutation = useMutation({
        mutationFn: async () => {
            if (!user?.stellar_wallet) return;
            setFundingError(null);
            await axios.get(`https://friendbot.stellar.org/?addr=${user.stellar_wallet}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stellarAccount'] });
        },
        onError: (err: any) => {
            console.error('Funding failed:', err);
            setFundingError('Failed to contact Stellar Friendbot. Please try again later.');
        }
    });

    const handleCopy = () => {
        if (user?.stellar_wallet) {
            navigator.clipboard.writeText(user.stellar_wallet);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Extract balances
    const balances = horizonAccount?.balances || [];
    const xlmBalance = balances.find((b: any) => b.asset_type === 'native')?.balance || '0.0000000';

    return (
        <div className="min-h-screen bg-background md:pl-72">
            <Sidebar items={tenantItems} user={{ name: user?.full_name || 'Tenant', address: formattedWallet }} />

            <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <header className="mb-8">
                        <p className="section-kicker">Payments</p>
                        <h1 className="dashboard-title mt-3">Wallet</h1>
                        <p className="mt-2 max-w-2xl text-muted-foreground">Fund rent, view escrow balances, and verify every payment without needing to read blockchain tooling.</p>
                    </header>

                    <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                        <div className="surface-card overflow-hidden">
                            <div className="bg-primary p-6 text-white">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-semibold text-white/70">Custodial account balance</p>
                                        <p className="mt-2 text-5xl font-extrabold">{parseFloat(xlmBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        <p className="mt-1 text-white/76">XLM (Testnet XLM)</p>
                                    </div>
                                    <WalletCards className="h-9 w-9 text-white/80" />
                                </div>
                                <div className="mt-8 flex flex-wrap gap-3">
                                    <button 
                                        onClick={() => fundMutation.mutate()}
                                        disabled={fundMutation.isPending}
                                        className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-primary transition hover:-translate-y-0.5 disabled:opacity-50"
                                    >
                                        <ArrowDownLeft className="h-4 w-4" />
                                        {fundMutation.isPending ? 'Funding (Friendbot)...' : 'Fund Testnet Wallet'}
                                    </button>
                                </div>
                                {fundingError && (
                                    <p className="mt-2 text-xs font-semibold text-destructive">{fundingError}</p>
                                )}
                            </div>
                            <div className="grid gap-4 p-5 md:grid-cols-3">
                                <div className="rounded-[8px] bg-muted p-4">
                                    <ShieldCheck className="mb-3 h-5 w-5 text-primary" />
                                    <p className="text-sm text-muted-foreground">Deposit escrow</p>
                                    <p className="text-xl font-bold">
                                        {balanceData ? `${formatUsdc(balanceData.balanceUsdc)} USDC` : (tenancy ? `${formatUsdc(tenancy.deposit_usdc)} USDC` : '0 USDC')}
                                    </p>
                                </div>
                                <div className="rounded-[8px] bg-muted p-4">
                                    <CircleDollarSign className="mb-3 h-5 w-5 text-primary" />
                                    <p className="text-sm text-muted-foreground">Next rent</p>
                                    <p className="text-xl font-bold">
                                        {tenancy ? `${formatUsdc(tenancy.monthly_rent_usdc)} USDC` : '0 USDC'}
                                    </p>
                                </div>
                                <div className="rounded-[8px] bg-muted p-4">
                                    <ReceiptText className="mb-3 h-5 w-5 text-primary" />
                                    <p className="text-sm text-muted-foreground">Payments</p>
                                    <p className="text-xl font-bold">
                                        {payments ? `${payments.length} settled` : '0 settled'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="surface-card p-6">
                            <h2 className="text-2xl font-bold">Funding address</h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Transfer testnet funds to this custodial wallet address to fund your rent payments.
                            </p>
                            <div className="mt-5 rounded-[8px] bg-muted p-5">
                                <div className="mt-5 flex items-center gap-2 rounded-full bg-white px-4 py-3">
                                    <span className="min-w-0 flex-1 truncate font-mono text-xs">
                                        {user?.stellar_wallet || 'Generating wallet...'}
                                    </span>
                                    <button 
                                        onClick={handleCopy}
                                        className="rounded-full bg-primary/10 p-2 text-primary hover:bg-primary/20" 
                                        type="button"
                                        title="Copy wallet address"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </button>
                                </div>
                                {copied && (
                                    <p className="mt-2 text-center text-xs font-semibold text-success">Address copied!</p>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="mt-8 surface-card p-6">
                        <div className="mb-6 flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold">Recent transactions</h2>
                                <p className="text-muted-foreground">Immutable payment and escrow records from the database.</p>
                            </div>
                        </div>
                        <div className="divide-y divide-border">
                            {payments && payments.length > 0 ? (
                                payments.map((payment: any) => (
                                    <div key={payment.id} className="grid gap-3 py-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary`}>
                                                <ArrowUpRight className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold capitalize">{payment.payment_type} payment</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(payment.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="font-mono font-bold">-{formatUsdc(payment.amount_usdc)} USDC</p>
                                        <span className="w-fit rounded-full bg-muted px-3 py-1 text-sm font-bold text-primary capitalize">{payment.status}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-muted-foreground">
                                    No transaction history recorded yet.
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>

            <MobileNav items={tenantItems} />
        </div>
    );
}
