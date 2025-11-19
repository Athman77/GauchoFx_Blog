import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Initialize the Sanity client
export const client = createClient({
  projectId: 'wusctyxy', // Replace with your Sanity project ID
  dataset: 'production',
  useCdn: true, // Set to false if you want to ensure fresh data
  apiVersion: '2023-05-03', // Use current date YYYY-MM-DD
});

// Initialize the image URL builder
const builder = imageUrlBuilder(client);

// Helper function to generate image URLs
export function urlFor(source: any) {
  return builder.image(source);
}

// Example GROQ query functions
export const sanityQueries = {
  // Get all posts
  getAllPosts: () => `
    *[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      chapter,
      mainImage,
      publishedAt,
      excerpt,
      author->{
        name,
        image
      },
      categories[]->{
        _id,
        title
      }
    }
  `,

  // Get a single post by slug
  getPostBySlug: (slug: string) => `
    *[_type == "post" && slug.current == "${slug}"][0] {
      _id,
      title,
      slug,
      mainImage,
      body,
      publishedAt,
      excerpt,
      tags,
      chapter,
      videoType,
      youtube,
      author->{
        name,
        image
      },
      categories[]->{
        _id,
        title
      },
      verses[]{
        _key,
        verse,
        body,
        english,
        englishAudio,
        swahili,
        swahiliAudio,
        imageVerse{
          asset->{
            _id,
            url
          },
          alt
        }
      }
    }
  `,

  // Get posts by category
  getPostsByCategory: (categoryId: string) => `
    *[_type == "post" && references("${categoryId}")] | order(publishedAt desc) {
      _id,
      title,
      slug,
      mainImage,
      publishedAt,
      excerpt,
      author->{
        name,
        image
      },
      categories[]->{
        _id,
        title
      }
    }
  `,

  // Search posts
  searchPosts: (searchTerm: string) => `
    *[_type == "post" && (title match "*${searchTerm}*" || excerpt match "*${searchTerm}*")] | order(publishedAt desc) {
      _id,
      title,
      slug,
      mainImage,
      publishedAt,
      excerpt,
      author->{
        name,
        image
      },
      categories[]->{
        _id,
        title
      }
    }
  `,

  // Get all categories
  getAllCategories: () => `
    *[_type == "category"] | order(title asc) {
      _id,
      title
    }
  `,
};

export const getRecipes = async () => {
  const recipes = await client.fetch(`
     *[_type == "post"] | order(publishedAt asc, _createdAt desc)[7...114] {
      _id,
      title,
      "time": cookingTime,
      "ingredients": count(ingredients),
      calories,
      "imageUrl": mainImage.asset->url,
      "slug": slug.current
    }
  `);
  return recipes;
};

export const getTrendingCourses = async () => {
  const courses = await client.fetch(`
    *[_type == "post"] | order(publishedAt asc, _createdAt desc)[0...6] {
      _id,
      title,
      slug,
      "lectures": 20,
      "imageUrl": mainImage.asset->url,
      publishedAt
    }
  `);
  return courses;
};
