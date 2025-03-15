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
    
    // Read the request body only once
    const buffer = await request.arrayBuffer();
    const text = new TextDecoder().decode(buffer);
    
    // Clean the text before parsing
    const cleanedText = text
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
      .replace(/\r/g, '');
    
    // Try to parse the JSON
    let data;
    try {
      data = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      
      // Create a simple response for debugging
      return NextResponse.json({
        error: 'Invalid JSON format',
        details: parseError.message,
        position: parseError.message.match(/position (\d+)/)?.[1] || 'unknown',
        snippet: cleanedText.substring(
          Math.max(0, parseInt(parseError.message.match(/position (\d+)/)?.[1] || 0) - 20),
          Math.min(cleanedText.length, parseInt(parseError.message.match(/position (\d+)/)?.[1] || 0) + 20)
        )
      }, { status: 400 });
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