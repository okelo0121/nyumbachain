import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/utils/cn';

interface NavItem {
    label: string;
    href: string;
    icon: string;
    badge?: number;
}

interface SidebarProps {
    title?: string;
    subtitle?: string;
    navItems: NavItem[];
    user: {
        name: string;
        avatar?: string;
        wallet: string;
    };
    children: ReactNode;
}

export function Sidebar({ title = 'NyumbaChain', subtitle = 'Rental Ecosystem', navItems, user, children }: SidebarProps) {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-background text-on-background flex">
            {/* Sidebar */}
            <aside className="flex flex-col h-screen fixed left-0 top-0 bg-surface-container-low/90 backdrop-blur-lg border-r border-white/10 shadow-xl w-64 z-50">
                <div className="px-lg py-xl">
                    <Link to="/" className="font-headline-md text-headline-md font-bold text-primary">
                        {title}
                    </Link>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs">{subtitle}</p>
                </div>

                <nav className="flex-1 mt-md">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    'flex items-center gap-md px-lg py-md transition-all duration-300 ease-in-out',
                                    isActive
                                        ? 'bg-primary/10 text-primary border-r-4 border-primary'
                                        : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface',
                                )}
                            >
                                <span className="material-symbols-outlined">{item.icon}</span>
                                <span className="font-body-md text-body-md">{item.label}</span>
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="ml-auto bg-primary text-on-primary-container text-[10px] px-1.5 rounded-full font-bold">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-lg border-t border-white/5">
                    <div className="flex items-center gap-md">
                        {user.avatar ? (
                            <img alt="User" className="w-10 h-10 rounded-full border border-primary/20" src={user.avatar} />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-headline-md text-primary">
                                {user.name.charAt(0)}
                            </div>
                        )}
                        <div className="overflow-hidden">
                            <p className="font-body-md text-body-md font-semibold truncate">{user.name}</p>
                            <p className="font-label-sm text-label-sm text-on-surface-variant truncate">{user.wallet}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="ml-64 flex-1 min-h-screen">
                <div className="p-lg max-w-[1440px] mx-auto">{children}</div>
            </main>
        </div>
    );
}
