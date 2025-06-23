import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type ErrorDisplayProps = {
  message?: string;
  details?: string;
  className?: string;
};

/**
 * 共通のエラー表示コンポーネント
 */
const ErrorDisplay = ({
  message = '読み込みに失敗しました',
  details,
  className = '',
}: ErrorDisplayProps) => {
  return (
    <ThemedView className={`items-center justify-center p-4 ${className}`}>
      <ThemedText className='mb-1 text-center font-medium'>
        {message}
      </ThemedText>
      {details && (
        <ThemedText className='text-center text-gray-500 text-sm'>
          {details}
        </ThemedText>
      )}
    </ThemedView>
  );
};

export default ErrorDisplay;
