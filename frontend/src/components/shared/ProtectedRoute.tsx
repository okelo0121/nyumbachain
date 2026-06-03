import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
    allowedRoles?: Array<'landlord' | 'tenant' | 'admin'>;
    isLoading?: boolean;
}

export default function ProtectedRoute({ allowedRoles, isLoading }: ProtectedRouteProps) {
    const { accessToken, user } = useAuthStore();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm font-semibold text-muted-foreground">Reconnecting session...</p>
                </div>
            </div>
        );
    }

    if (!accessToken || !user) {
        return <Navigate to="/auth/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={user.role === 'landlord' ? '/landlord/dashboard' : '/tenant/dashboard'} replace />;
    }

    return <Outlet />;
}
