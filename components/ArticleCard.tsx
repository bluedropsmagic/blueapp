import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Clock } from 'lucide-react-native';
import { theme } from '@/constants/theme';

type ArticleCardProps = {
  title: string;
  category: string;
  readTime: string;
  imageUrl: string;
  onPress?: () => void;
};

export const ArticleCard = ({ title, category, readTime, imageUrl, onPress }: ArticleCardProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.categoryTag}>
          <Text style={styles.categoryText}>{category}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <View style={styles.timeContainer}>
          <Clock size={12} color={theme.colors.gray[500]} />
          <Text style={styles.timeText}>{readTime}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  categoryTag: {
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: theme.colors.primary[700],
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: theme.colors.gray[900],
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[500],
    marginLeft: 4,
  },
});