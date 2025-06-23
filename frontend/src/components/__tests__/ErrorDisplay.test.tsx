import renderer from 'react-test-renderer';
import ErrorDisplay from '../ErrorDisplay';

// Mock ThemedText and ThemedView components
jest.mock('../ThemedText', () => ({
  ThemedText: ({
    children,
    ...props
  }: { children?: React.ReactNode; [key: string]: unknown }) => {
    const { Text } = require('react-native');
    return <Text {...props}>{children}</Text>;
  },
}));

jest.mock('../ThemedView', () => ({
  ThemedView: ({
    children,
    ...props
  }: { children?: React.ReactNode; [key: string]: unknown }) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
}));

describe('ErrorDisplay', () => {
  it('renders correctly with default message', () => {
    const tree = renderer.create(<ErrorDisplay />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders with custom message', () => {
    const tree = renderer
      .create(<ErrorDisplay message='カスタムエラーメッセージ' />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders with message and details', () => {
    const tree = renderer
      .create(
        <ErrorDisplay
          message='データの取得に失敗しました'
          details='ネットワーク接続を確認してください'
        />,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders with custom className', () => {
    const tree = renderer
      .create(
        <ErrorDisplay
          message='エラーが発生しました'
          className='custom-error-class'
        />,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders without details when not provided', () => {
    const component = renderer.create(
      <ErrorDisplay message='エラーメッセージのみ' />,
    );
    const tree = component.toJSON();

    expect(tree).toBeTruthy();
    // details がない場合は1つのTextコンポーネントのみ
    if (tree && !Array.isArray(tree)) {
      expect(tree.children).toHaveLength(1);
    }
  });

  it('renders with details when provided', () => {
    const component = renderer.create(
      <ErrorDisplay message='メインメッセージ' details='詳細メッセージ' />,
    );
    const tree = component.toJSON();

    expect(tree).toBeTruthy();
    // details がある場合は2つのTextコンポーネント
    if (tree && !Array.isArray(tree)) {
      expect(tree.children).toHaveLength(2);
    }
  });

  it('handles empty strings', () => {
    const tree = renderer
      .create(<ErrorDisplay message='' details='' className='' />)
      .toJSON();
    expect(tree).toBeTruthy();
  });

  it('handles all props as undefined', () => {
    const tree = renderer
      .create(
        <ErrorDisplay
          message={undefined}
          details={undefined}
          className={undefined}
        />,
      )
      .toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders without crashing', () => {
    const component = renderer.create(<ErrorDisplay />);
    expect(component).toBeTruthy();
  });
});
