import React, { useState } from 'react';
import { Image, View, StyleSheet, ActivityIndicator, ImageStyle, ViewStyle } from 'react-native';
import { theme } from '@/constants/theme';

type WebOptimizedImageProps = {
  source: { uri: string };
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  placeholder?: boolean;
  alt?: string;
};

export const WebOptimizedImage = ({ 
  source, 
  style, 
  containerStyle,
  resizeMode = 'cover',
  placeholder = true,
  alt = 'Image'
}: WebOptimizedImageProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {loading && placeholder && (
        <View style={[styles.placeholder, style]}>
          <ActivityIndicator size="small" color={theme.colors.primary[500]} />
        </View>
      )}
      
      {!error && (
        <Image
          source={source}
          style={[style, loading && styles.hidden]}
          resizeMode={resizeMode}
          onLoad={handleLoad}
          onError={handleError}
          accessibilityLabel={alt}
        />
      )}
      
      {error && (
        <View style={[styles.errorPlaceholder, style]}>
          <View style={styles.errorIcon} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  placeholder: {
    backgroundColor: theme.colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  hidden: {
    opacity: 0,
  },
  errorPlaceholder: {
    backgroundColor: theme.colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    width: 24,
    height: 24,
    backgroundColor: theme.colors.gray[400],
    borderRadius: 4,
  },
});