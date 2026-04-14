// Shared hotel data for the entire app
// Used by: hotel-listing, comparison-detail, recommendations, hotel-details

export interface Hotel {
  id: number;
  name: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  amenities: string[];
  image: string;
  category: string;
  petFriendly: boolean;
  gradient: [string, string];
  accent: string;
  amenityScores: {
    cleanliness: number;
    service: number;
    location: number;
    value: number;
    comfort: number;
  };
  features: { [key: string]: boolean };
  tripMatch: {
    family: number;
    business: number;
    friends: number;
    solo: number;
    pets: number;
  };
  platformPrices: { platform: string; price: number }[];
  /** 30-day daily price history — index 0 = 29 days ago, index 29 = today */
  priceHistory: number[];
  /** Review sentiment breakdown out of 10 */
  sentiment: { positive: number; neutral: number; negative: number };
  /** Value index = amenityScore composite / price (higher = better value) */
  valueIndex: number;
}

export const categories = [
  { id: 'all', name: 'All', gradient: ['#333', '#666'] as [string, string], accent: '#333', icon: 'grid' },
  { id: 'luxury', name: 'Luxury', gradient: ['#667eea', '#764ba2'] as [string, string], accent: '#667eea', icon: 'diamond' },
  { id: 'budget', name: 'Budget', gradient: ['#11998e', '#38ef7d'] as [string, string], accent: '#11998e', icon: 'wallet' },
  { id: 'business', name: 'Business', gradient: ['#2193b0', '#6dd5ed'] as [string, string], accent: '#2193b0', icon: 'briefcase' },
  { id: 'romantic', name: 'Romantic', gradient: ['#a78bfa', '#c084fc'] as [string, string], accent: '#a78bfa', icon: 'heart' },
  { id: 'family', name: 'Family', gradient: ['#F5A623', '#FFD700'] as [string, string], accent: '#F5A623', icon: 'people' },
  { id: 'adventure', name: 'Adventure', gradient: ['#ef4444', '#f87171'] as [string, string], accent: '#ef4444', icon: 'compass' },
  { id: 'wellness', name: 'Wellness', gradient: ['#1D976C', '#93F9B9'] as [string, string], accent: '#1D976C', icon: 'leaf' },
];

export const categoryColors: { [key: string]: { gradient: [string, string]; accent: string } } = {
  luxury: { gradient: ['#667eea', '#764ba2'], accent: '#667eea' },
  budget: { gradient: ['#11998e', '#38ef7d'], accent: '#11998e' },
  family: { gradient: ['#F5A623', '#FFD700'], accent: '#F5A623' },
  romantic: { gradient: ['#a78bfa', '#c084fc'], accent: '#a78bfa' },
  business: { gradient: ['#2193b0', '#6dd5ed'], accent: '#2193b0' },
  adventure: { gradient: ['#ef4444', '#f87171'], accent: '#ef4444' },
  wellness: { gradient: ['#1D976C', '#93F9B9'], accent: '#1D976C' },
};

export const featureLabels: { [key: string]: { label: string; icon: string } } = {
  wifi: { label: 'Free WiFi', icon: 'wifi' },
  pool: { label: 'Pool', icon: 'water' },
  gym: { label: 'Gym', icon: 'fitness' },
  spa: { label: 'Spa', icon: 'leaf' },
  parking: { label: 'Parking', icon: 'car' },
  restaurant: { label: 'Restaurant', icon: 'restaurant' },
  petFriendly: { label: 'Pet Friendly', icon: 'paw' },
  bar: { label: 'Bar', icon: 'wine' },
  roomService: { label: 'Room Service', icon: 'bed' },
  laundry: { label: 'Laundry', icon: 'shirt' },
};

