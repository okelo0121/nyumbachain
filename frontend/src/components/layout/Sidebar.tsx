import { Link, useNavigate } from 'react-router-dom';
import {
    BarChart3,
    FileText,
    Home,
    HomeIcon,
    LucideIcon,
    Plus,
    Settings,
    Users,
    Wallet,
    LogOut,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/stores/authStore';


interface SidebarItem {
    icon: string;
    label: string;
    href: string;
    active?: boolean;
}

interface SidebarProps {
    items: SidebarItem[];
    user?: {
        name: string;
        address: string;
        avatar?: string;
    };
}

const icons: Record<string, LucideIcon> = {
    dashboard: BarChart3,
    home_work: Home,
    add: Plus,
    description: FileText,
    people: Users,
    settings: Settings,
    account_balance_wallet: Wallet,
};

function getIcon(icon: string) {
    return icons[icon] ?? HomeIcon;
}

export function Sidebar({ items, user }: SidebarProps) {
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 border-r border-border/80 bg-white/92 shadow-[18px_0_44px_rgba(18,29,45,0.06)] backdrop-blur-xl md:flex md:flex-col">
            <div className="px-7 py-7">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/85">Rental operating system</p>
            </div>

            <nav className="flex-1 space-y-1 px-4">
                {items.map((item) => {
                    const Icon = getIcon(item.icon);
                    return (
                        <Link
                            key={item.label}
                            to={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition',
                                item.active
                                    ? 'bg-primary text-white shadow-[0_12px_28px_rgba(15,45,78,0.20)]'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {user && (
                <div className="border-t border-border p-5 space-y-3">
                    <div className="flex items-center gap-3 rounded-[8px] bg-muted p-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
                            ) : (
                                user.name.charAt(0)
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold">{user.name}</p>
                            <p className="truncate font-mono text-xs text-muted-foreground">{user.address}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-white px-4 py-2.5 text-xs font-bold text-muted-foreground shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition hover:border-error/30 hover:bg-error/5 hover:text-error"
                    >
                        <LogOut className="h-4 w-4" />
                        Log out
                    </button>
                </div>
            )}
        </aside>
    );
}

export function MobileNav({ items }: { items: SidebarItem[] }) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-border bg-white/95 px-2 py-2 shadow-[0_-18px_36px_rgba(18,29,45,0.08)] backdrop-blur-xl md:hidden">
            {items.slice(0, 5).map((item) => {
                const Icon = getIcon(item.icon);
                return (
                    <Link
                        key={item.label}
                        to={item.href}
                        className={cn(
                            'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-full px-2 py-2 text-[11px] font-semibold transition',
                            item.active ? 'bg-primary text-white' : 'text-muted-foreground',
                        )}
                    >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="max-w-full truncate">{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
