# Urban Clean - Frontend Mobile App

React Native mobile application built with Expo for the Urban Clean Society Service Booking platform.

## Prerequisites

- Node.js v20+ LTS
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Studio (for Android development)
- Expo Go app on your mobile device (for testing)

## Installation

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Run on specific platform**:
   ```bash
   npm run ios     # Run on iOS simulator
   npm run android # Run on Android emulator
   npm run web     # Run in web browser
   ```

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Screen components
│   ├── navigation/     # Navigation configuration
│   ├── contexts/       # React Context providers
│   ├── services/       # API service layer
│   └── utils/          # Helper functions and utilities
├── assets/             # Images, fonts, and other static assets
├── App.tsx             # Root component
├── app.json            # Expo configuration
├── babel.config.js     # Babel configuration with module resolver
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies and scripts
```

## Key Features Configured

✅ TypeScript support
✅ Path aliases (@components, @screens, etc.) via babel-plugin-module-resolver
✅ React Navigation ready
✅ React Native Paper UI library
✅ Axios for API calls
✅ Zustand for state management

## Path Aliases

You can use the following path aliases in your imports:

```typescript
import Button from '@components/Button';
import HomeScreen from '@screens/HomeScreen';
import { api } from '@services/api';
import { formatDate } from '@utils/dateUtils';
```

## Environment Setup

Create a `.env` file in the frontend directory:

```env
API_BASE_URL=http://localhost:5000/api/v1
```

## Troubleshooting

### Missing babel-plugin-module-resolver
If you see an error about `babel-plugin-module-resolver`, run:
```bash
npm install --save-dev babel-plugin-module-resolver
```

### Missing icon.png
The placeholder icons are included. For production, replace files in `assets/` folder:
- `icon.png` - 1024x1024px app icon
- `adaptive-icon.png` - 1024x1024px Android adaptive icon
- `splash.png` - 1284x2778px splash screen
- `favicon.png` - 48x48px web favicon

### Metro bundler cache issues
```bash
expo start -c
```

## Development Guidelines

- Use TypeScript for all new components
- Follow the folder structure for organization
- Use path aliases instead of relative imports
- Test on both iOS and Android platforms

## Next Steps

1. Implement authentication screens
2. Create navigation structure
3. Build API service layer
4. Implement booking flow
5. Add payment integration

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
