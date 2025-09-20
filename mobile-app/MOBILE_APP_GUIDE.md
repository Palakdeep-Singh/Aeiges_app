# CycleGuard Pro Mobile App

A React Native mobile application for the CycleGuard Pro bike security system.

## Features

### 🔐 Authentication
- Google OAuth integration
- Secure session management
- Auto-login with stored tokens

### 📱 Core Features
- **Dashboard**: Real-time bike status, statistics, and recent alerts
- **Bike Management**: Add, edit, delete, and manage multiple bikes
- **Security Alerts**: View and resolve security alerts with severity levels
- **Theft Reporting**: Report stolen bikes with GPS location
- **Emergency Contacts**: Manage emergency contact list
- **Profile Management**: Update user profile and settings

### 🛠 Technical Stack
- **Frontend**: React Native with Expo
- **Navigation**: React Navigation 7
- **State Management**: React Context API
- **HTTP Client**: Axios with cookie authentication
- **UI Components**: Custom components with Ionicons
- **Maps**: Expo Location for GPS features
- **Storage**: Async Storage for session persistence

## Project Structure

```
mobile-app/
├── src/
│   ├── components/          # Reusable UI components
│   ├── context/            # React Context providers
│   │   └── AuthContext.tsx # Authentication state management
│   ├── navigation/         # Navigation configuration
│   │   └── AppNavigator.tsx # Main navigation setup
│   ├── screens/            # App screens
│   │   ├── LoginScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── BikesScreen.tsx
│   │   ├── AlertsScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── AddBikeScreen.tsx
│   │   ├── TheftReportScreen.tsx
│   │   └── EmergencyContactsScreen.tsx
│   ├── services/           # API services
│   │   └── api.ts         # API client and methods
│   ├── config/            # Configuration files
│   │   └── api.ts        # API endpoints and base URL
│   └── types/            # TypeScript type definitions
│       └── index.ts     # Shared types from web app
├── App.tsx              # Main app component
├── app.json            # Expo configuration
└── package.json       # Dependencies and scripts
```

## API Integration

The mobile app connects to the same backend as the web application:

### Backend Features Used
- User authentication with Google OAuth
- Profile management
- Bike CRUD operations
- Security alerts monitoring
- Theft reporting system
- Emergency contacts management
- Real-time dashboard statistics
- Live bike tracking data

### API Configuration
- **Development**: `http://localhost:5173`
- **Production**: `https://01995e0f-5717-75d4-a678-d9763bfe9c94.mocha-app.workers.dev`

## Key Mobile Features

### 📍 Location Services
- GPS integration for theft reporting
- Automatic location detection
- Reverse geocoding for readable addresses

### 📲 Push Notifications (Future)
- Real-time security alerts
- Theft notifications
- Emergency contact alerts

### 📸 Camera Integration (Future)
- Bike photo capture
- Document scanning for serial numbers

### 🔄 Offline Support (Future)
- Local data caching
- Sync when connection restored

## Development Setup

1. **Install Dependencies**
   ```bash
   cd mobile-app
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Run on Device/Simulator**
   - Scan QR code with Expo Go app (iOS/Android)
   - Use iOS Simulator or Android Emulator

## Screens Overview

### 🏠 Dashboard
- Live bike status and statistics
- Recent security alerts
- Quick action buttons
- Real-time GPS tracking display

### 🚲 Bikes Management
- List all registered bikes
- Add new bikes with detailed information
- Mark bikes as stolen/recovered
- Primary bike designation

### 🚨 Security Alerts
- View all security alerts with severity levels
- Filter active vs resolved alerts
- Resolve alerts with timestamps
- Alert type categorization

### 👤 Profile
- User information management
- Emergency contacts access
- Settings and preferences
- Logout functionality

### ➕ Add Bike
- Comprehensive bike registration form
- Photo upload capability
- Primary bike selection
- Validation and error handling

### ⚠️ Theft Reporting
- Quick theft reporting interface
- GPS location integration
- Police report number tracking
- Automatic notifications

### 📞 Emergency Contacts
- Contact list management
- Primary contact designation
- Email and phone integration
- Quick access for emergencies

## Mobile-Specific Optimizations

### 🎨 UI/UX
- Mobile-first design patterns
- Touch-friendly interfaces
- Optimized for various screen sizes
- Dark theme support

### ⚡ Performance
- Lazy loading of screens
- Optimized image handling
- Efficient API call patterns
- Background refresh capabilities

### 🔒 Security
- Secure token storage
- Biometric authentication (future)
- Certificate pinning (production)
- Data encryption at rest

## Future Enhancements

### 📱 Native Features
- [ ] Push notifications
- [ ] Background location tracking
- [ ] Biometric authentication
- [ ] Camera integration
- [ ] Offline mode
- [ ] Widget support

### 🔧 Technical Improvements
- [ ] Redux/Zustand state management
- [ ] React Query for data fetching
- [ ] Flipper debugging integration
- [ ] Automated testing setup
- [ ] CI/CD pipeline

### 🌟 Feature Additions
- [ ] Social bike sharing
- [ ] Community theft alerts
- [ ] Insurance integration
- [ ] Maintenance tracking
- [ ] Route recording
- [ ] Bike marketplace

## Authentication Flow

1. **Login**: User taps "Continue with Google"
2. **OAuth**: Redirects to Google authentication
3. **Session**: Backend creates session token
4. **Storage**: Token stored securely on device
5. **Auto-login**: Automatic login on app restart

## Error Handling

- Network connectivity checks
- Graceful error messages
- Retry mechanisms
- Offline state management
- Loading states for all operations

## Testing

### Manual Testing Checklist
- [ ] Login/logout flow
- [ ] Add/edit/delete bikes
- [ ] View and resolve alerts
- [ ] Report theft with GPS
- [ ] Manage emergency contacts
- [ ] Profile updates
- [ ] Navigation between screens
- [ ] Pull-to-refresh functionality

### Automated Testing (Future)
- Unit tests for services
- Component testing
- Integration tests
- E2E testing with Detox

## Deployment

### Development
- Expo Development Build
- Over-the-air updates

### Production
- App Store Connect (iOS)
- Google Play Console (Android)
- Expo Application Services (EAS)

---

## 🚀 Getting Started

The mobile app is ready to use! Start the development server and begin testing the full bike security system on your mobile device.

**Next Steps:**
1. Test authentication flow
2. Add your first bike
3. Explore security features
4. Set up emergency contacts
5. Test theft reporting

The mobile app provides the same powerful bike security features as the web application, optimized for mobile use with native device capabilities.