export const hotels: Hotel[] = [
  {
    id: 1, name: 'The Grand Palace Hotel', location: 'Downtown, New York', price: 245, rating: 4.9, reviews: 2340,
    amenities: ['wifi', 'restaurant', 'fitness-center', 'car'], image: 'hotel1', category: 'luxury', petFriendly: false,
    gradient: ['#667eea', '#764ba2'], accent: '#667eea',
    amenityScores: { cleanliness: 9.2, service: 9.0, location: 9.5, value: 8.5, comfort: 9.2 },
    features: { wifi: true, pool: true, gym: true, spa: true, parking: true, restaurant: true, petFriendly: false, bar: true, roomService: true, laundry: true },
    tripMatch: { family: 72, business: 95, friends: 80, solo: 88, pets: 20 },
    platformPrices: [{ platform: 'Agoda', price: 245 }, { platform: 'Booking.com', price: 260 }, { platform: 'Expedia', price: 252 }, { platform: 'MakeMyTrip', price: 268 }],
    priceHistory: [258,252,260,255,248,262,258,250,245,252,260,255,248,242,250,258,262,255,248,252,245,250,258,262,248,245,252,258,252,245],
    sentiment: { positive: 78, neutral: 14, negative: 8 },
    valueIndex: 3.8,
  },
  {
    id: 2, name: 'Budget Inn Express', location: 'Midtown, New York', price: 65, rating: 4.2, reviews: 1856,
    amenities: ['wifi', 'cafe'], image: 'hotel2', category: 'budget', petFriendly: true,
    gradient: ['#11998e', '#38ef7d'], accent: '#11998e',
    amenityScores: { cleanliness: 7.2, service: 7.5, location: 8.0, value: 9.5, comfort: 7.0 },
    features: { wifi: true, pool: false, gym: false, spa: false, parking: false, restaurant: false, petFriendly: true, bar: false, roomService: false, laundry: true },
    tripMatch: { family: 55, business: 40, friends: 60, solo: 80, pets: 90 },
    platformPrices: [{ platform: 'Agoda', price: 65 }, { platform: 'Booking.com', price: 70 }, { platform: 'Expedia', price: 68 }, { platform: 'MakeMyTrip', price: 72 }],
    priceHistory: [68,70,65,62,60,65,68,70,72,68,65,62,60,65,68,70,65,62,60,63,65,68,70,68,65,62,60,65,68,65],
    sentiment: { positive: 62, neutral: 28, negative: 10 },
    valueIndex: 9.5,
  },
  {
    id: 3, name: 'Family Fun Resort', location: 'Central Park, New York', price: 155, rating: 4.5, reviews: 3210,
    amenities: ['wifi', 'restaurant', 'fitness-center'], image: 'hotel3', category: 'family', petFriendly: true,
    gradient: ['#F5A623', '#FFD700'], accent: '#F5A623',
    amenityScores: { cleanliness: 8.5, service: 8.8, location: 8.2, value: 8.0, comfort: 8.7 },
    features: { wifi: true, pool: true, gym: true, spa: false, parking: true, restaurant: true, petFriendly: true, bar: false, roomService: true, laundry: true },
    tripMatch: { family: 96, business: 45, friends: 70, solo: 55, pets: 88 },
    platformPrices: [{ platform: 'Agoda', price: 155 }, { platform: 'Booking.com', price: 162 }, { platform: 'Expedia', price: 158 }, { platform: 'MakeMyTrip', price: 170 }],
    priceHistory: [162,158,155,160,165,158,152,155,160,162,158,155,150,148,152,158,162,165,158,155,150,152,158,160,155,150,148,155,158,155],
    sentiment: { positive: 74, neutral: 18, negative: 8 },
    valueIndex: 5.5,
  },
  {
    id: 4, name: 'Royal Romance Suites', location: 'Times Square, New York', price: 195, rating: 4.8, reviews: 4521,
    amenities: ['wifi', 'restaurant', 'fitness-center', 'car', 'cafe'], image: 'hotel4', category: 'romantic', petFriendly: false,
    gradient: ['#a78bfa', '#c084fc'], accent: '#a78bfa',
    amenityScores: { cleanliness: 9.0, service: 9.4, location: 9.2, value: 8.0, comfort: 9.5 },
    features: { wifi: true, pool: true, gym: false, spa: true, parking: true, restaurant: true, petFriendly: false, bar: true, roomService: true, laundry: true },
    tripMatch: { family: 50, business: 60, friends: 75, solo: 70, pets: 15 },
    platformPrices: [{ platform: 'Agoda', price: 195 }, { platform: 'Booking.com', price: 210 }, { platform: 'Expedia', price: 205 }, { platform: 'MakeMyTrip', price: 215 }],
    priceHistory: [205,210,200,195,198,205,210,215,205,200,195,200,205,210,205,200,195,198,205,210,205,200,195,198,205,210,205,200,198,195],
    sentiment: { positive: 82, neutral: 12, negative: 6 },
    valueIndex: 4.9,
  },
  {
    id: 5, name: 'Executive Tower Hotel', location: 'SoHo, New York', price: 185, rating: 4.6, reviews: 1245,
    amenities: ['wifi', 'cafe', 'restaurant'], image: 'hotel5', category: 'business', petFriendly: false,
    gradient: ['#2193b0', '#6dd5ed'], accent: '#2193b0',
    amenityScores: { cleanliness: 8.8, service: 9.0, location: 8.5, value: 7.8, comfort: 8.5 },
    features: { wifi: true, pool: false, gym: true, spa: false, parking: true, restaurant: true, petFriendly: false, bar: true, roomService: true, laundry: true },
    tripMatch: { family: 40, business: 92, friends: 65, solo: 85, pets: 10 },
    platformPrices: [{ platform: 'Agoda', price: 185 }, { platform: 'Booking.com', price: 190 }, { platform: 'Expedia', price: 188 }, { platform: 'MakeMyTrip', price: 195 }],
    priceHistory: [190,188,185,188,192,188,185,182,185,188,192,188,185,182,185,188,190,192,188,185,182,185,188,190,188,185,182,185,188,185],
    sentiment: { positive: 71, neutral: 20, negative: 9 },
    valueIndex: 4.6,
  },
  {
    id: 6, name: 'Adventure Base Camp', location: 'Upper East Side, New York', price: 125, rating: 4.7, reviews: 2890,
    amenities: ['wifi', 'restaurant', 'fitness-center'], image: 'hotel6', category: 'adventure', petFriendly: true,
    gradient: ['#ef4444', '#f87171'], accent: '#ef4444',
    amenityScores: { cleanliness: 8.0, service: 8.2, location: 7.8, value: 8.8, comfort: 7.5 },
    features: { wifi: true, pool: false, gym: true, spa: false, parking: true, restaurant: true, petFriendly: true, bar: true, roomService: false, laundry: false },
    tripMatch: { family: 65, business: 30, friends: 92, solo: 90, pets: 85 },
    platformPrices: [{ platform: 'Agoda', price: 125 }, { platform: 'Booking.com', price: 130 }, { platform: 'Expedia', price: 128 }, { platform: 'MakeMyTrip', price: 135 }],
    priceHistory: [130,128,125,122,120,125,128,132,128,125,122,120,125,128,130,125,122,120,122,125,128,130,128,125,122,120,122,125,128,125],
    sentiment: { positive: 76, neutral: 16, negative: 8 },
    valueIndex: 6.8,
  },
  {
    id: 7, name: 'Serenity Spa Resort', location: 'Chelsea, New York', price: 175, rating: 4.4, reviews: 1678,
    amenities: ['wifi', 'restaurant', 'cafe', 'fitness-center'], image: 'hotel7', category: 'wellness', petFriendly: false,
    gradient: ['#1D976C', '#93F9B9'], accent: '#1D976C',
    amenityScores: { cleanliness: 9.0, service: 8.5, location: 8.0, value: 7.8, comfort: 9.0 },
    features: { wifi: true, pool: true, gym: true, spa: true, parking: true, restaurant: true, petFriendly: false, bar: false, roomService: true, laundry: true },
    tripMatch: { family: 60, business: 50, friends: 70, solo: 92, pets: 15 },
    platformPrices: [{ platform: 'Agoda', price: 175 }, { platform: 'Booking.com', price: 182 }, { platform: 'Expedia', price: 178 }, { platform: 'MakeMyTrip', price: 188 }],
    priceHistory: [180,178,175,172,170,175,178,182,178,175,172,170,175,178,180,178,175,172,170,172,175,178,182,178,175,172,170,175,178,175],
    sentiment: { positive: 70, neutral: 22, negative: 8 },
    valueIndex: 5.0,
  },
  {
    id: 8, name: 'The Ritz Platinum', location: 'Battery Park, New York', price: 320, rating: 4.9, reviews: 5234,
    amenities: ['wifi', 'restaurant', 'fitness-center', 'car', 'cafe'], image: 'hotel8', category: 'luxury', petFriendly: false,
    gradient: ['#667eea', '#764ba2'], accent: '#667eea',
    amenityScores: { cleanliness: 9.5, service: 9.8, location: 9.0, value: 7.5, comfort: 9.8 },
    features: { wifi: true, pool: true, gym: true, spa: true, parking: true, restaurant: true, petFriendly: false, bar: true, roomService: true, laundry: true },
    tripMatch: { family: 70, business: 98, friends: 82, solo: 90, pets: 10 },
    platformPrices: [{ platform: 'Agoda', price: 320 }, { platform: 'Booking.com', price: 340 }, { platform: 'Expedia', price: 335 }, { platform: 'MakeMyTrip', price: 350 }],
    priceHistory: [340,335,320,315,310,320,330,340,335,320,315,310,315,320,330,335,340,335,320,315,310,315,320,330,325,320,315,320,325,320],
    sentiment: { positive: 86, neutral: 10, negative: 4 },
    valueIndex: 3.0,
  },
  {
    id: 9, name: 'Thrifty Stay Motel', location: 'Greenwich Village, New York', price: 55, rating: 4.0, reviews: 2156,
    amenities: ['wifi'], image: 'hotel9', category: 'budget', petFriendly: true,
    gradient: ['#11998e', '#38ef7d'], accent: '#11998e',
    amenityScores: { cleanliness: 6.8, service: 7.0, location: 7.5, value: 9.8, comfort: 6.5 },
    features: { wifi: true, pool: false, gym: false, spa: false, parking: false, restaurant: false, petFriendly: true, bar: false, roomService: false, laundry: false },
    tripMatch: { family: 40, business: 25, friends: 50, solo: 75, pets: 95 },
    platformPrices: [{ platform: 'Agoda', price: 55 }, { platform: 'Booking.com', price: 58 }, { platform: 'Expedia', price: 56 }, { platform: 'MakeMyTrip', price: 60 }],
    priceHistory: [58,56,55,52,50,55,58,60,58,55,52,50,52,55,58,56,55,52,50,52,55,58,60,58,55,52,50,52,55,55],
    sentiment: { positive: 55, neutral: 30, negative: 15 },
    valueIndex: 11.8,
  },
  {
    id: 10, name: 'Kids Paradise Hotel', location: 'Upper West Side, New York', price: 145, rating: 4.3, reviews: 1432,
    amenities: ['wifi', 'cafe', 'restaurant'], image: 'hotel10', category: 'family', petFriendly: true,
    gradient: ['#F5A623', '#FFD700'], accent: '#F5A623',
    amenityScores: { cleanliness: 8.2, service: 8.5, location: 7.8, value: 8.2, comfort: 8.5 },
    features: { wifi: true, pool: true, gym: false, spa: false, parking: true, restaurant: true, petFriendly: true, bar: false, roomService: true, laundry: true },
    tripMatch: { family: 94, business: 30, friends: 55, solo: 45, pets: 92 },
    platformPrices: [{ platform: 'Agoda', price: 145 }, { platform: 'Booking.com', price: 150 }, { platform: 'Expedia', price: 148 }, { platform: 'MakeMyTrip', price: 155 }],
    priceHistory: [150,148,145,142,140,145,148,152,148,145,142,140,142,145,150,148,145,142,140,142,145,148,152,148,145,142,140,142,148,145],
    sentiment: { positive: 72, neutral: 20, negative: 8 },
    valueIndex: 5.8,
  },
  {
    id: 11, name: 'Corporate Suites NYC', location: 'Financial District, New York', price: 195, rating: 4.6, reviews: 3567,
    amenities: ['wifi', 'restaurant', 'fitness-center', 'car'], image: 'hotel11', category: 'business', petFriendly: false,
    gradient: ['#2193b0', '#6dd5ed'], accent: '#2193b0',
    amenityScores: { cleanliness: 9.0, service: 9.2, location: 9.0, value: 8.0, comfort: 8.8 },
    features: { wifi: true, pool: false, gym: true, spa: false, parking: true, restaurant: true, petFriendly: false, bar: true, roomService: true, laundry: true },
    tripMatch: { family: 35, business: 96, friends: 60, solo: 88, pets: 10 },
    platformPrices: [{ platform: 'Agoda', price: 195 }, { platform: 'Booking.com', price: 200 }, { platform: 'Expedia', price: 198 }, { platform: 'MakeMyTrip', price: 208 }],
    priceHistory: [200,198,195,192,190,195,198,202,198,195,192,190,192,195,200,198,195,192,190,192,195,198,202,198,195,192,190,195,198,195],
    sentiment: { positive: 80, neutral: 14, negative: 6 },
    valueIndex: 4.8,
  },
  {
    id: 12, name: 'Honeymoon Haven', location: 'Tribeca, New York', price: 225, rating: 4.8, reviews: 4123,
    amenities: ['wifi', 'restaurant', 'fitness-center', 'car', 'cafe'], image: 'hotel12', category: 'romantic', petFriendly: false,
    gradient: ['#a78bfa', '#c084fc'], accent: '#a78bfa',
    amenityScores: { cleanliness: 9.2, service: 9.5, location: 8.8, value: 7.5, comfort: 9.6 },
    features: { wifi: true, pool: true, gym: false, spa: true, parking: true, restaurant: true, petFriendly: false, bar: true, roomService: true, laundry: true },
    tripMatch: { family: 45, business: 50, friends: 65, solo: 60, pets: 10 },
    platformPrices: [{ platform: 'Agoda', price: 225 }, { platform: 'Booking.com', price: 240 }, { platform: 'Expedia', price: 235 }, { platform: 'MakeMyTrip', price: 245 }],
    priceHistory: [235,240,225,220,218,225,232,240,235,225,220,218,222,228,235,240,235,228,222,218,222,228,235,240,232,225,220,222,228,225],
    sentiment: { positive: 84, neutral: 11, negative: 5 },
    valueIndex: 4.2,
  },
  {
    id: 13, name: 'Extreme Sports Lodge', location: 'East Village, New York', price: 115, rating: 4.5, reviews: 987,
    amenities: ['wifi', 'cafe', 'fitness-center'], image: 'hotel13', category: 'adventure', petFriendly: true,
    gradient: ['#ef4444', '#f87171'], accent: '#ef4444',
    amenityScores: { cleanliness: 7.8, service: 8.0, location: 8.5, value: 9.0, comfort: 7.5 },
    features: { wifi: true, pool: false, gym: true, spa: false, parking: false, restaurant: false, petFriendly: true, bar: true, roomService: false, laundry: false },
    tripMatch: { family: 50, business: 25, friends: 95, solo: 88, pets: 80 },
    platformPrices: [{ platform: 'Agoda', price: 115 }, { platform: 'Booking.com', price: 120 }, { platform: 'Expedia', price: 118 }, { platform: 'MakeMyTrip', price: 125 }],
    priceHistory: [120,118,115,112,110,115,118,122,118,115,112,110,112,115,120,118,115,112,110,112,115,118,122,118,115,112,110,112,118,115],
    sentiment: { positive: 73, neutral: 19, negative: 8 },
    valueIndex: 7.2,
  },
  {
    id: 14, name: 'Zen Garden Retreat', location: "Hell's Kitchen, New York", price: 165, rating: 4.7, reviews: 2345,
    amenities: ['wifi', 'restaurant', 'fitness-center'], image: 'hotel14', category: 'wellness', petFriendly: false,
    gradient: ['#1D976C', '#93F9B9'], accent: '#1D976C',
    amenityScores: { cleanliness: 9.2, service: 8.8, location: 8.0, value: 8.2, comfort: 9.2 },
    features: { wifi: true, pool: true, gym: true, spa: true, parking: true, restaurant: true, petFriendly: false, bar: false, roomService: true, laundry: true },
    tripMatch: { family: 55, business: 45, friends: 65, solo: 95, pets: 12 },
    platformPrices: [{ platform: 'Agoda', price: 165 }, { platform: 'Booking.com', price: 172 }, { platform: 'Expedia', price: 168 }, { platform: 'MakeMyTrip', price: 178 }],
    priceHistory: [172,168,165,162,160,165,168,172,168,165,162,160,162,165,170,168,165,162,160,162,165,168,172,168,165,162,160,162,168,165],
    sentiment: { positive: 77, neutral: 17, negative: 6 },
    valueIndex: 5.2,
  },
  {
    id: 15, name: 'Value Stay Plus', location: 'Brooklyn Heights, New York', price: 75, rating: 4.1, reviews: 1876,
    amenities: ['wifi', 'cafe'], image: 'hotel15', category: 'budget', petFriendly: true,
    gradient: ['#11998e', '#38ef7d'], accent: '#11998e',
    amenityScores: { cleanliness: 7.5, service: 7.2, location: 7.8, value: 9.5, comfort: 7.2 },
    features: { wifi: true, pool: false, gym: false, spa: false, parking: true, restaurant: false, petFriendly: true, bar: false, roomService: false, laundry: true },
    tripMatch: { family: 50, business: 35, friends: 55, solo: 78, pets: 88 },
    platformPrices: [{ platform: 'Agoda', price: 75 }, { platform: 'Booking.com', price: 80 }, { platform: 'Expedia', price: 78 }, { platform: 'MakeMyTrip', price: 82 }],
    priceHistory: [80,78,75,72,70,75,78,82,78,75,72,70,72,75,80,78,75,72,70,72,75,78,82,78,75,72,70,72,78,75],
    sentiment: { positive: 60, neutral: 28, negative: 12 },
    valueIndex: 9.1,
  },
  {
    id: 16, name: 'Imperial Luxury Palace', location: 'Williamsburg, New York', price: 285, rating: 4.8, reviews: 1234,
    amenities: ['wifi', 'restaurant', 'fitness-center', 'car', 'cafe'], image: 'hotel16', category: 'luxury', petFriendly: false,
    gradient: ['#667eea', '#764ba2'], accent: '#667eea',
    amenityScores: { cleanliness: 9.4, service: 9.2, location: 8.8, value: 7.8, comfort: 9.5 },
    features: { wifi: true, pool: true, gym: true, spa: true, parking: true, restaurant: true, petFriendly: false, bar: true, roomService: true, laundry: true },
    tripMatch: { family: 68, business: 90, friends: 80, solo: 85, pets: 10 },
    platformPrices: [{ platform: 'Agoda', price: 285 }, { platform: 'Booking.com', price: 300 }, { platform: 'Expedia', price: 295 }, { platform: 'MakeMyTrip', price: 310 }],
    priceHistory: [300,295,285,280,278,285,292,300,295,285,280,278,282,288,295,300,295,288,282,278,282,288,295,300,292,285,280,282,290,285],
    sentiment: { positive: 83, neutral: 12, negative: 5 },
    valueIndex: 3.4,
  },
];

export const getHotelById = (id: number): Hotel | undefined => hotels.find((h) => h.id === id);
export const getHotelsByIds = (ids: number[]): Hotel[] => hotels.filter((h) => ids.includes(h.id));
