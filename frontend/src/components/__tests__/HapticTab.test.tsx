import renderer from 'react-test-renderer';
import { HapticTab } from '../HapticTab';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

// Mock @react-navigation/elements
jest.mock('@react-navigation/elements', () => ({
  PlatformPressable: ({
    children,
    ...props
  }: { children?: React.ReactNode; [key: string]: unknown }) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
}));

describe('HapticTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_OS = 'ios';
  });

  const mockProps = {
    onPress: jest.fn(),
    onPressIn: jest.fn(),
    children: 'Tab Content',
  };

  it('renders correctly', () => {
    const tree = renderer.create(<HapticTab {...mockProps} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders without crashing', () => {
    const component = renderer.create(<HapticTab {...mockProps} />);
    expect(component).toBeTruthy();
  });

  it('renders with different props', () => {
    const customProps = {
      onPress: jest.fn(),
      children: 'Custom Tab',
      testID: 'custom-tab',
    };

    const tree = renderer.create(<HapticTab {...customProps} />).toJSON();
    expect(tree).toBeTruthy();
  });

  it('handles empty children', () => {
    const propsWithEmptyChildren = {
      onPress: jest.fn(),
      children: null,
    };

    const component = renderer.create(
      <HapticTab {...propsWithEmptyChildren} />,
    );
    expect(component.toJSON()).toBeTruthy();
  });
});
