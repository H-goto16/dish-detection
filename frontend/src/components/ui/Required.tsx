import { Colors } from '@/constants/Colors';
import { Text } from 'react-native';

const Required = ({ required }: { required: boolean | string | undefined }) => {
  if (!required) return null;
  return (
    <Text
      style={{
        backgroundColor: Colors.light.tint,
      }}
      className=' mb-1 ml-3 rounded px-2 py-1 text-[10px] text-white'
    >
      {typeof required === 'string' ? required : '必須'}
    </Text>
  );
};
export default Required;
