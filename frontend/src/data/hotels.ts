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
}

export const categories = [
  { id: 'all', name: 'All', gradient: ['#333', '#666'] as [string, string], accent: '#333', icon: 'grid' },
  { id: 'luxury', name: 'Luxury', gradient: ['#667eea', '#764ba2'] as [string, string], accent: '#667eea', icon: 'diamond' },
  { id: 'budget', name: 'Budget', gradient: ['#11998e', '#38ef7d'] as [string, string], accent: '#11998e', icon: 'wallet' },
  { id: 'business', name: 'Business', gradient: ['#2193b0', '#6dd5ed'] as [string, string], accent: '#2193b0', icon: 'briefcase' },
  { id: 'romantic', name: 'Romantic', gradient: ['#ee0979', '#ff6a00'] as [string, string], accent: '#ee0979', icon: 'heart' },
  { id: 'family', name: 'Family', gradient: ['#fc4a1a', '#f7b733'] as [string, string], accent: '#fc4a1a', icon: 'people' },
  { id: 'adventure', name: 'Adventure', gradient: ['#FF416C', '#FF4B2B'] as [string, string], accent: '#FF416C', icon: 'compass' },
  { id: 'wellness', name: 'Wellness', gradient: ['#1D976C', '#93F9B9'] as [string, string], accent: '#1D976C', icon: 'leaf' },
];

