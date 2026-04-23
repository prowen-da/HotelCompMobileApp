import Constants from 'expo-constants';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

// Hotel color palette for assigning colors to API hotels
const HOTEL_COLORS = [
  { color: '#11998e', gradient: ['#11998e', '#38ef7d'] as [string, string] },
  { color: '#667eea', gradient: ['#667eea', '#764ba2'] as [string, string] },
  { color: '#a78bfa', gradient: ['#a78bfa', '#c084fc'] as [string, string] },
  { color: '#2193b0', gradient: ['#2193b0', '#6dd5ed'] as [string, string] },
  { color: '#1D976C', gradient: ['#1D976C', '#93F9B9'] as [string, string] },
  { color: '#F5A623', gradient: ['#F5A623', '#FFD700'] as [string, string] },
  { color: '#ef4444', gradient: ['#ef4444', '#f87171'] as [string, string] },
];

export interface ApiHotel {
  id: number;
  name: string;
  short: string;
  color: string;
  gradient: [string, string];
  price: number;
  rating: number;
  reviews: number;
  petFriendly: boolean;
  features: {
    wifi: boolean;
    pool: boolean;
    gym: boolean;
    spa: boolean;
    parking: boolean;
    restaurant: boolean;
    bar: boolean;
    petFriendly: boolean;
  };
  scores: {
    family: Record<string, number>;
    business: Record<string, number>;
    friends: Record<string, number>;
    leisure: Record<string, number>;
  };
  match: Record<string, number>;
  value_score: Record<string, number>;
}

export interface ComparisonHotel {
  hotel_name: string;
  hotel_id: number;
  rank: number;
  hotel_rating: number;
  address: string;
  lowest_price: number;
  value_score: number;
  sentiment_score: { positive: number; negative: number; neutral: number };
  currency: string;
  is_best_value: boolean;
  specification: { description: string; tags: string[] };
}

export interface OtaPrice {
  hotel_id: number;
  hotel_name: string;
  ota_list: { ota_name: string; ota_price: number; ota_url: string; ota_image: string }[];
}

export interface AmenityScore {
  hotel_name: string;
  hotel_id: number;
  rank: number;
  top_amenities: { amenitie_name: string; amenitie_score: number }[];
}

// Helper: assign colors to API hotels
function assignColors(hotels: any[]): any[] {
  return hotels.map((h, i) => ({
    ...h,
    color: h.color || HOTEL_COLORS[i % HOTEL_COLORS.length].color,
    gradient: (h.gradient && h.gradient[0] !== '#11998e') ? h.gradient : HOTEL_COLORS[i % HOTEL_COLORS.length].gradient,
  }));
}

// Fetch hotel comparison V2 data (main dashboard data)
export async function fetchHotelComparisonV2(
  checkInDate?: string,
  rateshopId?: string
): Promise<ApiHotel[]> {
  try {
    const params = new URLSearchParams();
    if (checkInDate) params.set('check_in_date', checkInDate);
    if (rateshopId) params.set('rateshop_id', rateshopId);
    
    const url = `${BACKEND_URL}/api/hotel-comparison-v2/?${params.toString()}`;
    console.log('[API] Fetching hotel-comparison-v2:', url);
    
    const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    const json = await res.json();
    
    if (json.data && json.data.length > 0) {
      return assignColors(json.data);
    }
    return [];
  } catch (error) {
    console.error('[API] fetchHotelComparisonV2 error:', error);
    return [];
  }
}

// Fetch hotel comparison with rankings, value scores, sentiment
export async function fetchHotelComparison(
  checkInDate?: string,
  travelType?: string,
  rateshopId?: string
): Promise<{ traveler: string; value: ComparisonHotel[]; recommendations: Record<string, string> }> {
  try {
    const params = new URLSearchParams();
    if (checkInDate) params.set('check_in_date', checkInDate);
    if (travelType) params.set('travel_type', travelType);
    if (rateshopId) params.set('rateshop_id', rateshopId);
    
    const url = `${BACKEND_URL}/api/hotel-comparision/?${params.toString()}`;
    console.log('[API] Fetching hotel-comparision:', url);
    
    const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    const json = await res.json();
    
    return {
      traveler: json.traveler || travelType || 'business',
      value: json.value || [],
      recommendations: json.recommendations || {},
    };
  } catch (error) {
    console.error('[API] fetchHotelComparison error:', error);
    return { traveler: travelType || 'business', value: [], recommendations: {} };
  }
}

