import useColorScheme from '@/hooks/useColorScheme';
import { cn } from '@/lib/utils';
import { Text, type TextProps } from 'react-native';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  className?: string;
};

export const ThemedText = ({
  className,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) => {
  const colors = useColorScheme();

  return (
    <Text
      className={cn(
        'text-gray-900 dark:text-white',
        type === 'default' && 'text-base leading-6',
        type === 'defaultSemiBold' && 'text-base leading-6 font-semibold',
        type === 'title' && 'text-4xl font-bold leading-8',
        type === 'subtitle' && 'text-xl font-bold',
        type === 'link' && 'text-base leading-7 text-blue-600 dark:text-blue-400',
        className
      )}
      {...rest}
    />
  );
};
