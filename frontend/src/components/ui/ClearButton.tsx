import useColorScheme from '@/hooks/useColorScheme';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

type ClearButtonProps = {
  onPress: () => void;
  visible?: boolean;
};

const ClearButton = ({ onPress, visible = true }: ClearButtonProps) => {
  const colors = useColorScheme();

  if (!visible) return null;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <Text style={[styles.text, { color: colors.text }]}>×</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    lineHeight: 40,
    fontSize: 36,
  },
});

export default ClearButton;
