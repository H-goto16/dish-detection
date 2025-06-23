import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorView = ({
  message = 'データの読み込み中にエラーが発生しました',
  onRetry,
}: ErrorViewProps) => {
  return (
    <ThemedView className='flex-1 items-center justify-center p-5'>
      <MaterialIcons
        name='error-outline'
        size={64}
        color='#FF3B30'
        style={{ marginBottom: 16 }}
      />
      <ThemedText className='mb-3 text-center font-bold text-2xl'>
        エラーが発生しました
      </ThemedText>
      <ThemedText className='mb-4 text-center text-base'>{message}</ThemedText>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className='rounded-md bg-blue-500 px-4 py-2'
        >
          <ThemedText className='font-semibold text-base text-white'>
            再試行
          </ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
};

export default ErrorView;
