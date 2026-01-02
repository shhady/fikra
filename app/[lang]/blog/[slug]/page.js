import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { blogData } from '@/lib/blogData'

// blogData imported from app/lib/blogData.js

export async function generateStaticParams() {
  return Object.keys(blogData).map((slug) => ({
    slug: slug,
  }))
}

export async function generateMetadata({ params }) {
  const base = 'https://www.fikranova.com'
  const { slug, lang } = await params
  const post = blogData[slug]
  const title = post ? `${post.title} | FikraNova Blog` : 'Blog | FikraNova'
  const description = post?.excerpt || 'AI automation, AI agents, and AI-powered web development insights.'
  const url = `${base}/${lang || 'en'}/blog/${slug}`
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'x-default': `${base}/en/blog/${slug}`,
        en: `${base}/en/blog/${slug}`,
        ar: `${base}/ar/blog/${slug}`,
        he: `${base}/he/blog/${slug}`,
      },
    },
    openGraph: { title, description, url },
  }
}

export default async function BlogPost({ params }) {
  const post =await blogData[params.slug]

  if (!post) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-24">
        <div className="absolute inset-0">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Category & Meta */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="px-4 py-1.5 bg-blue-500/80 backdrop-blur-sm rounded-full text-sm text-white">
                {post.category}
              </span>
              <span className="text-gray-400">{post.date}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">{post.readTime}</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
              {post.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-invert prose-lg max-w-none">
            {post.sections.map((section, index) => (
              <div key={index} className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {section.title}
                </h2>
                <p className="text-gray-300 leading-relaxed mb-6">
                  {section.content}
                </p>
                {section.listItems && (
                  <ul className="list-disc list-inside space-y-2 text-gray-300 mb-6">
                    {section.listItems.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
                {section.quote && (
                  <blockquote className="border-r-4 border-blue-500 pr-6 my-8">
                    <p className="text-xl text-gray-300 italic">
                      {section.quote}
                    </p>
                  </blockquote>
                )}
              </div>
            ))}

            {/* Conclusion */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-white mb-6">
                {post.conclusion.title}
              </h2>
              <p className="text-gray-300 leading-relaxed">
                {post.conclusion.content}
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-12">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 bg-white/5 rounded-xl text-sm text-gray-400"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Share Section */}
          <div className="border-t border-gray-800 mt-12 pt-12">
            <h3 className="text-xl font-bold text-white mb-6">شارك المقال</h3>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-[#1DA1F2] text-white rounded-xl hover:bg-[#1a8cd8] transition-colors">
                Twitter شارك على
              </button>
              <button className="px-6 py-3 bg-[#0A66C2] text-white rounded-xl hover:bg-[#094c8f] transition-colors">
                LinkedIn شارك على
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}