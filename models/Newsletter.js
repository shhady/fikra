import mongoose from 'mongoose';

const NewsletterSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  isSubscribed: {
    type: Boolean,
    default: true
  },
  subscribedAt: { 
    type: Date, 
    default: Date.now 
  },
  lastEmailSent: {
    type: Date
  }
});

export default mongoose.models.Newsletter || mongoose.model('Newsletter', NewsletterSchema); 