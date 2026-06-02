import { Link } from 'react-router-dom';

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

export function Sidebar({ items, user }: SidebarProps) {
    return (
        <aside className="flex flex-col h-screen fixed left-0 top-0 bg-white border-r border-border w-64 z-50 md:flex hidden shadow-md">
            <div className="px-xl py-xl">
                <Link to="/" className="font-headline-md font-bold text-foreground">
                    NyumbaChain
                </Link>
                <p className="text-on-surface-variant text-label-sm opacity-70">Portal</p>
            </div>
            <nav className="flex-1 px-md">
                {items.map((item) => (
                    <Link
                        key={item.label}
                        to={item.href}
                        className={`flex items-center gap-md px-lg py-md rounded-lg mb-unit transition-all ${
                            item.active
                                ? 'bg-primary/10 text-primary'
                                : 'text-on-surface-variant hover:bg-surface hover:text-foreground'
                        }`}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span className="font-label-sm">{item.label}</span>
                    </Link>
                ))}
            </nav>
            {user && (
                <div className="p-lg border-t border-border">
                    <div className="flex items-center gap-md">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {user.avatar ? <img src={user.avatar} alt="User" className="w-full h-full rounded-full object-cover" /> : user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-button-text truncate">{user.name}</p>
                            <p className="text-on-surface-variant text-label-sm text-[10px] truncate">{user.address}</p>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}

export function MobileNav({ items }: { items: SidebarItem[] }) {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border flex justify-around py-md px-lg shadow-lg">
            {items.map((item) => (
                <Link
                    key={item.label}
                    to={item.href}
                    className={`flex flex-col items-center gap-xs text-[10px] font-label-sm ${
                        item.active ? 'text-primary' : 'text-on-surface-variant'
                    }`}
                >
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <span>{item.label}</span>
                </Link>
            ))}
        </nav>
    );
}