import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Blog from '@/models/Blog';

// GET single blog
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const blog = await Blog.findOne({ 
      slug: params.slug,
      isPublished: true 
    });

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Blog GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog' },
      { status: 500 }
    );
  }
}

// PUT update blog
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const data = await request.json();
    const blog = await Blog.findOne({ slug: params.slug });

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Handle publishing status change
    if (!blog.isPublished && data.isPublished) {
      data.publishedAt = new Date();
    }

    const updatedBlog = await Blog.findOneAndUpdate(
      { slug: params.slug },
      { ...data },
      { new: true }
    );

    return NextResponse.json({ success: true, blog: updatedBlog });
  } catch (error) {
    console.error('Blog PUT Error:', error);
    return NextResponse.json(
      { error: 'Failed to update blog' },
      { status: 500 }
    );
  }
}

// DELETE blog
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const blog = await Blog.findOneAndDelete({ slug: params.slug });

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Blog DELETE Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
} 