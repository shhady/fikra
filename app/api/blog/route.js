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
    }
  });
};

export async function POST(request) {
  try {
    await connectDB();
    
    // Get the content type
    const contentType = request.headers.get('content-type') || '';
    let data;
    
    // Handle different content types
    if (contentType.includes('application/json')) {
      // Get the raw text and manually clean it
      const text = await request.text();
      
      // Replace problematic control characters
      const cleanedText = text
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
        .replace(/\r/g, '');
      
      try {
        data = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        return NextResponse.json({
          error: 'Invalid JSON format',
          details: parseError.message
        }, { status: 400 });
      }
    } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      // Handle form data
      const formData = await request.formData();
      data = {
        title: formData.get('title'),
        slug: formData.get('slug'),
        content: formData.get('content'),
        coverImage: formData.get('coverImage'),
        language: formData.get('language'),
        author: formData.get('author'),
        tags: formData.get('tags')?.split(',').map(tag => tag.trim()) || [],
        isPublished: formData.get('isPublished') === 'true'
      };
    } else {
      // Unsupported content type
      return NextResponse.json({
        error: 'Unsupported content type',
        details: `Content-Type must be application/json, multipart/form-data, or application/x-www-form-urlencoded. Received: ${contentType}`
      }, { status: 415 });
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

// Helper functions to extract fields from malformed JSON
function extractField(text, fieldName, isHtml = false) {
  const regex = new RegExp(`"${fieldName}"\\s*:\\s*"([^"]*)"`, 'i');
  const match = text.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  
  // For HTML content which might contain quotes
  if (isHtml) {
    const startMarker = `"${fieldName}": "`;
    const startIndex = text.indexOf(startMarker);
    if (startIndex !== -1) {
      let content = '';
      let inContent = true;
      let i = startIndex + startMarker.length;
      let quoteCount = 0;
      
      while (i < text.length && inContent) {
        if (text[i] === '"' && text[i-1] !== '\\') {
          quoteCount++;
          if (quoteCount > 0 && text[i+1] === ',') {
            inContent = false;
          }
        }
        if (inContent) {
          content += text[i];
        }
        i++;
      }
      
      return content;
    }
  }
  
  return '';
}

function extractTags(text) {
  try {
    const tagsMatch = text.match(/"tags"\s*:\s*\[(.*?)\]/);
    if (tagsMatch && tagsMatch[1]) {
      return tagsMatch[1].split(',').map(tag => 
        tag.trim().replace(/"/g, '')
      ).filter(tag => tag);
    }
  } catch (e) {
    console.error('Error extracting tags:', e);
  }
  return [];
}