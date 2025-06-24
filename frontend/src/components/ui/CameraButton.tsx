import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';
import { ThemedText } from '../ThemedText';

interface CameraButtonProps {
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'purple';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Ionicons.glyphMap;
  children?: ReactNode;
  style?: any;
}

interface IconButtonProps {
  onPress: () => void;
  disabled?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  size?: number;
  style?: any;
  backgroundColor?: string;
}

interface CaptureButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const CameraButton = ({
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  icon,
  children,
  style,
}: CameraButtonProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primary;
      case 'secondary':
        return isDark ? styles.secondaryDark : styles.secondary;
      case 'success':
        return styles.success;
      case 'danger':
        return styles.danger;
      case 'purple':
        return styles.purple;
      default:
        return styles.primary;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.small;
      case 'medium':
        return styles.medium;
      case 'large':
        return styles.large;
      default:
        return styles.medium;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'secondary':
        return isDark ? '#F9FAFB' : '#374151';
      default:
        return 'white';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyle(),
        getSizeStyle(),
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={20}
          color={getTextColor()}
          style={children ? styles.iconWithText : undefined}
        />
      )}
      {children && (
        <ThemedText style={[styles.buttonText, { color: getTextColor() }]}>
          {children}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
};

export const IconButton = ({
  onPress,
  disabled = false,
  icon,
  size = 32,
  style,
  backgroundColor = 'rgba(0, 0, 0, 0.5)',
}: IconButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.iconButton,
        { backgroundColor },
        disabled && styles.disabledIcon,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={size} color="white" />
    </TouchableOpacity>
  );
};

export const CaptureButton = ({
  onPress,
  disabled = false,
}: CaptureButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.captureButton, disabled && styles.captureButtonDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={[styles.captureButtonInner, disabled && styles.captureButtonInnerDisabled]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  primary: {
    backgroundColor: '#3B82F6',
  },
  secondary: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondaryDark: {
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  success: {
    backgroundColor: '#10B981',
  },
  danger: {
    backgroundColor: '#EF4444',
  },
  purple: {
    backgroundColor: '#8B5CF6',
  },
  disabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 52,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  iconWithText: {
    marginRight: 8,
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledIcon: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    shadowOpacity: 0,
    elevation: 0,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  captureButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'white',
    borderWidth: 3,
    borderColor: '#374151',
  },
  captureButtonInnerDisabled: {
    borderColor: '#9CA3AF',
  },
});