# StayCompare - Hotel Booking Comparison App

## Overview
StayCompare is a modern mobile app for comparing and booking hotels. The app features a beautiful glassmorphism design with a dual-color theme approach.

## Design System

### Color Themes
1. **Purple/Blue Theme (Auth Flow)**
   - Primary: #667eea (Indigo)
   - Secondary: #764ba2 (Purple)
   - Gradient: linear-gradient(135deg, #667eea, #764ba2)

2. **Green/Teal Theme (Main App)**
   - Primary: #11998e (Teal)
   - Secondary: #38ef7d (Light Green)
   - Gradient: linear-gradient(135deg, #11998e, #38ef7d)

### Glassmorphism Design Elements
- Frosted glass cards with blur effect
- Semi-transparent backgrounds
- Subtle borders with low opacity
- Soft shadows

## Screens Implemented

### Onboarding Flow
1. **Splash Screen** - Animated logo with gradient background
2. **Onboarding (3 slides)**
   - Smart Recommendations
   - Compare Hotels Easily
   - Choose the Best Stay
3. **Welcome Screen** - Login/Create Account options

### Auth Flow (Purple/Blue Theme)
1. **Login** - Email, password, social login options
2. **Register** - Full name, email, password
3. **Forgot Password** - Email recovery
4. **OTP Verification** - 4-digit code entry
5. **Create Password** - New password + confirmation

### Main App (Green/Teal Theme)
1. **Home/Search** - Location, dates, travel type, pets toggle
2. **Search Location** - Recent searches, popular destinations
3. **Hotel Comparison** - 3 tabs:
   - Overview (Best choice, quick compare, score chart, sentiment)
   - Scores (Detailed breakdown matrix)
   - Prices (Platform price comparison)

## Technical Stack
- Expo Router (file-based routing)
- React Native
- expo-linear-gradient
- expo-blur (BlurView)
- @expo/vector-icons (Ionicons)
- react-native-safe-area-context

## File Structure
```
/app/frontend/app/
├── _layout.tsx
├── index.tsx (Splash)
├── onboarding.tsx
├── welcome.tsx
├── (auth)/
│   ├── login.tsx
│   ├── register.tsx
│   ├── forgot-password.tsx
│   ├── otp-verification.tsx
│   └── create-password.tsx
└── (main)/
    ├── home.tsx
    ├── search-location.tsx
    └── comparison.tsx
```

## Future Enhancements
- Map view for hotel locations
- Hotel details screen
- Booking confirmation flow
- User profile management
- Push notifications
- Favorites/Wishlist
