import { Routes, Route, Navigate } from 'react-router-dom';

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

export default function App() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/search" element={<Search />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />

            {/* Landlord */}
            <Route path="/landlord/dashboard" element={<LandlordDashboard />} />
            <Route path="/landlord/properties" element={<LandlordProperties />} />
            <Route path="/landlord/properties/new" element={<NewProperty />} />
            <Route path="/landlord/applications" element={<LandlordApplications />} />
            <Route path="/landlord/tenants" element={<LandlordTenants />} />

            {/* Tenant */}
            <Route path="/tenant/dashboard" element={<TenantDashboard />} />
            <Route path="/tenant/applications" element={<TenantApplications />} />
            <Route path="/tenant/wallet" element={<TenantWallet />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
