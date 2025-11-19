import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { Image, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import IconButton from '../components/IconButton';
import { BLOG_ARTICLES } from '../lib/mockData';
import { COLORS, RADIUS, SHADOW, SPACING, TYPOGRAPHY } from '../lib/theme';

interface RouteParams {
  articleId: string;
}

export default function ArticleDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { articleId } = route.params as RouteParams;
  const insets = useSafeAreaInsets();
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  const article = BLOG_ARTICLES.find((a) => a.id === articleId);

  if (!article) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Article not found</Text>
      </View>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${article.title}\n\nRead more: Check out this article on our news app!`,
        title: article.title,
        url: 'https://example.com',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const paragraphs = article.content.split('\n\n');

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        {/* Header Navigation */}
        <View style={styles.navigationBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.6}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6}>
            <MaterialCommunityIcons name="magnify" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {/* Full-bleed Hero (no rounded corners) */}
        <View style={styles.fullBleedHeroContainer}>
          <Image
            source={{ uri: article.image }}
            style={styles.fullBleedHeroImage}
            resizeMode="cover"
          />
          <View style={styles.fullBleedOverlay} />
          <View style={styles.heroTopRow}>
            <Badge text={article.category} color={COLORS.onPrimary} textColor={COLORS.primary} />
          </View>
          <View style={styles.heroTitleWrap}>
            <Text style={styles.heroTitle}>{article.title}</Text>
          </View>
        </View>

        {/* White content sheet overlapping hero with large curved top corners */}
        <View style={styles.contentSheet}>
          {/* Floating action buttons that overlap the sheet */}
          <View style={styles.floatingActionsRow} pointerEvents="box-none">
            <IconButton
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              onPress={() => setIsBookmarked(!isBookmarked)}
              backgroundColor={COLORS.primary}
            />
            <View style={{ width: SPACING.sm }} />
            <IconButton
              name="share-variant"
              onPress={handleShare}
              backgroundColor={COLORS.primary}
            />
          </View>

          {/* Author Section with Divider */}
          <View style={styles.authorSectionInline}>
            <Avatar uri={article.authorAvatar} size={48} />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{article.author}</Text>
              <View style={styles.authorMetaRow}>
                <Text style={styles.authorMetaText}>{article.date}</Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.authorMetaText}>{article.views} View</Text>
              </View>
            </View>
          </View>
          <View style={styles.authorDivider} />

          {/* Content */}
          <View style={styles.contentSection}>
            {paragraphs.map((paragraph, index) => {
              // First paragraph gets a drop cap
              if (index === 0 && paragraph.length > 0) {
                const firstChar = paragraph[0];
                const rest = paragraph.slice(1);

                return (
                  <View key={index} style={styles.firstParagraphContainer}>
                    <Text style={styles.dropCap}>{firstChar}</Text>
                    <Text style={styles.paragraphText}>{rest}</Text>
                  </View>
                );
              }

              // Quote paragraph detection
              if (paragraph.startsWith('Well, with our') || paragraph.startsWith('The key to')) {
                return (
                  <View key={index} style={styles.quoteContainer}>
                    <Text style={styles.quoteText}>{paragraph}</Text>
                  </View>
                );
              }

              // Regular paragraphs
              return (
                <Text key={index} style={styles.paragraphText}>
                  {paragraph}
                </Text>
              );
            })}
          </View>

          {/* Comment Input Row */}
          <View style={styles.commentRow}>
            <View style={styles.commentInput}>
              <Text style={styles.commentPlaceholder}>Write a comment...</Text>
            </View>
            <TouchableOpacity style={styles.sendFab} activeOpacity={0.8}>
              <MaterialCommunityIcons name="send" size={20} color={COLORS.onPrimary} />
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      {/* bottom safe area spacer if needed */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerSafeArea: {
    backgroundColor: COLORS.background,
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backButton: {
    padding: SPACING.sm,
    marginLeft: -SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  fullBleedHeroContainer: {
    width: '100%',
    height: 320,
    backgroundColor: COLORS.surface,
  },
  fullBleedHeroImage: {
    width: '100%',
    height: '100%',
  },
  fullBleedOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 140,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  heroTopRow: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  heroTitleWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
  },
  heroTitle: {
    ...TYPOGRAPHY.title,
    color: COLORS.onPrimary,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
  },
  contentSheet: {
    marginTop: -24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: COLORS.surface,
    paddingTop: 28,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    ...SHADOW.card,
  },
  floatingActionsRow: {
    position: 'absolute',
    right: SPACING.lg,
    top: -28,
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorSectionInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    ...TYPOGRAPHY.title,
    color: COLORS.onSurface,
  },
  authorMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  authorMetaText: {
    ...TYPOGRAPHY.small,
    color: COLORS.onSurfaceMuted,
  },
  metaDot: {
    color: COLORS.onSurfaceMuted,
    fontSize: 4,
  },
  authorDivider: {
    height: 1,
    backgroundColor: COLORS.onSurfaceMuted,
    marginVertical: SPACING.lg,
  },
  contentSection: {
    paddingHorizontal: 0,
    paddingBottom: SPACING.lg,
  },
  firstParagraphContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  dropCap: {
    fontSize: 56,
    lineHeight: 56,
    color: COLORS.primary,
    fontWeight: '700',
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  paragraphText: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.onSurface,
    lineHeight: 28,
    marginBottom: SPACING.lg,
  },
  quoteContainer: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  quoteBorder: {
    width: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    display: 'none',
  },
  quoteText: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.onSurface,
    fontStyle: 'italic',
    flex: 1,
    lineHeight: 28,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  errorText: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.onSurface,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.fab,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  commentInput: {
    flex: 1,
    height: 56,
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
  },
  commentPlaceholder: {
    color: COLORS.onSurfaceMuted,
  },
  sendFab: {
    marginLeft: SPACING.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.fab,
  },
});

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BLOG_ARTICLES } from '../lib/mockData';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOW } from '../lib/theme';
import { RootStackParamList } from '../App';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const CATEGORIES = ['All', 'Internation', 'Media', 'Magazine', 'Business'];

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All');
  const featuredArticle = BLOG_ARTICLES[0];
  const otherArticles = BLOG_ARTICLES.slice(1);

  const handleArticlePress = (articleId: string) => {
    navigation.navigate('ArticleDetail', { articleId });
  };

  const CategoryPill = ({ category, isSelected }: { category: string; isSelected: boolean }) => (
    <TouchableOpacity 
      style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
      onPress={() => setSelectedCategory(category)}
      activeOpacity={0.7}
    >
      <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
        {category}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header with avatar, date, and search */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Avatar uri={'https://api.a0.dev/assets/image?text=avatar&aspect=1:1'} size={44} />
            <Text style={styles.headerDate}>10 Jan, 2021</Text>
          </View>
          <TouchableOpacity activeOpacity={0.6}>
            <MaterialCommunityIcons name="magnify" size={24} color={COLORS.onSurfaceMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[2]}
          scrollEventThrottle={16}
        >
          {/* Breaking News Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Breaking News</Text>
          </View>

          {/* Featured Article Card */}
          <TouchableOpacity 
            style={[styles.featuredArticle, SHADOW.card]}
            onPress={() => handleArticlePress(featuredArticle.id)}
            activeOpacity={0.85}
          >
            <Image
              source={{ uri: featuredArticle.image }}
              style={styles.featuredImage}
              resizeMode="cover"
            />
            <View style={styles.featuredContent}>
              <Badge text={featuredArticle.category} />
              <Text style={styles.featuredTitle} numberOfLines={3}>
                {featuredArticle.title}
              </Text>
              <View style={styles.articleMeta}>
                <Avatar uri={featuredArticle.authorAvatar} size={32} />
                <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                  <Text style={styles.authorName}>{featuredArticle.author}</Text>
                  <Text style={styles.metaDate}>{featuredArticle.date}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Category Filter Sticky Container */}
          <View style={styles.categoryFilterWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
              scrollEventThrottle={16}
            >
              {CATEGORIES.map((category) => (
                <CategoryPill
                  key={category}
                  category={category}
                  isSelected={selectedCategory === category}
                />
              ))}
            </ScrollView>
          </View>

          {/* Articles List */}
          <View style={styles.articlesContainer}>
            {otherArticles.map((article, index) => (
              <TouchableOpacity
                key={article.id}
                style={[styles.articleItem, SHADOW.small]}
                onPress={() => handleArticlePress(article.id)}
                activeOpacity={0.75}
              >
                <Image
                  source={{ uri: article.image }}
                  style={styles.articleImage}
                  resizeMode="cover"
                />
                <View style={styles.articleItemContent}>
                  <Text style={styles.articleItemTitle} numberOfLines={2}>
                    {article.title}
                  </Text>
                  <View style={styles.articleItemMeta}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs }}>
                      <MaterialCommunityIcons name="calendar" size={12} color={COLORS.onSurfaceMuted} />
                      <Text style={styles.articleItemMetaText}>{article.date}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs }}>
                      <MaterialCommunityIcons name="clock" size={12} color={COLORS.onSurfaceMuted} />
                      <Text style={styles.articleItemMetaText}>{article.readTime} min read</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bottom padding */}
          <View style={{ height: SPACING.lg }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  headerDate: {
    ...TYPOGRAPHY.body,
    color: COLORS.onSurfaceMuted,
  },
  titleSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
  },
  title: {
    ...TYPOGRAPHY.display,
    color: COLORS.onSurface,
  },
  featuredArticle: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  featuredImage: {
    width: '100%',
    height: 240,
  },
  featuredContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  featuredTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.onSurface,
    lineHeight: 32,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  authorName: {
    ...TYPOGRAPHY.label,
    color: COLORS.onSurface,
  },
  metaDate: {
    ...TYPOGRAPHY.small,
    color: COLORS.onSurfaceMuted,
    marginTop: 2,
  },
  categoryFilterWrapper: {
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
  },
  categoryScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  categoryPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.outline,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    ...TYPOGRAPHY.label,
    color: COLORS.onSurfaceMuted,
  },
  categoryTextActive: {
    color: COLORS.onPrimary,
  },
  articlesContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  articleItem: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.sm,
  },
  articleImage: {
    width: 100,
    height: 80,
    borderRadius: RADIUS.sm,
  },
  articleItemContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  articleItemTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.onSurface,
    fontWeight: '600',
    lineHeight: 20,
  },
  articleItemMeta: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  articleItemMetaText: {
    ...TYPOGRAPHY.small,
    color: COLORS.onSurfaceMuted,
  },
});

export interface BlogArticle {
  id: string;
  title: string;
  excerpt?: string;
  content: string;
  author: string;
  authorAvatar: string;
  date: string;
  image: string;
  category: string;
  readTime: number;
  views?: number;
}

import { BlogArticle } from '../types/blog';

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: '1',
    title: 'Contact Lost With Sriwijaya Air Boeing 737-500 After Take Off',
    excerpt: 'Breaking news from the aviation sector.',
    content: `Indonesia's Sriwijaya Air has lost contact with one of its Boeing 737-500 aircraft shortly after takeoff from Jakarta.

The aircraft, carrying 62 people on board, took off from Soekarno-Hatta International Airport at 2:36 PM local time. Contact was lost just four minutes after departure.

This incident marks another concerning moment for the Indonesian airline industry, which has faced multiple challenges in recent years. Preliminary reports suggest the aircraft may have encountered severe weather conditions during takeoff.

Search and rescue operations have been launched immediately, with multiple vessels and aircraft being deployed to search the Java Sea where the aircraft is believed to have gone down.

"We are coordinating with all relevant agencies to locate the aircraft and ensure the safety of all passengers and crew," said a spokesperson for Sriwijaya Air.

The Joint Agency Coordination Team (BAKAMLA) has been activated and is currently coordinating search operations in the designated area.

Updates will be provided as more information becomes available.`,
    author: 'John Smith',
    authorAvatar: 'https://api.a0.dev/assets/image?text=John+Smith&aspect=1:1',
    date: '10 Jan, 2020',
    image: 'https://api.a0.dev/assets/image?text=Boeing+737+Aircraft&aspect=16:9',
    category: 'International',
    readTime: 8,
    views: 2340,
  },
  {
    id: '2',
    title: 'An Illinois town fights to save its power plant',
    excerpt: 'Economic impact and environmental concerns collide.',
    content: `A small Illinois community is battling to preserve its aging coal-fired power plant as economic pressures and environmental concerns mount.

The power plant, which has been operational for over 30 years, employs approximately 150 workers and serves as a crucial economic pillar for the town of 8,000 residents.

However, increased regulations, rising maintenance costs, and the global shift toward renewable energy have put the facility's future in jeopardy.

"This plant is not just about electricity generation; it's about jobs, tax revenue, and community stability," said Mayor Robert Thompson.

Environmental groups argue that the plant's continued operation contradicts climate goals and poses health risks to nearby communities due to emissions.

The town council has launched a community initiative to explore renewable energy transition options while protecting jobs.`,
    author: 'Sarah Johnson',
    authorAvatar: 'https://api.a0.dev/assets/image?text=Sarah+Johnson&aspect=1:1',
    date: '10 Jan, 2021',
    image: 'https://api.a0.dev/assets/image?text=Power+Plant+Illinois&aspect=16:9',
    category: 'Business',
    readTime: 10,
    views: 1250,
  },
  {
    id: '3',
    title: '14 Passengers Banned By Nona Airlines After bad Behavior',
    excerpt: 'Zero-tolerance policy takes effect.',
    content: `Nona Airlines has banned 14 passengers from future flights following disruptive behavior during a recent domestic flight.

The incident occurred on Flight NA-567 from Manila to Cebu when multiple passengers engaged in aggressive conduct, verbal abuse of crew members, and violations of airline safety protocols.

"The safety and comfort of our passengers and crew is paramount. We will not tolerate any form of disruptive behavior," said Nona Airlines spokesperson Maria Garcia.

The banned passengers have been added to the airline's no-fly list and will face legal consequences for their actions aboard the aircraft.

According to the FAA, unruly passenger incidents have increased dramatically in recent months, prompting airlines to implement stricter enforcement policies.

Other major carriers have also announced similar zero-tolerance programs to maintain order and safety standards.`,
    author: 'Michael Chen',
    authorAvatar: 'https://api.a0.dev/assets/image?text=Michael+Chen&aspect=1:1',
    date: '09 Jan, 2021',
    image: 'https://api.a0.dev/assets/image?text=Nona+Airlines&aspect=16:9',
    category: 'Media',
    readTime: 10,
    views: 1890,
  },
  {
    id: '4',
    title: "Here's What You Need To Know About Dumplings",
    excerpt: 'A culinary guide to everyone\'s favorite food.',
    content: `Dumplings are intimidating (well, they can be). But they also are, in fact, delicious.

No matter what you stuff them with, the concept of pillowy, soft dough encasing a luscious, super flavorful filling is enough to warm you up from inside to out.

Well, with our homemade dumpling recipe, we're bringing that warm, fuzzy feeling right to your table.

Our step-by-step guide makes the process simple and achievable for anyone, whether you're a seasoned home cook or trying this for the first time.

The key to perfect dumplings lies in three main components:
- The dough: Soft, pliable, and forgiving
- The filling: Flavorful and well-seasoned
- The technique: Patience and practice

We've tested multiple approaches and refined our method to ensure consistently delicious results every time.

Join us on this culinary journey as we demystify the art of dumpling-making and unlock the secrets to creating restaurant-quality dumplings in your own kitchen.`,
    author: 'Emily Rodriguez',
    authorAvatar: 'https://api.a0.dev/assets/image?text=Emily+Rodriguez&aspect=1:1',
    date: '08 Jan, 2021',
    image: 'https://api.a0.dev/assets/image?text=Dumplings+Food&aspect=16:9',
    category: 'Magazine',
    readTime: 12,
    views: 3420,
  },
];


export const COLORS = {
  primary: '#3366FF',
  onPrimary: '#FFFFFF',
  primaryContainer: '#E6EEFF',
  onPrimaryContainer: '#1030A6',

  secondary: '#6C63FF',
  onSecondary: '#FFFFFF',

  background: '#F8FAFB',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F7FA',
  onSurface: '#1A202C',
  onSurfaceMuted: '#718096',
  surfaceVariant: '#F3F4F6',

  outline: '#E2E8F0',
  outlineStrong: '#A0AEC0',

  success: '#16A34A',
  error: '#EF4444',

  transparentBlack: 'rgba(0,0,0,0.4)',
  deepTransparentBlack: 'rgba(0,0,0,0.6)',
  lightOverlay: 'rgba(0,0,0,0.2)',
};

export const RADIUS = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const SHADOW = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  fab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const TYPOGRAPHY = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  headline: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700' as const,
  },
  title: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700' as const,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as const,
  },
  small: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
};

import React from 'react';
import { TouchableOpacity, ViewStyle, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOW } from '../lib/theme';

type IconButtonProps = {
  name: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  size?: number;
  color?: string;
  backgroundColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
};

export default function IconButton({
  name,
  size = 20,
  color = COLORS.onPrimary,
  backgroundColor = COLORS.primary,
  onPress,
  style,
}: IconButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, { backgroundColor }, style]}>
      <MaterialCommunityIcons name={name} size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.fab,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../lib/theme';

type BadgeProps = {
  text: string;
  color?: string;
  textColor?: string;
};

export default function Badge({ text, color = COLORS.secondary, textColor = COLORS.onSecondary }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}> 
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
  },
  text: {
    ...TYPOGRAPHY.small,
    fontWeight: '700',
  },
});

import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../lib/theme';

type AvatarProps = {
  uri: string;
  size?: number;
  bordered?: boolean;
};

export default function Avatar({ uri, size = 40, bordered = false }: AvatarProps) {
  return (
    <View style={[styles.wrapper, bordered && { padding: 2, borderRadius: size / 2 + 2 }]}> 
      <Image source={{ uri }} style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
  },
  image: {
    resizeMode: 'cover',
  },
});