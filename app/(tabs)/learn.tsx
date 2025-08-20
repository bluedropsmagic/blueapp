import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Linking, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HeaderMenu } from '@/components/HeaderMenu';
import { BottomIconsBar } from '@/components/BottomIconsBar';
import { SectionHeader } from '@/components/SectionHeader';
import { UsefulContainer } from '@/components/UsefulContainer';
import { MarketplaceBox } from '@/components/MarketplaceBox';
import { FileText, Clock, Download } from 'lucide-react-native';
import { theme } from '@/constants/theme';

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const articles = [
    {
      id: 1,
      title: 'Unlock Your Full Potential!',
      description: 'Discover the secrets to maximizing your personal growth and achieving your goals',
      readTime: '12 min read',
      url: 'https://drive.google.com/file/d/1tSMgbNe_IKViIjELYQpfhNaAx-VHyK5_/view',
    },
    {
      id: 2,
      title: 'Transform Your Manhood Naturally',
      description: 'Natural methods and techniques for personal enhancement and confidence',
      readTime: '8 min read',
      url: 'https://drive.google.com/file/d/1k1PJr4erziVlqtn2iVIvtQavi6kSU9TS/view',
    },
    {
      id: 3,
      title: 'The Dutch Bathroom Trick To Grow And Renew Your Life',
      description: 'A unique European approach to wellness and vitality enhancement',
      readTime: '6 min read',
      url: 'https://drive.google.com/file/d/1LJY_BU3cQySky2qajZ-XjLxwUupUVE56/view',
    },
    {
      id: 4,
      title: 'Why Most Men Get It Wrong',
      description: 'Common mistakes and how to avoid them for better results',
      readTime: '10 min read',
      url: 'https://drive.google.com/file/d/1dlScdDX36bHsEaBBOFSIge9ZOiLSPT-9/view',
    },
    {
      id: 5,
      title: 'O Sedutor: Secrets Men Aren\'t Told',
      description: 'Exclusive insights into confidence and attraction mastery',
      readTime: '15 min read',
      url: 'https://drive.google.com/file/d/1h45sk5w9f10WsHQ9hGF12M09VINnMc4T/view',
    },
    {
      id: 6,
      title: 'Master Total Ejaculation Control: Last 60+ Minutes in Bed',
      description: 'Advanced techniques for enhanced performance and satisfaction',
      readTime: '18 min read',
      url: 'https://drive.google.com/file/d/1QqdiLqUeBuwf3pUgdbLcbo_c0kw97GF_/view',
    },
  ];

  const handleArticlePress = async (url: string) => {
    try {
      // Check if the URL can be opened
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        // Open the URL in the device's default browser
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Unable to Open Link',
          'This link cannot be opened on your device. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert(
        'Error',
        'There was an error opening this article. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleMarketplacePress = () => {
    // Do nothing - disabled for coming soon
    console.log('Marketplace access coming soon');
  };
  
  return (
    <View style={styles.container}>
      <HeaderMenu />
      <SectionHeader 
        title="Health Library" 
        variant="secondary"
      />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent, 
          { 
            paddingBottom: insets.bottom + 120, // Extra space for bottom icons
          }
        ]}
      >
        <UsefulContainer>
          <View style={styles.latestSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Latest Articles</Text>
            </View>

            {/* Click to Download Notice */}
            <View style={styles.downloadNotice}>
              <Download size={16} color={theme.colors.primary[600]} />
              <Text style={styles.downloadNoticeText}>Click to download these exclusive guides</Text>
            </View>
            
            {articles.map(article => (
              <TouchableOpacity
                key={article.id}
                style={styles.articleCard}
                onPress={() => handleArticlePress(article.url)}
                activeOpacity={0.7}
              >
                <View style={styles.articleIcon}>
                  <FileText size={24} color={theme.colors.error[600]} />
                </View>
                <View style={styles.articleContent}>
                  <Text style={styles.articleTitle} numberOfLines={2}>
                    {article.title}
                  </Text>
                  <Text style={styles.articleDescription} numberOfLines={2}>
                    {article.description}
                  </Text>
                  
                  {/* Reading time indicator */}
                  <View style={styles.readingTimeContainer}>
                    <Clock size={12} color={theme.colors.gray[500]} />
                    <Text style={styles.readingTimeText}>{article.readTime}</Text>
                  </View>
                  
                  <View style={styles.bottomRow}>
                    <View style={styles.pdfIndicator}>
                      <Text style={styles.pdfText}>PDF Document</Text>
                    </View>
                    <View style={styles.clickToDownload}>
                      <Download size={12} color={theme.colors.primary[600]} />
                      <Text style={styles.clickToDownloadText}>Click to download</Text>
                    </View>
                  </View>
                </View>
                <Download size={20} color={theme.colors.gray[400]} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Premium Library Box with new image above */}
          <View style={styles.marketplaceSection}>
            {/* New Image - Much Closer */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: 'https://i.imgur.com/WazUzTA.png' }}
                style={styles.premiumImage}
                resizeMode="contain"
              />
            </View>
            
            {/* MarketplaceBox - Now with Coming Soon overlay */}
            <MarketplaceBox onPress={handleMarketplacePress} />
          </View>
        </UsefulContainer>
      </ScrollView>

      {/* Bottom Icons Bar */}
      <BottomIconsBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  latestSection: {
    marginTop: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.gray[900],
  },
  downloadNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[50],
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary[100],
  },
  downloadNoticeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: theme.colors.primary[700],
    marginLeft: 8,
    textAlign: 'center',
  },
  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error[500],
  },
  articleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.error[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  articleContent: {
    flex: 1,
  },
  articleTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: theme.colors.gray[900],
    marginBottom: 6,
    lineHeight: 20,
  },
  articleDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: theme.colors.gray[600],
    lineHeight: 18,
    marginBottom: 8,
  },
  readingTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  readingTimeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[500],
    marginLeft: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pdfIndicator: {
    backgroundColor: theme.colors.error[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  pdfText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: theme.colors.error[700],
  },
  clickToDownload: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  clickToDownloadText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: theme.colors.primary[700],
    marginLeft: 4,
  },
  marketplaceSection: {
    marginBottom: 32,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: -8, // Negative margin to make them overlap slightly
  },
  premiumImage: {
    width: 320,
    height: 192,
  },
});