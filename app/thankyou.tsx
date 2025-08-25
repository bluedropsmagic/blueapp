import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BlueDropsLogo } from '@/components/BlueDropsLogo';
import { CircleCheck as CheckCircle, Smartphone, ArrowRight, Package, Bell, ChartBar as BarChart3 } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  withSpring,
  withSequence,
  Easing
} from 'react-native-reanimated';

export default function ThankYouScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Animation values
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const checkOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0.5);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);
  const buttonOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.9);

  useEffect(() => {
    // Sequence of entrance animations
    // 1. Logo appears
    logoOpacity.value = withTiming(1, { duration: 600 });
    logoScale.value = withSpring(1, { damping: 15, stiffness: 100 });

    // 2. Check mark with bounce
    checkOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    checkScale.value = withDelay(400, withSequence(
      withSpring(1.2, { damping: 8, stiffness: 150 }),
      withSpring(1, { damping: 12, stiffness: 100 })
    ));

    // 3. Title slides up
    titleOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    titleTranslateY.value = withDelay(800, withSpring(0, { damping: 12, stiffness: 100 }));

    // 4. Content slides up
    contentOpacity.value = withDelay(1200, withTiming(1, { duration: 600 }));
    contentTranslateY.value = withDelay(1200, withSpring(0, { damping: 10, stiffness: 80 }));

    // 5. Button appears with special animation
    buttonOpacity.value = withDelay(1600, withTiming(1, { duration: 500 }));
    buttonScale.value = withDelay(1600, withSequence(
      withSpring(1.05, { damping: 8 }),
      withSpring(1, { damping: 12 })
    ));
  }, []);

  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkScale.value }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  const handleCreateAccount = () => {
    router.replace('/login');
  };

  const features = [
    {
      icon: Package,
      title: 'Track Your Orders',
      description: 'Monitor your BlueDrops shipments in real-time'
    },
    {
      icon: Bell,
      title: 'Smart Reminders',
      description: 'Never miss a dose with personalized notifications'
    },
    {
      icon: BarChart3,
      title: 'Progress Analytics',
      description: 'Visualize your health journey with detailed charts'
    }
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Logo */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <BlueDropsLogo width={200} height={51} />
        </Animated.View>

        {/* Success Check Mark */}
        <Animated.View style={[styles.checkContainer, checkAnimatedStyle]}>
          <View style={styles.checkCircle}>
            <CheckCircle size={48} color={theme.colors.success[600]} />
          </View>
        </Animated.View>

        {/* Main Title */}
        <Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
          <Text style={styles.mainTitle}>Obrigado pela sua compra!</Text>
          <Text style={styles.subtitle}>
            Sua jornada de saúde começa agora
          </Text>
        </Animated.View>

        {/* Content Section */}
        <Animated.View style={[styles.contentContainer, contentAnimatedStyle]}>
          {/* Exclusive Access Card */}
          <View style={styles.exclusiveCard}>
            <View style={styles.exclusiveHeader}>
              <Smartphone size={24} color={theme.colors.primary[600]} />
              <Text style={styles.exclusiveTitle}>Acesso Exclusivo Liberado!</Text>
            </View>
            <Text style={styles.exclusiveDescription}>
              Agora você tem acesso ao nosso aplicativo exclusivo BlueApp - sua central de acompanhamento pessoal para maximizar seus resultados.
            </Text>
          </View>

          {/* Features List */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>O que você pode fazer no BlueApp:</Text>
            
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Icon size={20} color={theme.colors.primary[600]} />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Benefits Section */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Benefícios Exclusivos:</Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <View style={styles.benefitBullet} />
                <Text style={styles.benefitText}>Acompanhamento personalizado da sua evolução</Text>
              </View>
              <View style={styles.benefitItem}>
                <View style={styles.benefitBullet} />
                <Text style={styles.benefitText}>Lembretes inteligentes para não perder nenhuma dose</Text>
              </View>
              <View style={styles.benefitItem}>
                <View style={styles.benefitBullet} />
                <Text style={styles.benefitText}>Biblioteca exclusiva de conteúdo educativo</Text>
              </View>
              <View style={styles.benefitItem}>
                <View style={styles.benefitBullet} />
                <Text style={styles.benefitText}>Rastreamento completo dos seus pedidos</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Call to Action Button */}
        <Animated.View style={[styles.ctaContainer, buttonAnimatedStyle]}>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={handleCreateAccount}
            activeOpacity={0.9}
          >
            <Text style={styles.ctaButtonText}>Criar Minha Conta Agora</Text>
            <ArrowRight size={20} color={theme.colors.white} />
          </TouchableOpacity>
          
          <Text style={styles.ctaSubtext}>
            Comece a usar o BlueApp hoje mesmo e potencialize seus resultados
          </Text>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Bem-vindo à família BlueDrops! 💙
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  checkContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.success[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: theme.colors.success[200],
    shadowColor: theme.colors.success[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  mainTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: theme.colors.gray[900],
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: theme.colors.gray[600],
    textAlign: 'center',
    lineHeight: 26,
  },
  contentContainer: {
    marginBottom: 40,
  },
  exclusiveCard: {
    backgroundColor: theme.colors.primary[50],
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: theme.colors.primary[100],
    shadowColor: theme.colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  exclusiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  exclusiveTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: theme.colors.primary[800],
    marginLeft: 12,
  },
  exclusiveDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.primary[700],
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featuresTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: theme.colors.gray[900],
    marginBottom: 20,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary[500],
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.gray[900],
    marginBottom: 4,
  },
  featureDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    lineHeight: 20,
  },
  benefitsContainer: {
    backgroundColor: theme.colors.gray[50],
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  benefitsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.gray[900],
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success[500],
    marginRight: 12,
  },
  benefitText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[700],
    flex: 1,
    lineHeight: 20,
  },
  ctaContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[600],
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: theme.colors.primary[600],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 280,
  },
  ctaButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: theme.colors.white,
    marginRight: 12,
  },
  ctaSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: theme.colors.primary[600],
    textAlign: 'center',
  },
});