import {
  LibreBaskerville_400Regular,
  LibreBaskerville_400Regular_Italic,
  LibreBaskerville_500Medium,
  LibreBaskerville_500Medium_Italic,
} from '@expo-google-fonts/libre-baskerville';
import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider, router } from 'expo-router';
import type { ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppBackground } from '@/components/app-background';
import { MessageScreen } from '@/components/message-screen';
import { Palette } from '@/constants/design';
import { AuthProvider } from '@/context/auth-context';
import { CartProvider } from '@/context/cart-context';

/**
 * Global error boundary (expo-router picks up this named export). Catches any
 * render error in the app and shows a branded recovery screen instead of a
 * blank/crash, always offering a way back to the home tab.
 */
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <MessageScreen
      title="Qualcosa è andato storto"
      message="Si è verificato un problema imprevisto. Puoi riprovare o tornare alla home."
      actionLabel="TORNA ALLA HOME"
      onAction={() => {
        retry();
        router.replace('/');
      }}
      secondaryLabel="Riprova"
      onSecondary={() => retry()}
    />
  );
}

SplashScreen.preventAutoHideAsync();

const transparent = { backgroundColor: 'transparent' } as const;

// Transparent navigator background so the fixed <AppBackground/> (marble + dark
// mask) shows through behind every screen. Without this, the navigator paints
// DarkTheme's opaque background over it (the marble never showed on Android).
const NavigationTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: 'transparent' },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'GeneralSans-Regular': require('@/assets/fonts/GeneralSans-Regular.ttf'),
    'GeneralSans-Medium': require('@/assets/fonts/GeneralSans-Medium.ttf'),
    'GeneralSans-Semibold': require('@/assets/fonts/GeneralSans-Semibold.ttf'),
    LibreBaskerville_400Regular,
    LibreBaskerville_400Regular_Italic,
    LibreBaskerville_500Medium,
    LibreBaskerville_500Medium_Italic,
  });

  const onReady = useCallback(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={styles.root} onLayout={onReady}>
      <ThemeProvider value={NavigationTheme}>
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
