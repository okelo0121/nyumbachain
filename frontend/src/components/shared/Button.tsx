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
    primary: 'bg-primary-container text-on-primary-container hover:brightness-110',
    secondary: 'bg-surface-variant text-on-surface border border-white/10 hover:bg-surface-bright',
    ghost: 'bg-transparent text-on-surface hover:bg-white/5',
    destructive: 'bg-error-container text-on-error-container hover:brightness-110',
};

const sizeClasses: Record<Size, string> = {
    sm: 'px-md py-sm text-button-text',
    md: 'px-lg py-sm text-button-text',
    lg: 'px-xl py-md text-button-text',
};

export const Button = forwardRef<HTMLButtonElement, Props>(
    ({ className, variant = 'primary', size = 'md', leftIcon, rightIcon, fullWidth, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center gap-sm rounded-lg font-button-text',
                    'active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none',
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
