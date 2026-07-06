// Route wrapper. Platform-specific UI lives in components/screens:
//   watch.ios.tsx  → SwiftUI shell (@expo/ui/swift-ui) embedding the RN carousel/grid
//   watch.tsx      → React Native on Android and web
export { default } from '@/components/screens/watch';
