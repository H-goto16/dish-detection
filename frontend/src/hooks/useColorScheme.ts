import { Colors } from '@/constants/Colors';
import { useColorScheme as useColorSchemeNative } from 'react-native';
const useColorScheme = () => {
  const colorScheme = useColorSchemeNative();
  return {
    ...Colors[colorScheme ?? 'light'],
    theme: colorScheme,
  };
};

export default useColorScheme;
