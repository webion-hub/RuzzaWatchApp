import { Stack } from 'expo-router';

import { Palette } from '@/constants/design';

/**
 * Stack wrapper for the search tab — it exists so the search screen has a native
 * header, which is what hosts the native iOS search bar (`headerSearchBarOptions`).
 * Large-title style so the search field expands under the title (iOS).
 */
export default function SearchStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLargeTitle: false,
        headerStyle: { backgroundColor: Palette.bgBottom },
        headerTintColor: Palette.white,
        headerTitleStyle: { color: Palette.white, fontFamily: 'GeneralSans-Semibold' },
        contentStyle: { backgroundColor: 'transparent' },
      }}
    />
  );
}
