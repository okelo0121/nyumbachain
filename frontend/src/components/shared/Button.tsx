import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
    primary: 'bg-primary text-primary-foreground shadow-[0_12px_28px_rgba(15,45,78,0.22)] hover:bg-[#123d68]',
    secondary: 'bg-white text-foreground border border-border hover:border-primary/30 hover:shadow-sm',
    ghost: 'bg-transparent text-foreground hover:bg-muted',
    destructive: 'bg-error text-white hover:bg-error/90',
};

const sizeClasses: Record<Size, string> = {
    sm: 'px-4 py-2 text-button-text',
    md: 'px-5 py-3 text-button-text',
    lg: 'px-6 py-4 text-button-text',
};

export const Button = forwardRef<HTMLButtonElement, Props>(
    ({ className, variant = 'primary', size = 'md', leftIcon, rightIcon, fullWidth, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center gap-sm rounded-lg font-button-text',
                    'active:scale-95 transition-all disabled:pointer-events-none disabled:opacity-50',
                    variantClasses[variant],
                    sizeClasses[size],
                    fullWidth && 'w-full',
                    className,
                )}
                {...props}
            >
                {leftIcon}
                {children}
                {rightIcon}
            </button>
        );
    },
);
Button.displayName = 'Button';
