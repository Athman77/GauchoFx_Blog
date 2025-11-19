import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BLOG_ARTICLES } from '../../lib/mockData';
import { client, sanityQueries, urlFor } from '../../lib/sanity';
import { COLORS, RADIUS, SHADOW, SPACING, TYPOGRAPHY } from '../../lib/theme';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';

const filters = ['All posts', 'Strategies', 'Market Insight'];

export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  // Sanity-backed posts state
  const [posts, setPosts] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('All posts');
  const [refreshing, setRefreshing] = useState(false);

  const featuredArticleFallback = BLOG_ARTICLES[0];

  const handleArticlePress = (articleId: string) => {
    // Prefer file-based routing; push the article path
    // cast to any to avoid strict typed route errors in this starter project
    router.push((`/article/${articleId}`) as any);
  };

  const CategoryPill = ({ category, isSelected }: { category: string; isSelected: boolean }) => (
    <TouchableOpacity 
      style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
      onPress={() => setActiveFilter(category)}
      activeOpacity={0.7}
    >
      <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
        {category}
      </Text>
    </TouchableOpacity>
  );

  // Fetch posts from Sanity and map to UI shape
  const fetchPosts = () => {
    client
      .fetch(sanityQueries.getAllPosts())
      .then((res: any[]) => {
        const mapped = (res || []).map((post) => ({
          id: post._id,
          title: post.title,
          image: post.mainImage ? urlFor(post.mainImage).width(800).url() : featuredArticleFallback.image,
          author: post.author?.name || featuredArticleFallback.author,
          authorAvatar: post.author?.image ? urlFor(post.author.image).width(80).url() : featuredArticleFallback.authorAvatar,
          date: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : featuredArticleFallback.date,
          readTime: post.readTime || featuredArticleFallback.readTime || 5,
          category: post.categories && post.categories.length > 0 ? post.categories[0].title : '',
          slug: post.slug?.current || '',
        }));
        setPosts(mapped || []);
      })
      .catch(() => {})
      .finally(() => setRefreshing(false));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const filteredPosts =
    activeFilter === 'All posts' ? posts : posts.filter((post) => post.category === activeFilter);

  const visiblePosts = filteredPosts.slice(0, 3000);

  // Format current date as 'dd MMM, yyyy'
  const getFormattedDate = () => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = now.toLocaleString('default', { month: 'short' });
    const year = now.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Header with avatar, date, and search */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Avatar uri={'https://api.a0.dev/assets/image?text=avatar&aspect=1:1'} size={44} />
            <Text style={styles.headerDate}>{getFormattedDate()}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.6}>
            <MaterialCommunityIcons name="magnify" size={24} color={COLORS.onSurfaceMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[2]}
          scrollEventThrottle={16}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Breaking News Title */}
          <View style={styles.titleSection}>
            <View style={styles.titlePill}>
              <Text style={styles.titlePillText}>🚨 Breaking News</Text>
            </View>
          </View>

          {/* Featured Article Card */}
          {visiblePosts.length > 0 ? (
            <TouchableOpacity 
              style={[styles.featuredArticle, SHADOW.card]}
              onPress={() => handleArticlePress(visiblePosts[0].id)}
              activeOpacity={0.85}
            >
              <Image
                source={{ uri: visiblePosts[0].image }}
                style={styles.featuredImage}
                resizeMode="cover"
              />
              <View style={styles.featuredOverlay}>
                <View style={styles.badgeAbsolute}>
                  <Badge text={visiblePosts[0].category} />
                </View>
                <Text style={styles.featuredTitle} numberOfLines={3}>
                  {visiblePosts[0].title}
                </Text>

                <View style={styles.articleMetaOverlay}>
                  <Avatar uri={visiblePosts[0].authorAvatar} size={32} />
                  <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                    <Text style={styles.authorNameOverlay}>{visiblePosts[0].author}</Text>
                    <Text style={styles.metaDateOverlay}>{visiblePosts[0].date} • {visiblePosts[0].readTime} min read</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.featuredArticle, SHADOW.card]}
              onPress={() => handleArticlePress(featuredArticleFallback.id)}
              activeOpacity={0.85}
            >
              <Image
                source={{ uri: featuredArticleFallback.image }}
                style={styles.featuredImage}
                resizeMode="cover"
              />
              <View style={styles.featuredOverlay}>
                <View style={styles.badgeAbsolute}>
                  <Badge text={featuredArticleFallback.category} />
                </View>
                <Text style={styles.featuredTitle} numberOfLines={3}>
                  {featuredArticleFallback.title}
                </Text>

                <View style={styles.articleMetaOverlay}>
                  <Avatar uri={featuredArticleFallback.authorAvatar} size={32} />
                  <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                    <Text style={styles.authorNameOverlay}>{featuredArticleFallback.author}</Text>
                    <Text style={styles.metaDateOverlay}>{featuredArticleFallback.date} • {featuredArticleFallback.readTime} min read</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Category Filter Sticky Container */}
          <View style={styles.categoryFilterWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
              scrollEventThrottle={16}
            >
              {filters.map((category) => (
                <CategoryPill
                  key={category}
                  category={category}
                  isSelected={activeFilter === category}
                />
              ))}
            </ScrollView>
          </View>

          {/* Articles List */}
          <View style={styles.articlesContainer}>
            {visiblePosts.slice(1).map((article, index) => (
              <TouchableOpacity
                  key={article.id}
                  style={[styles.articleItem, styles.articleItemLarge]}
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.outline,
  },
  title: {
    ...TYPOGRAPHY.display,
    color: COLORS.onSurface,
  },
  titlePill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 999,
  },
  titlePillText: {
    ...TYPOGRAPHY.label,
    color: COLORS.onPrimary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  featuredArticle: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    height: 260,
    position: 'relative',
  },
  featuredImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  featuredContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  featuredTitle: {
    ...TYPOGRAPHY.headline,
    color: '#fff',
    lineHeight: 32,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: SPACING.lg,
    backgroundColor: 'rgba(0,0,0,0.28)',
    gap: SPACING.md,
  },
  badgeAbsolute: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    zIndex: 2,
  },
  articleMetaOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  authorNameOverlay: {
    ...TYPOGRAPHY.label,
    color: '#fff',
    fontWeight: '600',
  },
  metaDateOverlay: {
    ...TYPOGRAPHY.small,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
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
    paddingHorizontal: SPACING.md,
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
  articleItemLarge: {
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  articleItemContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  articleItemTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.onSurface,
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 22,
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
