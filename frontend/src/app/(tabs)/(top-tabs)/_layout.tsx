import useColorScheme from '@/hooks/useColorScheme';
import {
  type MaterialTopTabNavigationEventMap,
  type MaterialTopTabNavigationOptions,
  createMaterialTopTabNavigator,
} from '@react-navigation/material-top-tabs';
import type {
  ParamListBase,
  TabNavigationState,
} from '@react-navigation/native';
import { withLayoutContext } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

const TabLayout = () => {
  const color = useColorScheme();
  const inserts = useSafeAreaInsets();
  return (
    <MaterialTopTabs
      style={{
        paddingTop: inserts.top,
      }}
      screenOptions={{
        tabBarActiveTintColor: color.tabIconSelected,
        tabBarInactiveTintColor: color.tabIconDefault,
        tabBarIndicatorStyle: {
          backgroundColor: color.tabIconSelected,
        },
        tabBarLabelStyle: { fontWeight: '700' },
        lazy: true,
        animationEnabled: false,
        swipeEnabled: false,
      }}
    >
      <MaterialTopTabs.Screen
        name='class'
        options={{ title: 'class manager' }}
      />
      <MaterialTopTabs.Screen
        name='fine-tuning'
        options={{ title: 'training' }}
      />
    </MaterialTopTabs>
  );
};

export default TabLayout;
