import { Text } from 'react-native';
import renderer from 'react-test-renderer';
import { ExternalLink } from '../ExternalLink';

// Mock expo-web-browser
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
}));

// Mock expo-router Link
jest.mock('expo-router', () => ({
  Link: ({
    children,
    ...props
  }: { children?: React.ReactNode; [key: string]: unknown }) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
}));

describe('ExternalLink', () => {
  it('renders correctly with simple text', () => {
    const tree = renderer
      .create(
        <ExternalLink href='https://example.com'>Visit Example</ExternalLink>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly with complex children', () => {
    const tree = renderer
      .create(
        <ExternalLink href='https://example.com'>
          <Text>Visit Website</Text>
        </ExternalLink>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders without crashing', () => {
    const component = renderer.create(
      <ExternalLink href='https://example.com'>Visit Example</ExternalLink>,
    );
    expect(component).toBeTruthy();
  });

  it('handles empty href', () => {
    const component = renderer.create(
      <ExternalLink href=''>Empty Link</ExternalLink>,
    );
    expect(component.toJSON()).toBeTruthy();
  });

  it('handles different href protocols', () => {
    const httpTree = renderer
      .create(<ExternalLink href='http://example.com'>HTTP Link</ExternalLink>)
      .toJSON();

    const httpsTree = renderer
      .create(
        <ExternalLink href='https://example.com'>HTTPS Link</ExternalLink>,
      )
      .toJSON();

    expect(httpTree).toBeTruthy();
    expect(httpsTree).toBeTruthy();
  });
});
