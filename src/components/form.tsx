import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { Font, Palette } from '@/constants/design';

export function FormField({
  label,
  ...props
}: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="rgba(255,255,255,0.35)"
        style={styles.input}
        {...props}
      />
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        (pressed || disabled || loading) && styles.buttonPressed,
      ]}>
      {loading ? (
        <ActivityIndicator color="#000" />
      ) : (
        <Text style={styles.buttonText}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  label: {
    color: Palette.whiteMuted,
    fontSize: 13,
    fontFamily: Font.sansMedium,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Palette.white,
    fontSize: 16,
    fontFamily: Font.sans,
  },
  button: {
    backgroundColor: Palette.white,
    borderRadius: 100,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: Font.sansSemibold,
    letterSpacing: 0.5,
  },
});