// Fetch OTA prices
export async function fetchOtaPrices(
  checkInDate?: string,
  rateshopId?: string
): Promise<{ currency: string | null; prices: OtaPrice[]; ota: any[] }> {
  try {
    const params = new URLSearchParams();
    if (checkInDate) params.set('check_in_date', checkInDate);
    if (rateshopId) params.set('rateshop_id', rateshopId);
    
    const url = `${BACKEND_URL}/api/ota_prices/?${params.toString()}`;
    console.log('[API] Fetching ota_prices:', url);
    
    const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    const json = await res.json();
    
    return {
      currency: json.currency || null,
      prices: json.prices || [],
      ota: json.ota || [],
    };
  } catch (error) {
    console.error('[API] fetchOtaPrices error:', error);
    return { currency: null, prices: [], ota: [] };
  }
}

// Fetch top amenities comparison
export async function fetchTopAmenities(
  travelType?: string,
  rateshopId?: string
): Promise<{ traveler: string; amenities_score: AmenityScore[] }> {
  try {
    const params = new URLSearchParams();
    if (travelType) params.set('travel_type', travelType);
    if (rateshopId) params.set('rateshop_id', rateshopId);
    
    const url = `${BACKEND_URL}/api/top_amenities/?${params.toString()}`;
    console.log('[API] Fetching top_amenities:', url);
    
    const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    const json = await res.json();
    
    return {
      traveler: json.traveler || travelType || 'business',
      amenities_score: json.amenities_score || [],
    };
  } catch (error) {
    console.error('[API] fetchTopAmenities error:', error);
    return { traveler: travelType || 'business', amenities_score: [] };
  }
}

// Guest login
export async function guestLogin(): Promise<{ guest_id: string; access_token: string } | null> {
  try {
    const url = `${BACKEND_URL}/api/auth/guest-login/`;
    const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    const json = await res.json();
    if (json.access_token) return json;
    return null;
  } catch (error) {
    console.error('[API] guestLogin error:', error);
    return null;
  }
}

// Login
export async function login(email: string, password: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const url = `${BACKEND_URL}/api/auth/login/`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (res.ok) return { success: true, data: json };
    return { success: false, error: json.error || 'Login failed' };
  } catch (error) {
    console.error('[API] login error:', error);
    return { success: false, error: 'Network error' };
  }
}

// Register
export async function register(name: string, email: string, password: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const url = `${BACKEND_URL}/api/auth/register/`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const json = await res.json();
    if (res.ok) return { success: true, data: json };
    return { success: false, error: json.error || 'Registration failed' };
  } catch (error) {
    console.error('[API] register error:', error);
    return { success: false, error: 'Network error' };
  }
}

// City suggestions
export async function fetchCitySuggestions(query: string): Promise<any[]> {
  try {
    const url = `${BACKEND_URL}/api/city-suggestions/?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    const json = await res.json();
    return Array.isArray(json) ? json : [];
  } catch (error) {
    console.error('[API] fetchCitySuggestions error:', error);
    return [];
  }
}

// Verify OTP
export async function verifyOtp(email: string, otp: number): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const url = `${BACKEND_URL}/api/auth/verify-otp/`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const json = await res.json();
    if (res.ok) return { success: true, data: json };
    return { success: false, error: json.error || 'OTP verification failed' };
  } catch (error) {
    console.error('[API] verifyOtp error:', error);
    return { success: false, error: 'Network error' };
  }
}

// Resend OTP
export async function resendOtp(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `${BACKEND_URL}/api/auth/resend-otp/`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    if (res.ok) return { success: true };
    return { success: false, error: json.error || 'Failed to resend OTP' };
  } catch (error) {
    console.error('[API] resendOtp error:', error);
    return { success: false, error: 'Network error' };
  }
}

// Forgot Password
export async function forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `${BACKEND_URL}/api/auth/forgot-password/`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    if (res.ok) return { success: true };
    return { success: false, error: json.error || json.message || 'Request failed' };
  } catch (error) {
    console.error('[API] forgotPassword error:', error);
    return { success: false, error: 'Network error' };
  }
}

// Reset Password
export async function resetPassword(email: string, otp: number, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `${BACKEND_URL}/api/auth/reset-password/`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, new_password: newPassword }),
    });
    const json = await res.json();
    if (res.ok) return { success: true };
    return { success: false, error: json.error || 'Failed to reset password' };
  } catch (error) {
    console.error('[API] resetPassword error:', error);
    return { success: false, error: 'Network error' };
  }
}

