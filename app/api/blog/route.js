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

// Improved HTML content cleaner
const cleanHtmlContent = (content) => {
  if (!content || typeof content !== 'string') return '';

  return sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'blockquote', 'pre', 'code', 'br', 'hr', 'span', 'div']),
    allowedAttributes: {
      'a': ['href', 'name', 'target', 'rel', 'title'],
      'img': ['src', 'alt', 'title', 'width', 'height', 'loading'],
      '*': ['id', 'class', 'style']
    },
    allowedStyles: {
      '*': {
        'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
        'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
        'font-size': [/^\d+(?:px|em|rem|%)$/]
      }
    }
  });
};

export async function POST(request) {
  try {
    await connectDB();
    
    // Use buffer to handle the raw request data
    const buffer = await request.arrayBuffer();
    const decoder = new TextDecoder('utf-8');
    const rawBody = decoder.decode(buffer);
    
    // Process the raw body to remove problematic characters
    const cleanedBody = rawBody
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .replace(/\r/g, '') // Remove carriage returns
      .replace(/\t/g, ' ') // Replace tabs with spaces
      .replace(/\f/g, '') // Remove form feed character
      .replace(/\b/g, '') // Remove backspace character
      .replace(/\v/g, ''); // Remove vertical tab character
    
    // Parse the cleaned JSON
    let data;
    try {
      data = JSON.parse(cleanedBody);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON format in request body', details: parseError.message },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!data.title || !data.slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      );
    }

    // Clean the HTML content
    if (data.content) {
      data.content = cleanHtmlContent(data.content);
    } else {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Create the blog post
    const blog = await Blog.create({
      ...data,
      publishedAt: data.isPublished ? new Date() : null
    });

    return NextResponse.json({ 
      success: true, 
      blog,
      message: 'Blog post created successfully' 
    });

  } catch (error) {
    console.error('Blog POST Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create blog post',
        details: error.message 
      },
      { status: 500 }
    );
  }
}