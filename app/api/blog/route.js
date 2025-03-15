import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Blog from '@/models/Blog';
import sanitizeHtml from 'sanitize-html';

// GET all blogs
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');

    let query = { isPublished: true };

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit),
      Blog.countDocuments(query)
    ]);

    return NextResponse.json({
      blogs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Blog GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

// POST new blog

const cleanContent = (content) => {
  if (!content || typeof content !== 'string') return '';

  return sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'p', 'ul', 'li', 'strong', 'em', 'a']),
    allowedAttributes: {
      'a': ['href', 'name', 'target'],
      'img': ['src', 'alt']
    },
    textFilter: (text) =>
      text
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
        .replace(/\r/g, '') // Remove carriage returns
        .replace(/\t/g, ' ') // Replace tabs with spaces
        .replace(/\f/g, '') // Remove form feed character
        .replace(/\b/g, '') // Remove backspace character
        .replace(/\v/g, '') // Remove vertical tab character
        .replace(/\\/g, '\\\\') // Properly escape backslashes
        .replace(/"/g, '\"') // Properly escape double quotes
        .replace(/\n/g, ' ') // Remove newlines to prevent JSON issues
        .trim(), // Remove leading and trailing whitespace
  });
};
export async function POST(request) {
  try {
    await connectDB();
    
    const data = await request.json();

    // Sanitize content
    data.content = cleanContent(data.content);

    if (!data.title || !data.slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      );
    }

    const blog = await Blog.create({
      ...data,
      publishedAt: data.isPublished ? new Date() : null
    });

    return NextResponse.json({ success: true, blog });
  } catch (error) {
    console.error('Blog POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}