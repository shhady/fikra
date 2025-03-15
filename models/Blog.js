import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true 
  },
  content: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  coverImage: { 
    type: String, 
    required: true 
  },
  author: { 
    type: String, 
    required: true,
    default: 'فريق فكرة نوفا'
  },
  language: { type: String, enum: ['ar', 'he', 'en'], required: true }, // Add Language
  
  tags: [{ 
    type: String 
  }],
  isPublished: { 
    type: Boolean, 
    default: false 
  },
  publishedAt: { 
    type: Date 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date 
  }
});

// Auto-generate slug from title before saving
BlogSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\u0621-\u064A\s]/g, '')
      .replace(/\s+/g, '-')
      + '-' + Date.now().toString().slice(-4);
  }
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema); 