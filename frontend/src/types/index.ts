/**
 * Shared TypeScript types — mirrors backend API contracts.
 */

// ---------- Auth & Users ----------
export type UserRole = 'landlord' | 'tenant' | 'admin';

export interface User {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
    role: UserRole;
    stellar_wallet?: string;
    kyc_verified: boolean;
    created_at: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
}

// ---------- Properties & Units ----------
export type PropertyType = 'apartment' | 'house' | 'studio' | 'bedsitter';
export type UnitType = 'studio' | 'bedsitter' | '1bed' | '2bed' | '3bed';

export interface Property {
    id: string;
    landlord_id: string;
    title: string;
    description?: string;
    address: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    property_type: PropertyType;
    amenities: string[];
    photos: string[];
    is_active: boolean;
    units?: Unit[];
    created_at: string;
}

export interface Unit {
    id: string;
    property_id: string;
    unit_type: UnitType;
    monthly_rent_usdc: number;
    deposit_usdc: number;
    is_available: boolean;
    floor_number?: number;
    square_meters?: number;
}

// ---------- Search ----------
export interface SearchParams {
    city?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    unit_type?: string;
    min_rent?: number;
    max_rent?: number;
    amenities?: string;
    available?: boolean;
    sort?: 'price_asc' | 'price_desc' | 'newest' | 'nearest';
    page?: number;
    limit?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
}

// ---------- Applications ----------
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface Application {
    id: string;
    unit_id: string;
    tenant_id: string;
    message: string;
    status: ApplicationStatus;
    created_at: string;
    unit?: Unit & { property?: Property };
    tenant?: User;
}

// ---------- Tenancies ----------
export type TenancyStatus = 'active' | 'ending' | 'ended' | 'disputed';

export interface Tenancy {
    id: string;
    unit_id: string;
    tenant_id: string;
    landlord_id: string;
    start_date: string;
    end_date?: string;
    payment_day: number;
    monthly_rent_usdc: number;
    deposit_usdc: number;
    escrow_contract_id?: string;
    escrow_wallet_address?: string;
    status: TenancyStatus;
    created_at: string;
    unit?: Unit & { property?: Property };
    tenant?: User;
    landlord?: User;
}

// ---------- Payments ----------
export type PaymentType = 'rent' | 'deposit' | 'deposit_return' | 'penalty';
export type PaymentStatus = 'pending' | 'executed' | 'failed';

export interface Payment {
    id: string;
    tenancy_id: string;
    amount_usdc: number;
    payment_type: PaymentType;
    status: PaymentStatus;
    stellar_tx_hash?: string;
    due_date: string;
    executed_at?: string;
    failure_reason?: string;
    created_at: string;
}

// ---------- API helpers ----------
export interface ApiError {
    message: string;
    code?: string;
    status?: number;
}
