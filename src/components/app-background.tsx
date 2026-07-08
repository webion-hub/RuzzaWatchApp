import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground, StyleSheet } from 'react-native';

/**
 * Fixed full-screen background: the marble photo (`assets/images/marble-bg.png`)
 * with a dark mask over it, so the marble veining stays visible but the app
 * keeps its dark look (white text stays legible). Rendered once behind all
 * content in the root layout — shared by iOS and Android.
 */
export function AppBackground() {
  return (
    <ImageBackground
      source={require('@/assets/images/marble-bg.png')}
      resizeMode="cover"
      style={[StyleSheet.absoluteFill, styles.noTouch]}>
      <LinearGradient
        colors={['rgba(0,0,0,0.72)', 'rgba(0,0,0,0.82)']}
        style={StyleSheet.absoluteFill}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  noTouch: { pointerEvents: 'none' },
});
