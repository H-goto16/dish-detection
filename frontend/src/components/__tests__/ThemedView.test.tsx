import { Text } from 'react-native';
import renderer from 'react-test-renderer';
import { ThemedView } from '../ThemedView';

// Mock useColorScheme hook
jest.mock('@/hooks/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    background: '#ffffff',
    text: '#000000',
    theme: 'light',
  })),
}));

describe('ThemedView', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<ThemedView />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders with children', () => {
    const tree = renderer
      .create(
        <ThemedView>
          <Text>Test content</Text>
        </ThemedView>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders without crashing', () => {
    const component = renderer.create(<ThemedView />);
    expect(component).toBeTruthy();
  });

  it('renders with custom style', () => {
    const customStyle = {
      padding: 10,
      margin: 5,
    };

    const tree = renderer.create(<ThemedView style={customStyle} />).toJSON();

    expect(tree).toBeTruthy();
    if (tree && !Array.isArray(tree)) {
      expect(tree.props.style).toEqual([
        { backgroundColor: '#ffffff' },
        customStyle,
      ]);
    }
  });

  it('renders with testID prop', () => {
    const tree = renderer
      .create(<ThemedView testID='themed-view-test' />)
      .toJSON();

    expect(tree).toBeTruthy();
    if (tree && !Array.isArray(tree)) {
      expect(tree.props.testID).toBe('themed-view-test');
    }
  });

  it('passes through other props', () => {
    const tree = renderer
      .create(<ThemedView accessible={true} accessibilityLabel='Test view' />)
      .toJSON();

    expect(tree).toBeTruthy();
    if (tree && !Array.isArray(tree)) {
      expect(tree.props.accessible).toBe(true);
      expect(tree.props.accessibilityLabel).toBe('Test view');
    }
  });
});
