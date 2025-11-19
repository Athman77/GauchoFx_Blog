import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Linking, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BLOG_ARTICLES } from '../../lib/mockData';
import { client, sanityQueries, urlFor } from '../../lib/sanity';
import { COLORS, RADIUS, SHADOW, SPACING, TYPOGRAPHY } from '../../lib/theme';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import IconButton from '../components/IconButton';

interface RouteParams {
  articleId: string;
}

export default function ArticleDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { articleId } = route.params as RouteParams;
  const insets = useSafeAreaInsets();
  const HERO_HEIGHT = 320;
  const HERO_OVERLAP = 24; // how much the content sheet overlaps the hero
  const [isBookmarked, setIsBookmarked] = React.useState(false);
  // Local state for the article loaded from Sanity (fallback to mock)
  const [article, setArticle] = useState<any | null>(() => BLOG_ARTICLES.find((a) => a.id === articleId) || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try fetching by slug first
        let res = await client.fetch(sanityQueries.getPostBySlug(articleId));

        // If not found by slug, try by _id
        if (!res) {
          res = await client.fetch(`*[_id == "${articleId}"][0] {
            _id,
            title,
            slug,
            mainImage,
            body,
            publishedAt,
            excerpt,
            "author": author->name,
            "authorImage": author->image,
            categories[]->{_id,title}
          }`);
        }

        if (!mounted) return;

        if (!res) {
          setError('Article not found');
          setArticle(null);
        } else {
          // Map Sanity result to the UI shape expected by this screen
          const body = res.body;

          const mapped = {
            id: res._id,
            title: res.title,
            // keep a plain-text fallback in `content`
            content:
              typeof body === 'string'
                ? body
                : Array.isArray(body)
                ? body
                    .map((blk: any) => {
                      if (blk._type === 'block' && Array.isArray(blk.children)) {
                        return blk.children.map((c: any) => c.text).join('');
                      }
                      if (typeof blk === 'string') return blk;
                      return '';
                    })
                    .join('\n\n')
                : res.excerpt || '',
            // preserve the raw Portable Text array so we can render images inline
            bodyRaw: Array.isArray(body) ? body : null,
            image: res.mainImage ? urlFor(res.mainImage).width(1200).url() : BLOG_ARTICLES[0].image,
            author: res.author || 'Unknown',
            authorAvatar: res.authorImage ? urlFor(res.authorImage).width(120).url() : BLOG_ARTICLES[0].authorAvatar,
            date: res.publishedAt ? new Date(res.publishedAt).toLocaleDateString() : BLOG_ARTICLES[0].date,
            views: res.views || BLOG_ARTICLES[0].views || 0,
            category: res.categories && res.categories.length > 0 ? res.categories[0].title : BLOG_ARTICLES[0].category,
          };

          setArticle(mapped);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError('Failed to load article');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchArticle();

    return () => {
      mounted = false;
    };
  }, [articleId]);

  // Hide the native/navigation header so the hero image can extend to the
  // top edge of the screen. Restore header visibility when leaving.
  useEffect(() => {
    // Some navigation implementations accept setOptions; guard with a check
    if (navigation && typeof (navigation as any).setOptions === 'function') {
      (navigation as any).setOptions({ headerShown: false });
    }
    return () => {
      if (navigation && typeof (navigation as any).setOptions === 'function') {
        (navigation as any).setOptions({ headerShown: true });
      }
    };
  }, [navigation]);
  if (loading) {
    return (
      <View style={[styles.errorContainer, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !article) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error ?? 'Article not found'}</Text>
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

    const paragraphs = (article.content || '').split('\n\n');

    // Make inline images occupy a large, visible height (50% of screen height)
    const windowHeight = Dimensions.get('window').height;
    const inlineImageHeight = Math.round(windowHeight * 0.5);

  return (
    <View style={styles.container}>
      {/* In-screen header removed so the hero image can extend to the top edge */}
 
      {/* Fixed hero positioned at top so content scrolls over it */}
      <View style={[styles.fullBleedHeroContainer, { position: 'absolute', top: 0, left: 0, right: 0, height: HERO_HEIGHT }]}> 
        <Image source={{ uri: article.image }} style={styles.fullBleedHeroImage} resizeMode="cover" />
        <View style={styles.fullBleedOverlay} />
        <View style={styles.heroTitleWrap}>
          <View style={styles.heroTopRow}>
            <Badge text={'📈 Forex Trading'} color={'#2563eb'} textColor={'#fff'} />
          </View>
          <Text style={styles.heroTitle}>{article.title}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: HERO_HEIGHT - HERO_OVERLAP }}
      >
        {/* Content starts here; hero is fixed above */}

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
            {article.bodyRaw && Array.isArray(article.bodyRaw) ? (
              article.bodyRaw.map((blk: any, idx: number) => {
                if (blk._type === 'image') {
                  // For image blocks, render the Sanity image URL
                  const uri = blk.asset ? urlFor(blk).width(1200).url() : undefined;
                  return uri ? (
                    <Image
                      key={`img-${idx}`}
                      source={{ uri }}
                      style={[styles.inlineImage, { height: inlineImageHeight }]}
                      resizeMode="contain"
                    />
                  ) : null;
                }

                    if (blk._type === 'block') {
                      const markDefs = blk.markDefs || [];
                      const markDefMap: Record<string, any> = {};
                      markDefs.forEach((d: any) => {
                        if (d && d._key) markDefMap[d._key] = d;
                      });

                      // Build inline children respecting marks (strong, em, links)
                      const childrenNodes = (blk.children || []).map((child: any, ci: number) => {
                        const text = child.text || '';
                        const marks: string[] = child.marks || [];
                        const stylesArr: any[] = [];
                        const isStrong = marks.includes('strong');
                        if (isStrong) stylesArr.push(styles.boldGreen);
                        if (marks.includes('em')) stylesArr.push(styles.italic);

                        // Prefix a fire emoji for strong text
                        const displayText = isStrong ? `🔥 ${text}` : text;

                        // Check for annotation marks (links)
                        const linkKey = marks.find((m) => markDefMap[m] && (markDefMap[m]._type === 'link' || markDefMap[m].href));
                        if (linkKey) {
                          const href = markDefMap[linkKey].href;
                          return (
                            <Text key={`c-${ci}`} style={stylesArr} onPress={() => href && Linking.openURL(href)}>
                              {displayText}
                            </Text>
                          );
                        }

                        return (
                          <Text key={`c-${ci}`} style={stylesArr}>
                            {displayText}
                          </Text>
                        );
                      });

                      // Combine plain text for heuristics (dropcap / quote detection)
                      const combined = (blk.children || []).map((c: any) => c.text || '').join('');

                      // Bullet list items: prefix with fire emoji
                      if (blk.listItem === 'bullet') {
                        return (
                          <View key={`li-${idx}`} style={styles.listItem}>
                            <Text style={styles.bulletEmoji}>🔥</Text>
                            <Text style={styles.paragraphText}>{childrenNodes}</Text>
                          </View>
                        );
                      }

                      // First paragraph drop-cap behavior (only for normal blocks)
                      if (idx === 0 && blk.style !== 'blockquote' && blk.style !== 'h1' && blk.style !== 'h2' && combined.length > 0) {
                        const firstChar = combined[0];
                        const rest = combined.slice(1);
                        return (
                          <View key={`p-${idx}`} style={styles.firstParagraphContainer}>
                            <Text style={styles.dropCap}>{firstChar}</Text>
                            <Text style={styles.paragraphText}>{rest}</Text>
                          </View>
                        );
                      }

                      // Blockquote style
                      if (blk.style === 'blockquote') {
                        return (
                          <View key={`q-${idx}`} style={styles.quoteContainer}>
                            <Text style={styles.quoteText}>{combined}</Text>
                          </View>
                        );
                      }

                      // Headings
                      if (blk.style === 'h1') return <Text key={`h1-${idx}`} style={styles.h1}>{childrenNodes}</Text>;
                      if (blk.style === 'h2') return <Text key={`h2-${idx}`} style={styles.h2}>{childrenNodes}</Text>;
                      if (blk.style === 'h3') return <Text key={`h3-${idx}`} style={styles.h3}>{childrenNodes}</Text>;
                      if (blk.style === 'h4') return <Text key={`h4-${idx}`} style={styles.h4}>{childrenNodes}</Text>;

                      // Default paragraph with inline marks
                      return (
                        <Text key={`p-${idx}`} style={styles.paragraphText}>
                          {childrenNodes}
                        </Text>
                      );
                    }

                // Unknown block types: ignore or render string content
                if (typeof blk === 'string') {
                  return (
                    <Text key={`s-${idx}`} style={styles.paragraphText}>
                      {blk}
                    </Text>
                  );
                }

                return null;
              })
            ) : (
              paragraphs.map((paragraph: string, index: number) => {
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
              })
            )}
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
    position: 'relative',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  heroTitleWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 64, // moved up from 24 to 64 for better visibility
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
  inlineImage: {
    width: '100%',
    height: 220,
    borderRadius: RADIUS.sm,
    marginVertical: SPACING.md,
  },
  bold: {
    fontWeight: '700',
  },
  boldGreen: {
    fontWeight: '700',
    color: '#2ecc71',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  bulletEmoji: {
    marginRight: SPACING.sm,
    fontSize: 18,
    lineHeight: 22,
  },
  italic: {
    fontStyle: 'italic',
  },
  link: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  h1: {
    ...TYPOGRAPHY.title,
    fontSize: 28,
    fontWeight: '700',
    marginVertical: SPACING.md,
  },
  h2: {
    ...TYPOGRAPHY.title,
    fontSize: 22,
    fontWeight: '700',
    marginVertical: SPACING.md,
  },
  h3: {
    ...TYPOGRAPHY.title,
    fontSize: 18,
    fontWeight: '700',
    marginVertical: SPACING.sm,
  },
  h4: {
    ...TYPOGRAPHY.label,
    fontSize: 16,
    fontWeight: '700',
    marginVertical: SPACING.sm,
  },
});
