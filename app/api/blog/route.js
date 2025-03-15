import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Blog from '@/models/Blog';

// GET all blogs
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language") || "en"; // Default to English
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");

    let query = { isPublished: true };

    if (tag) {
      query.tags = tag;
    }

    const skip = (page - 1) * limit;

    const blogs = await Blog.find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Return only the requested language
    const filteredBlogs = blogs.map((blog) => ({
      slug: blog.slug,
      title: blog.translations[language]?.title || blog.translations["en"].title,
      content: blog.translations[language]?.content || blog.translations["en"].content,
      coverImage: blog.coverImage,
      author: blog.author,
      tags: blog.tags,
      isPublished: blog.isPublished,
      publishedAt: blog.publishedAt
    }));

    return NextResponse.json({
      blogs: filteredBlogs,
      pagination: {
        total: blogs.length,
        page,
        pages: Math.ceil(blogs.length / limit)
      }
    });
  } catch (error) {
    console.error("Blog GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}
// POST new blog
export async function POST(request) {
  try {
    await connectDB();
    
    const data = await request.json();
    
    const blog = await Blog.create({
      slug: data.slug,
      translations: {
        en: {
          title: data.translations.en.title,
          content: data.translations.en.content
        },
        ar: {
          title: data.translations.ar.title,
          content: data.translations.ar.content
        },
        he: {
          title: data.translations.he.title,
          content: data.translations.he.content
        }
      },
      coverImage: data.coverImage,
      author: data.author,
      tags: data.tags,
      isPublished: data.isPublished,
      publishedAt: data.isPublished ? new Date() : null
    });

    return NextResponse.json({ success: true, blog });
  } catch (error) {
    console.error("Blog POST Error:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