export const categoryColors: { [key: string]: { gradient: [string, string]; accent: string } } = {
  luxury: { gradient: ['#667eea', '#764ba2'], accent: '#667eea' },
  budget: { gradient: ['#11998e', '#38ef7d'], accent: '#11998e' },
  family: { gradient: ['#fc4a1a', '#f7b733'], accent: '#fc4a1a' },
  romantic: { gradient: ['#ee0979', '#ff6a00'], accent: '#ee0979' },
  business: { gradient: ['#2193b0', '#6dd5ed'], accent: '#2193b0' },
  adventure: { gradient: ['#FF416C', '#FF4B2B'], accent: '#FF416C' },
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
  },
  {
    id: 2, name: 'Budget Inn Express', location: 'Midtown, New York', price: 65, rating: 4.2, reviews: 1856,
    amenities: ['wifi', 'cafe'], image: 'hotel2', category: 'budget', petFriendly: true,
    gradient: ['#11998e', '#38ef7d'], accent: '#11998e',
    amenityScores: { cleanliness: 7.2, service: 7.5, location: 8.0, value: 9.5, comfort: 7.0 },
    features: { wifi: true, pool: false, gym: false, spa: false, parking: false, restaurant: false, petFriendly: true, bar: false, roomService: false, laundry: true },
    tripMatch: { family: 55, business: 40, friends: 60, solo: 80, pets: 90 },
    platformPrices: [{ platform: 'Agoda', price: 65 }, { platform: 'Booking.com', price: 70 }, { platform: 'Expedia', price: 68 }, { platform: 'MakeMyTrip', price: 72 }],
  },
  {
    id: 3, name: 'Family Fun Resort', location: 'Central Park, New York', price: 155, rating: 4.5, reviews: 3210,
    amenities: ['wifi', 'restaurant', 'fitness-center'], image: 'hotel3', category: 'family', petFriendly: true,
    gradient: ['#fc4a1a', '#f7b733'], accent: '#fc4a1a',
    amenityScores: { cleanliness: 8.5, service: 8.8, location: 8.2, value: 8.0, comfort: 8.7 },
    features: { wifi: true, pool: true, gym: true, spa: false, parking: true, restaurant: true, petFriendly: true, bar: false, roomService: true, laundry: true },
    tripMatch: { family: 96, business: 45, friends: 70, solo: 55, pets: 88 },
    platformPrices: [{ platform: 'Agoda', price: 155 }, { platform: 'Booking.com', price: 162 }, { platform: 'Expedia', price: 158 }, { platform: 'MakeMyTrip', price: 170 }],
  },
  {
    id: 4, name: 'Royal Romance Suites', location: 'Times Square, New York', price: 195, rating: 4.8, reviews: 4521,
    amenities: ['wifi', 'restaurant', 'fitness-center', 'car', 'cafe'], image: 'hotel4', category: 'romantic', petFriendly: false,
    gradient: ['#ee0979', '#ff6a00'], accent: '#ee0979',
    amenityScores: { cleanliness: 9.0, service: 9.4, location: 9.2, value: 8.0, comfort: 9.5 },
    features: { wifi: true, pool: true, gym: false, spa: true, parking: true, restaurant: true, petFriendly: false, bar: true, roomService: true, laundry: true },
    tripMatch: { family: 50, business: 60, friends: 75, solo: 70, pets: 15 },
    platformPrices: [{ platform: 'Agoda', price: 195 }, { platform: 'Booking.com', price: 210 }, { platform: 'Expedia', price: 205 }, { platform: 'MakeMyTrip', price: 215 }],
  },
  {
    id: 5, name: 'Executive Tower Hotel', location: 'SoHo, New York', price: 185, rating: 4.6, reviews: 1245,
    amenities: ['wifi', 'cafe', 'restaurant'], image: 'hotel5', category: 'business', petFriendly: false,
    gradient: ['#2193b0', '#6dd5ed'], accent: '#2193b0',
    amenityScores: { cleanliness: 8.8, service: 9.0, location: 8.5, value: 7.8, comfort: 8.5 },
    features: { wifi: true, pool: false, gym: true, spa: false, parking: true, restaurant: true, petFriendly: false, bar: true, roomService: true, laundry: true },
    tripMatch: { family: 40, business: 92, friends: 65, solo: 85, pets: 10 },
    platformPrices: [{ platform: 'Agoda', price: 185 }, { platform: 'Booking.com', price: 190 }, { platform: 'Expedia', price: 188 }, { platform: 'MakeMyTrip', price: 195 }],
  },
  {
    id: 6, name: 'Adventure Base Camp', location: 'Upper East Side, New York', price: 125, rating: 4.7, reviews: 2890,
    amenities: ['wifi', 'restaurant', 'fitness-center'], image: 'hotel6', category: 'adventure', petFriendly: true,
    gradient: ['#FF416C', '#FF4B2B'], accent: '#FF416C',
    amenityScores: { cleanliness: 8.0, service: 8.2, location: 7.8, value: 8.8, comfort: 7.5 },
    features: { wifi: true, pool: false, gym: true, spa: false, parking: true, restaurant: true, petFriendly: true, bar: true, roomService: false, laundry: false },
    tripMatch: { family: 65, business: 30, friends: 92, solo: 90, pets: 85 },
    platformPrices: [{ platform: 'Agoda', price: 125 }, { platform: 'Booking.com', price: 130 }, { platform: 'Expedia', price: 128 }, { platform: 'MakeMyTrip', price: 135 }],
  },
  {
    id: 7, name: 'Serenity Spa Resort', location: 'Chelsea, New York', price: 175, rating: 4.4, reviews: 1678,
    amenities: ['wifi', 'restaurant', 'cafe', 'fitness-center'], image: 'hotel7', category: 'wellness', petFriendly: false,
    gradient: ['#1D976C', '#93F9B9'], accent: '#1D976C',
    amenityScores: { cleanliness: 9.0, service: 8.5, location: 8.0, value: 7.8, comfort: 9.0 },
    features: { wifi: true, pool: true, gym: true, spa: true, parking: true, restaurant: true, petFriendly: false, bar: false, roomService: true, laundry: true },
    tripMatch: { family: 60, business: 50, friends: 70, solo: 92, pets: 15 },
    platformPrices: [{ platform: 'Agoda', price: 175 }, { platform: 'Booking.com', price: 182 }, { platform: 'Expedia', price: 178 }, { platform: 'MakeMyTrip', price: 188 }],
  },
  {
    id: 8, name: 'The Ritz Platinum', location: 'Battery Park, New York', price: 320, rating: 4.9, reviews: 5234,
    amenities: ['wifi', 'restaurant', 'fitness-center', 'car', 'cafe'], image: 'hotel8', category: 'luxury', petFriendly: false,
    gradient: ['#667eea', '#764ba2'], accent: '#667eea',
    amenityScores: { cleanliness: 9.5, service: 9.8, location: 9.0, value: 7.5, comfort: 9.8 },
    features: { wifi: true, pool: true, gym: true, spa: true, parking: true, restaurant: true, petFriendly: false, bar: true, roomService: true, laundry: true },
    tripMatch: { family: 70, business: 98, friends: 82, solo: 90, pets: 10 },
    platformPrices: [{ platform: 'Agoda', price: 320 }, { platform: 'Booking.com', price: 340 }, { platform: 'Expedia', price: 335 }, { platform: 'MakeMyTrip', price: 350 }],
  },
  {
    id: 9, name: 'Thrifty Stay Motel', location: 'Greenwich Village, New York', price: 55, rating: 4.0, reviews: 2156,
    amenities: ['wifi'], image: 'hotel9', category: 'budget', petFriendly: true,
    gradient: ['#11998e', '#38ef7d'], accent: '#11998e',
    amenityScores: { cleanliness: 6.8, service: 7.0, location: 7.5, value: 9.8, comfort: 6.5 },
    features: { wifi: true, pool: false, gym: false, spa: false, parking: false, restaurant: false, petFriendly: true, bar: false, roomService: false, laundry: false },
    tripMatch: { family: 40, business: 25, friends: 50, solo: 75, pets: 95 },
    platformPrices: [{ platform: 'Agoda', price: 55 }, { platform: 'Booking.com', price: 58 }, { platform: 'Expedia', price: 56 }, { platform: 'MakeMyTrip', price: 60 }],
  },
  {
    id: 10, name: 'Kids Paradise Hotel', location: 'Upper West Side, New York', price: 145, rating: 4.3, reviews: 1432,
    amenities: ['wifi', 'cafe', 'restaurant'], image: 'hotel10', category: 'family', petFriendly: true,
    gradient: ['#fc4a1a', '#f7b733'], accent: '#fc4a1a',
    amenityScores: { cleanliness: 8.2, service: 8.5, location: 7.8, value: 8.2, comfort: 8.5 },
    features: { wifi: true, pool: true, gym: false, spa: false, parking: true, restaurant: true, petFriendly: true, bar: false, roomService: true, laundry: true },
    tripMatch: { family: 94, business: 30, friends: 55, solo: 45, pets: 92 },
    platformPrices: [{ platform: 'Agoda', price: 145 }, { platform: 'Booking.com', price: 150 }, { platform: 'Expedia', price: 148 }, { platform: 'MakeMyTrip', price: 155 }],
  },
  {
    id: 11, name: 'Corporate Suites NYC', location: 'Financial District, New York', price: 195, rating: 4.6, reviews: 3567,
    amenities: ['wifi', 'restaurant', 'fitness-center', 'car'], image: 'hotel11', category: 'business', petFriendly: false,
    gradient: ['#2193b0', '#6dd5ed'], accent: '#2193b0',
    amenityScores: { cleanliness: 9.0, service: 9.2, location: 9.0, value: 8.0, comfort: 8.8 },
    features: { wifi: true, pool: false, gym: true, spa: false, parking: true, restaurant: true, petFriendly: false, bar: true, roomService: true, laundry: true },
    tripMatch: { family: 35, business: 96, friends: 60, solo: 88, pets: 10 },
    platformPrices: [{ platform: 'Agoda', price: 195 }, { platform: 'Booking.com', price: 200 }, { platform: 'Expedia', price: 198 }, { platform: 'MakeMyTrip', price: 208 }],
  },
  {
    id: 12, name: 'Honeymoon Haven', location: 'Tribeca, New York', price: 225, rating: 4.8, reviews: 4123,
    amenities: ['wifi', 'restaurant', 'fitness-center', 'car', 'cafe'], image: 'hotel12', category: 'romantic', petFriendly: false,
    gradient: ['#ee0979', '#ff6a00'], accent: '#ee0979',
    amenityScores: { cleanliness: 9.2, service: 9.5, location: 8.8, value: 7.5, comfort: 9.6 },
    features: { wifi: true, pool: true, gym: false, spa: true, parking: true, restaurant: true, petFriendly: false, bar: true, roomService: true, laundry: true },
    tripMatch: { family: 45, business: 50, friends: 65, solo: 60, pets: 10 },
    platformPrices: [{ platform: 'Agoda', price: 225 }, { platform: 'Booking.com', price: 240 }, { platform: 'Expedia', price: 235 }, { platform: 'MakeMyTrip', price: 245 }],
  },
  {
    id: 13, name: 'Extreme Sports Lodge', location: 'East Village, New York', price: 115, rating: 4.5, reviews: 987,
    amenities: ['wifi', 'cafe', 'fitness-center'], image: 'hotel13', category: 'adventure', petFriendly: true,
    gradient: ['#FF416C', '#FF4B2B'], accent: '#FF416C',
    amenityScores: { cleanliness: 7.8, service: 8.0, location: 8.5, value: 9.0, comfort: 7.5 },
    features: { wifi: true, pool: false, gym: true, spa: false, parking: false, restaurant: false, petFriendly: true, bar: true, roomService: false, laundry: false },
    tripMatch: { family: 50, business: 25, friends: 95, solo: 88, pets: 80 },
    platformPrices: [{ platform: 'Agoda', price: 115 }, { platform: 'Booking.com', price: 120 }, { platform: 'Expedia', price: 118 }, { platform: 'MakeMyTrip', price: 125 }],
  },
  {
    id: 14, name: 'Zen Garden Retreat', location: "Hell's Kitchen, New York", price: 165, rating: 4.7, reviews: 2345,
    amenities: ['wifi', 'restaurant', 'fitness-center'], image: 'hotel14', category: 'wellness', petFriendly: false,
    gradient: ['#1D976C', '#93F9B9'], accent: '#1D976C',
    amenityScores: { cleanliness: 9.2, service: 8.8, location: 8.0, value: 8.2, comfort: 9.2 },
    features: { wifi: true, pool: true, gym: true, spa: true, parking: true, restaurant: true, petFriendly: false, bar: false, roomService: true, laundry: true },
    tripMatch: { family: 55, business: 45, friends: 65, solo: 95, pets: 12 },
    platformPrices: [{ platform: 'Agoda', price: 165 }, { platform: 'Booking.com', price: 172 }, { platform: 'Expedia', price: 168 }, { platform: 'MakeMyTrip', price: 178 }],
  },
  {
    id: 15, name: 'Value Stay Plus', location: 'Brooklyn Heights, New York', price: 75, rating: 4.1, reviews: 1876,
    amenities: ['wifi', 'cafe'], image: 'hotel15', category: 'budget', petFriendly: true,
    gradient: ['#11998e', '#38ef7d'], accent: '#11998e',
    amenityScores: { cleanliness: 7.5, service: 7.2, location: 7.8, value: 9.5, comfort: 7.2 },
    features: { wifi: true, pool: false, gym: false, spa: false, parking: true, restaurant: false, petFriendly: true, bar: false, roomService: false, laundry: true },
    tripMatch: { family: 50, business: 35, friends: 55, solo: 78, pets: 88 },
    platformPrices: [{ platform: 'Agoda', price: 75 }, { platform: 'Booking.com', price: 80 }, { platform: 'Expedia', price: 78 }, { platform: 'MakeMyTrip', price: 82 }],
  },
  {
    id: 16, name: 'Imperial Luxury Palace', location: 'Williamsburg, New York', price: 285, rating: 4.8, reviews: 1234,
    amenities: ['wifi', 'restaurant', 'fitness-center', 'car', 'cafe'], image: 'hotel16', category: 'luxury', petFriendly: false,
    gradient: ['#667eea', '#764ba2'], accent: '#667eea',
    amenityScores: { cleanliness: 9.4, service: 9.2, location: 8.8, value: 7.8, comfort: 9.5 },
    features: { wifi: true, pool: true, gym: true, spa: true, parking: true, restaurant: true, petFriendly: false, bar: true, roomService: true, laundry: true },
    tripMatch: { family: 68, business: 90, friends: 80, solo: 85, pets: 10 },
    platformPrices: [{ platform: 'Agoda', price: 285 }, { platform: 'Booking.com', price: 300 }, { platform: 'Expedia', price: 295 }, { platform: 'MakeMyTrip', price: 310 }],
  },
];

export const getHotelById = (id: number): Hotel | undefined => hotels.find((h) => h.id === id);
export const getHotelsByIds = (ids: number[]): Hotel[] => hotels.filter((h) => ids.includes(h.id));
