import { useColorScheme as useColorSchemeNative } from 'react-native';
import useColorScheme from '../useColorScheme';

// Mock react-native useColorScheme
jest.mock('react-native', () => ({
  useColorScheme: jest.fn(),
}));

// Mock Colors constant
jest.mock('@/constants/Colors', () => ({
  Colors: {
    light: {
      text: '#000000',
      background: '#ffffff',
      primary: '#007AFF',
    },
    dark: {
      text: '#ffffff',
      background: '#1c1c1e',
      primary: '#0A84FF',
    },
  },
}));

const mockUseColorSchemeNative = useColorSchemeNative as jest.MockedFunction<
  typeof useColorSchemeNative
>;

describe('useColorScheme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return light theme colors and theme when colorScheme is light', () => {
    mockUseColorSchemeNative.mockReturnValue('light');

    const result = useColorScheme();

    expect(result).toEqual({
      text: '#000000',
      background: '#ffffff',
      primary: '#007AFF',
      theme: 'light',
    });
  });

  it('should return dark theme colors and theme when colorScheme is dark', () => {
    mockUseColorSchemeNative.mockReturnValue('dark');

    const result = useColorScheme();

    expect(result).toEqual({
      text: '#ffffff',
      background: '#1c1c1e',
      primary: '#0A84FF',
      theme: 'dark',
    });
  });

  it('should return light theme colors when colorScheme is null', () => {
    mockUseColorSchemeNative.mockReturnValue(null);

    const result = useColorScheme();

    expect(result).toEqual({
      text: '#000000',
      background: '#ffffff',
      primary: '#007AFF',
      theme: null,
    });
  });

  it('should return light theme colors when colorScheme is undefined', () => {
    mockUseColorSchemeNative.mockReturnValue(undefined);

    const result = useColorScheme();

    expect(result).toEqual({
      text: '#000000',
      background: '#ffffff',
      primary: '#007AFF',
      theme: undefined,
    });
  });

  it('should call useColorScheme from react-native', () => {
    mockUseColorSchemeNative.mockReturnValue('light');

    useColorScheme();

    expect(mockUseColorSchemeNative).toHaveBeenCalledTimes(1);
  });

  it('should have theme property in returned object', () => {
    mockUseColorSchemeNative.mockReturnValue('dark');

    const result = useColorScheme();

    expect(result).toHaveProperty('theme');
    expect(result.theme).toBe('dark');
  });
});
