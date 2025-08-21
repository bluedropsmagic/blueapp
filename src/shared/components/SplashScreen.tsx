import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withDelay,
  runOnJS,
  Easing
} from 'react-native-reanimated';
import { BlueDropsLogo } from '@/components/BlueDropsLogo';
import { theme } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

export const SplashScreen = ({ onAnimationComplete }: SplashScreenProps) => {
  // Valores animados
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const backgroundOpacity = useSharedValue(1);
  const circleScale = useSharedValue(0);
  const circleOpacity = useSharedValue(0);
  
  // Animação de entrada
  useEffect(() => {
    // Sequência de animações
    const startAnimation = () => {
      // 1. Círculo de fundo aparece
      circleOpacity.value = withTiming(0.1, { duration: 600 });
      circleScale.value = withTiming(1, { 
        duration: 800, 
        easing: Easing.out(Easing.cubic) 
      });
      
      // 2. Logo aparece com delay
      logoOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
      logoScale.value = withDelay(300, withSequence(
        withTiming(1.2, { duration: 400, easing: Easing.out(Easing.back(1.2)) }),
        withTiming(1, { duration: 200 })
      ));
      
      // 3. Fade out após 2.5 segundos
      backgroundOpacity.value = withDelay(2500, withTiming(0, { 
        duration: 500 
      }, () => {
        runOnJS(onAnimationComplete)();
      }));
    };

    startAnimation();
  }, []);

  // Estilos animados
  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const circleStyle = useAnimatedStyle(() => ({
    opacity: circleOpacity.value,
    transform: [{ scale: circleScale.value }],
  }));

  const logoContainerStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  return (
    <Animated.View style={[styles.container, backgroundStyle]}>
      {/* Círculo de fundo decorativo */}
      <Animated.View style={[styles.backgroundCircle, circleStyle]} />
      
      {/* Container do logo */}
      <Animated.View style={[styles.logoContainer, logoContainerStyle]}>
        <BlueDropsLogo 
          width={240} 
          height={61} 
          color={theme.colors.primary[600]} 
        />
      </Animated.View>
      
      {/* Pontos de loading decorativos */}
      <View style={styles.dotsContainer}>
        <LoadingDot delay={0} />
        <LoadingDot delay={200} />
        <LoadingDot delay={400} />
      </View>
    </Animated.View>
  );
};

// Componente para os pontos de loading
const LoadingDot = ({ delay }: { delay: number }) => {
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(1);

  useEffect(() => {
    const animate = () => {
      opacity.value = withDelay(delay, withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0.3, { duration: 400 })
      ));
      scale.value = withDelay(delay, withSequence(
        withTiming(1.2, { duration: 400 }),
        withTiming(1, { duration: 400 })
      ));
    };

    animate();
    
    // Repete a animação
    const interval = setInterval(animate, 1200);
    return () => clearInterval(interval);
  }, [delay]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={[styles.dot, dotStyle]} />;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  backgroundCircle: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: (width * 1.5) / 2,
    backgroundColor: theme.colors.primary[50],
    top: height / 2 - (width * 1.5) / 2,
    left: width / 2 - (width * 1.5) / 2,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    position: 'absolute',
    bottom: height * 0.25,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary[400],
  },
});