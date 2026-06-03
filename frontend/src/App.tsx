import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import ProtectedRoute from '@/components/shared/ProtectedRoute';

// Public pages
import Landing from '@/pages/Landing';
import Register from '@/pages/Register';
import Login from '@/pages/Login';
import Search from '@/pages/Search';
import PropertyDetail from '@/pages/PropertyDetail';

// Landlord pages
import LandlordDashboard from '@/pages/LandlordDashboard';
import LandlordProperties from '@/pages/LandlordProperties';
import NewProperty from '@/pages/NewProperty';
import LandlordApplications from '@/pages/LandlordApplications';
import LandlordTenants from '@/pages/LandlordTenants';

// Tenant pages
import TenantDashboard from '@/pages/TenantDashboard';
import TenantApplications from '@/pages/TenantApplications';
import TenantWallet from '@/pages/TenantWallet';
import Settings from '@/pages/Settings';


export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const setAuth = useAuthStore((state) => state.setAuth);
    const logout = useAuthStore((state) => state.logout);

    useEffect(() => {
        const checkSession = async () => {
            try {
                // Trigger token refresh using HttpOnly cookie session
                const res = await api.post('/auth/refresh');
                const token = res.data.accessToken;

                // Retrieve profile information
                const userRes = await api.get('/auth/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setAuth(token, userRes.data);
            } catch (err) {
                console.log('[Auth] No active session found.');
                logout();
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();
    }, [setAuth, logout]);

    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/search" element={<Search />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />

            {/* Landlord Private Routes */}
            <Route element={<ProtectedRoute allowedRoles={['landlord']} isLoading={isLoading} />}>
                <Route path="/landlord/dashboard" element={<LandlordDashboard />} />
                <Route path="/landlord/properties" element={<LandlordProperties />} />
                <Route path="/landlord/properties/new" element={<NewProperty />} />
                <Route path="/landlord/applications" element={<LandlordApplications />} />
                <Route path="/landlord/tenants" element={<LandlordTenants />} />
            </Route>

            {/* Tenant Private Routes */}
            <Route element={<ProtectedRoute allowedRoles={['tenant']} isLoading={isLoading} />}>
                <Route path="/tenant/dashboard" element={<TenantDashboard />} />
                <Route path="/tenant/applications" element={<TenantApplications />} />
                <Route path="/tenant/wallet" element={<TenantWallet />} />
            </Route>

            {/* Shared Private Routes */}
            <Route element={<ProtectedRoute allowedRoles={['landlord', 'tenant']} isLoading={isLoading} />}>
                <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
