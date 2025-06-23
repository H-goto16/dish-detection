import { View } from 'react-native';
import { ThemedView } from './ThemedView';

const Loading = () => {
  return (
    <ThemedView className='absolute inset-0 items-center justify-center bg-transparent'>
      <View className='h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent' />
    </ThemedView>
  );
};

export default Loading;
