import { ArrowDownLeft, ArrowUpRight, CircleDollarSign, Copy, ReceiptText, ShieldCheck, WalletCards } from 'lucide-react';
import { Sidebar, MobileNav } from '@/components/layout/Sidebar';

const tenantItems = [
    { icon: 'dashboard', label: 'Overview', href: '/tenant/dashboard' },
    { icon: 'home_work', label: 'Browse', href: '/search' },
    { icon: 'description', label: 'Applications', href: '/tenant/applications' },
    { icon: 'account_balance_wallet', label: 'Wallet', href: '/tenant/wallet', active: true },
    { icon: 'settings', label: 'Settings', href: '/settings' },
];

const transactions = [
    { type: 'Rent auto-release', date: 'May 5, 2026', amount: '-1,250.00 USDC', status: 'Executed', direction: 'out' },
    { type: 'Wallet top-up', date: 'May 1, 2026', amount: '+2,000.00 USDC', status: 'Confirmed', direction: 'in' },
    { type: 'Deposit lock', date: 'Apr 22, 2026', amount: '-2,500.00 USDC', status: 'Escrowed', direction: 'out' },
];

export default function TenantWallet() {
    return (
        <div className="min-h-screen bg-background md:pl-72">
            <Sidebar items={tenantItems} user={{ name: 'K. Mwangi', address: 'GC7...49W' }} />

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
                                        <p className="text-sm font-semibold text-white/70">Available balance</p>
                                        <p className="mt-2 text-5xl font-extrabold">2,450.00</p>
                                        <p className="mt-1 text-white/76">USDC on Stellar</p>
                                    </div>
                                    <WalletCards className="h-9 w-9 text-white/80" />
                                </div>
                                <div className="mt-8 flex flex-wrap gap-3">
                                    <button className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-primary transition hover:-translate-y-0.5">
                                        <ArrowDownLeft className="h-4 w-4" />
                                        Fund wallet
                                    </button>
                                    <button className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                                        <ArrowUpRight className="h-4 w-4" />
                                        Withdraw
                                    </button>
                                </div>
                            </div>
                            <div className="grid gap-4 p-5 md:grid-cols-3">
                                <div className="rounded-[8px] bg-muted p-4">
                                    <ShieldCheck className="mb-3 h-5 w-5 text-primary" />
                                    <p className="text-sm text-muted-foreground">Deposit escrow</p>
                                    <p className="text-xl font-bold">2,500 USDC</p>
                                </div>
                                <div className="rounded-[8px] bg-muted p-4">
                                    <CircleDollarSign className="mb-3 h-5 w-5 text-primary" />
                                    <p className="text-sm text-muted-foreground">Next rent</p>
                                    <p className="text-xl font-bold">1,250 USDC</p>
                                </div>
                                <div className="rounded-[8px] bg-muted p-4">
                                    <ReceiptText className="mb-3 h-5 w-5 text-primary" />
                                    <p className="text-sm text-muted-foreground">Receipts</p>
                                    <p className="text-xl font-bold">12 issued</p>
                                </div>
                            </div>
                        </div>

                        <div className="surface-card p-6">
                            <h2 className="text-2xl font-bold">Funding address</h2>
                            <div className="mt-5 rounded-[8px] bg-muted p-5">
                                <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-[8px] bg-white font-mono text-xs font-bold text-primary shadow-inner">
                                    QR
                                </div>
                                <div className="mt-5 flex items-center gap-2 rounded-full bg-white px-4 py-3">
                                    <span className="min-w-0 flex-1 truncate font-mono text-sm">GC7ND...49WNYUMBA</span>
                                    <button className="rounded-full bg-primary/10 p-2 text-primary" type="button">
                                        <Copy className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mt-8 surface-card p-6">
                        <div className="mb-6 flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold">Recent transactions</h2>
                                <p className="text-muted-foreground">Every line can link to Stellar Expert once backend hashes are attached.</p>
                            </div>
                            <button className="secondary-button hidden sm:inline-flex">Export</button>
                        </div>
                        <div className="divide-y divide-border">
                            {transactions.map((transaction) => (
                                <div key={`${transaction.type}-${transaction.date}`} className="grid gap-3 py-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${transaction.direction === 'in' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                                            {transaction.direction === 'in' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold">{transaction.type}</p>
                                            <p className="text-sm text-muted-foreground">{transaction.date}</p>
                                        </div>
                                    </div>
                                    <p className="font-mono font-bold">{transaction.amount}</p>
                                    <span className="w-fit rounded-full bg-muted px-3 py-1 text-sm font-bold text-primary">{transaction.status}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            <MobileNav items={tenantItems} />
        </div>
    );
}
