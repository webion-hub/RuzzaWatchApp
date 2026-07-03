import {
  LibreBaskerville_400Regular,
  LibreBaskerville_400Regular_Italic,
  LibreBaskerville_700Bold,
} from '@expo-google-fonts/libre-baskerville';
import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppBackground } from '@/components/app-background';
import { Palette } from '@/constants/design';
import { AuthProvider } from '@/context/auth-context';
import { CartProvider } from '@/context/cart-context';

SplashScreen.preventAutoHideAsync();

const transparent = { backgroundColor: 'transparent' } as const;

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'GeneralSans-Regular': require('@/assets/fonts/GeneralSans-Regular.ttf'),
    'GeneralSans-Medium': require('@/assets/fonts/GeneralSans-Medium.ttf'),
    'GeneralSans-Semibold': require('@/assets/fonts/GeneralSans-Semibold.ttf'),
    LibreBaskerville_400Regular,
    LibreBaskerville_400Regular_Italic,
    LibreBaskerville_700Bold,
  });

  const onReady = useCallback(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={styles.root} onLayout={onReady}>
      <ThemeProvider value={DarkTheme}>
        <AuthProvider>
          <CartProvider>
            <View style={styles.root}>
              <AppBackground />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: transparent,
                  animation: 'slide_from_right',
                }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="product/[handle]" />
                <Stack.Screen name="account/index" />
                <Stack.Screen name="account/login" />
                <Stack.Screen name="account/register" />
              </Stack>
            </View>
            <StatusBar style="light" />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.bgBottom,
  },
});
