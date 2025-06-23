import type { ReactNode } from 'react';
import renderer from 'react-test-renderer';
import Loading from '../Loading';

// Mock ThemedView component
jest.mock('../ThemedView', () => ({
  ThemedView: ({
    children,
    ...props
  }: { children?: ReactNode; [key: string]: unknown }) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
}));

describe('Loading', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<Loading />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders without crashing', () => {
    const component = renderer.create(<Loading />);
    expect(component).toBeTruthy();
  });

  it('renders with correct structure', () => {
    const tree = renderer.create(<Loading />).toJSON();

    // Basic structure validation
    expect(tree).toBeTruthy();
    if (tree && !Array.isArray(tree)) {
      expect(tree.type).toBe('View');
      expect(tree.children).toHaveLength(1);
    }
  });
});
