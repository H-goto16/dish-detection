import useColorScheme from '@/hooks/useColorScheme';
import { useEffect } from 'react';
import { Animated, Image, StyleSheet } from 'react-native';
import { ThemedView } from './ThemedView';
interface SplashScreenProps {
  onAnimationComplete: () => void;
}

export const CustomSplashScreen: React.FC<SplashScreenProps> = ({
  onAnimationComplete,
}) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const colors = useColorScheme();

  useEffect(() => {
    // 複数のアニメーションを順番に実行
    Animated.sequence([
      // フェードインと拡大アニメーション
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // 少し待機
      Animated.delay(500),
      // フェードアウト
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // アニメーション完了時にコールバックを呼び出す
      onAnimationComplete();
    });
  }, [fadeAnim, scaleAnim, onAnimationComplete]);

  // White theme uses dark logo, dark theme uses white logo
  const logoSource =
    colors.theme === 'dark'
      ? require('@/assets/images/logo-white.png')
      : require('@/assets/images/logo-dark.png');

  return (
    <ThemedView style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image source={logoSource} style={styles.logo} resizeMode='contain' />
      </Animated.View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});
