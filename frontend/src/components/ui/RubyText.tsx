import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

type RubyTextProps = {
  children: string;
  ruby: string;
};

export const RubyText = ({ children, ruby }: RubyTextProps) => (
  <ThemedView className='inline-flex flex-col items-center'>
    <ThemedText
      style={{ fontSize: 12, lineHeight: 12 }}
      className='text-gray-500 leading-none dark:text-gray-400'
    >
      {ruby}
    </ThemedText>
    <ThemedText className='leading-none'>{children}</ThemedText>
  </ThemedView>
);
