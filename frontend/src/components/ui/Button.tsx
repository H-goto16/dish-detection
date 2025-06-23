import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import useColorScheme from '@/hooks/useColorScheme';
import { cloneElement } from 'react';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import { Pressable, StyleSheet } from 'react-native';

export type ButtonType = 'primary' | 'default' | 'danger';

export interface ButtonProps extends PressableProps {
  type?: ButtonType;
  icon?: React.ReactElement<{ color?: string }>;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#ff6640',
  },
  danger: {
    backgroundColor: '#ef4444',
  },
  default: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  defaultDark: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  disabled: {
    backgroundColor: '#9ca3af',
    borderColor: '#9ca3af',
  },
  disabledDark: {
    backgroundColor: '#4b5563',
    borderColor: '#4b5563',
  },
  primaryText: {
    color: 'white',
  },
  dangerText: {
    color: 'white',
  },
  defaultText: {
    color: 'black',
  },
  defaultTextDark: {
    color: 'white',
  },
  disabledText: {
    color: '#6b7280',
  },
  disabledTextDark: {
    color: '#9ca3af',
  },
  spacer: {
    width: 8,
  },
  iconContainer: {
    backgroundColor: '#ff6640',
    padding: 8,
    borderRadius: 8,
  },
  defaultIconContainer: {
    backgroundColor: 'white',
  },
  defaultDarkIconContainer: {
    backgroundColor: '#374151',
  },
});

export const Button = ({
  type = 'default',
  icon,
  children,
  style,
  disabled,
  ...props
}: ButtonProps) => {
  const colors = useColorScheme();
  const isDark = colors.theme === 'dark';

  const buttonStyle = [
    styles.base,
    disabled
      ? isDark
        ? styles.disabledDark
        : styles.disabled
      : type === 'primary'
        ? styles.primary
        : type === 'danger'
          ? styles.danger
          : isDark
            ? styles.defaultDark
            : styles.default,
    style,
  ] as StyleProp<ViewStyle>;

  const textStyle = disabled
    ? isDark
      ? styles.disabledTextDark
      : styles.disabledText
    : type === 'primary'
      ? styles.primaryText
      : type === 'danger'
        ? styles.dangerText
        : isDark
          ? styles.defaultTextDark
          : styles.defaultText;

  const iconContainerStyle = [
    styles.iconContainer,
    disabled
      ? isDark
        ? styles.disabledDark
        : styles.disabled
      : type === 'primary' || type === 'danger'
        ? null
        : isDark
          ? styles.defaultDarkIconContainer
          : styles.defaultIconContainer,
  ];

  const iconColor = disabled
    ? isDark
      ? '#9ca3af'
      : '#6b7280'
    : type === 'primary' || type === 'danger' || isDark
      ? 'white'
      : 'black';

  const iconWithColor = icon ? cloneElement(icon, { color: iconColor }) : null;

  return (
    <Pressable style={buttonStyle} {...props}>
      {iconWithColor && (
        <ThemedView style={iconContainerStyle}>{iconWithColor}</ThemedView>
      )}
      {icon && children && <ThemedView style={styles.spacer} />}
      {typeof children === 'string' ? (
        <ThemedText style={textStyle}>{children}</ThemedText>
      ) : (
        children
      )}
    </Pressable>
  );
};
