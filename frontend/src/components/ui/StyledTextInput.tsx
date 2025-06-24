import { StyleSheet, TextInput, useColorScheme } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

interface StyledTextInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  style?: any;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

export const StyledTextInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  style,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
}: StyledTextInputProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ThemedView style={[styles.container, style]}>
      {label && (
        <ThemedText style={styles.label}>
          {label}
        </ThemedText>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDark ? '#374151' : '#F9FAFB',
            borderColor: isDark ? '#4B5563' : '#D1D5DB',
            color: isDark ? '#F9FAFB' : '#111827',
          },
          disabled && styles.disabled,
          multiline && { height: numberOfLines * 24 + 24 },
        ]}
        placeholder={placeholder}
        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        value={value}
        onChangeText={onChangeText}
        editable={!disabled}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 3,
  },
  disabled: {
    opacity: 0.6,
  },
});