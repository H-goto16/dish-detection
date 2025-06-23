import useColorScheme from '@/hooks/useColorScheme';
import { type Control, Controller, type FieldPath } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';
import { ThemedText } from './ThemedText';
import Required from './ui/Required';

interface ThemedTextInputProps<
  TFormValues extends Record<string, unknown> = Record<string, unknown>,
  TName extends FieldPath<TFormValues> = FieldPath<TFormValues>,
> {
  control?: Control<TFormValues>;
  name?: TName;
  label?: string;
  placeholder?: string;
  error?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  className?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  onKeyPress?: (event: { nativeEvent: { key: string } }) => void;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
  returnKeyType?: 'done' | 'next';
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
  id?: string;
  ref?: React.Ref<TextInput>;
  required?: boolean | string;
}

export const ThemedTextInput = <
  TFormValues extends Record<string, unknown> = Record<string, unknown>,
  TName extends FieldPath<TFormValues> = FieldPath<TFormValues>,
>({
  control,
  name,
  label,
  placeholder,
  error,
  keyboardType = 'default',
  className,
  value,
  onChangeText,
  onBlur,
  onKeyPress,
  secureTextEntry,
  autoCapitalize,
  editable,
  returnKeyType,
  onSubmitEditing,
  blurOnSubmit,
  id,
  ref,
  required,
}: ThemedTextInputProps<TFormValues, TName>) => {
  const colors = useColorScheme();
  const isDark = colors.theme === 'dark';

  const renderInput = () => {
    if (control && name) {
      return (
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, value } }) => (
            <TextInput
              className={`my-3 rounded-lg border p-4 ${
                isDark
                  ? 'border-gray-700 bg-gray-800 text-white'
                  : 'border-gray-300 bg-white text-gray-900'
              } ${error ? 'border-red-500' : ''} ${className || ''}`}
              onChangeText={onChange}
              value={String(value || '')}
              placeholder={placeholder}
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              keyboardType={keyboardType}
              secureTextEntry={secureTextEntry}
              autoCapitalize={autoCapitalize}
              editable={editable}
              returnKeyType={returnKeyType}
              onSubmitEditing={onSubmitEditing}
              blurOnSubmit={blurOnSubmit}
              id={id}
              onKeyPress={onKeyPress}
              ref={ref}
            />
          )}
        />
      );
    }

    return (
      <TextInput
        className={`rounded-lg border p-2 ${
          isDark
            ? 'border-gray-700 bg-gray-800 text-white'
            : 'border-gray-300 bg-white text-gray-900'
        } ${error ? 'border-red-500' : ''} ${className || ''}`}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        editable={editable}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        blurOnSubmit={blurOnSubmit}
        id={id}
        onKeyPress={onKeyPress}
        ref={ref}
      />
    );
  };

  return (
    <View className='mb-4'>
      <View className='flex-row items-center'>
        {label && <ThemedText className={'mb-1'}>{label}</ThemedText>}
        {required && <Required required={required} />}
      </View>
      {renderInput()}
      {error && <Text className='mt-1 text-red-500 text-sm'>{error}</Text>}
    </View>
  );
};
