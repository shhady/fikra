import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// Blog data
const blogData = {
  'how-ai-transforms-business': {
    title: 'كيف يغير الذكاء الاصطناعي مستقبل الأعمال؟',
    slug: 'how-ai-transforms-business',
    excerpt: 'اكتشف كيف تقوم الشركات بتحويل أعمالها باستخدام تقنيات الذكاء الاصطناعي المتقدمة وكيف يمكنك الاستفادة من هذه التقنيات.',
    image: '/blog/ai-business.jpg',
    date: '٢٠٢٤/٠٣/١٥',
    readTime: '٥ دقائق',
    category: 'تطوير الأعمال',
    tags: ['الذكاء الاصطناعي', 'تطوير الأعمال', 'التحول الرقمي'],
    sections: [
      {
        title: 'مقدمة',
        content: `يشهد عالم الأعمال تحولاً جذرياً مع دخول تقنيات الذكاء الاصطناعي في مختلف المجالات. 
                 من تحسين خدمة العملاء إلى أتمتة العمليات الداخلية، أصبح الذكاء الاصطناعي عنصراً 
                 أساسياً في استراتيجيات الشركات الناجحة.`
      },
      {
        title: 'تطبيقات الذكاء الاصطناعي في الأعمال',
        content: `تتعدد تطبيقات الذكاء الاصطناعي في مجال الأعمال، ومن أهمها:`,
        listItems: [
          'تحليل البيانات واتخاذ القرارات',
          'أتمتة العمليات الروتينية',
          'تحسين تجربة العملاء',
          'التنبؤ بسلوك المستهلك',
          'تحسين الأمن السيبراني'
        ]
      },
      {
        title: 'مستقبل الذكاء الاصطناعي في الأعمال',
        content: `مع تطور التقنيات وزيادة اعتماد الشركات على الذكاء الاصطناعي، نتوقع رؤية المزيد 
                 من التطبيقات المبتكرة التي ستغير وجه الأعمال بشكل جذري.`,
        quote: 'الذكاء الاصطناعي ليس مجرد تقنية، بل هو مستقبل الأعمال الذي نعيشه اليوم.'
      }
    ],
    conclusion: {
      title: 'الخاتمة',
      content: `لم يعد السؤال هو "هل" ستتبنى الشركات الذكاء الاصطناعي، بل "متى" و"كيف". 
               الشركات التي تتبنى هذه التقنيات مبكراً ستكون في موقع أفضل للمنافسة في السوق.`
    }
  },
  'top-5-ai-marketing-apps': {
    title: 'أفضل ٥ تطبيقات للذكاء الاصطناعي في التسويق الرقمي',
    slug: 'top-5-ai-marketing-apps',
    excerpt: 'تعرف على كيفية استخدام الذكاء الاصطناعي لتحسين حملاتك التسويقية وزيادة معدلات التحويل.',
    image: '/blog/ai-marketing.jpg',
    date: '٢٠٢٤/٠٣/١٠',
    readTime: '٧ دقائق',
    category: 'التسويق الرقمي',
    tags: ['التسويق الرقمي', 'الذكاء الاصطناعي', 'تحسين التحويل'],
    sections: [
      {
        title: 'مقدمة',
        content: `يشهد مجال التسويق الرقمي تطوراً مستمراً مع دخول تقنيات الذكاء الاصطناعي. 
                 في هذا المقال، سنستعرض أفضل ٥ تطبيقات للذكاء الاصطناعي في التسويق الرقمي.`
      },
      {
        title: 'أفضل تطبيقات الذكاء الاصطناعي في التسويق',
        content: `إليك أهم التطبيقات التي تحدث ثورة في عالم التسويق الرقمي:`,
        listItems: [
          'تحليل سلوك المستخدم وتخصيص المحتوى',
          'تحسين معدلات التحويل',
          'إدارة حملات التسويق الآلي',
          'تحليل المنافسين',
          'توقع سلوك العملاء'
        ]
      }
    ],
    conclusion: {
      title: 'الخاتمة',
      content: `مع تطور تقنيات الذكاء الاصطناعي، أصبح من الضروري على المسوقين مواكبة هذه التطورات 
               والاستفادة منها في تحسين حملاتهم التسويقية.`
    }
  },
  'future-of-web-development': {
    title: 'مستقبل تطوير المواقع مع الذكاء الاصطناعي',
    slug: 'future-of-web-development',
    excerpt: 'اكتشف كيف يمكن للذكاء الاصطناعي تسريع عملية تطوير المواقع وتحسين تجربة المستخدم.',
    image: '/blog/ai-development.jpg',
    date: '٢٠٢٤/٠٣/٠٥',
    readTime: '٦ دقائق',
    category: 'تطوير المواقع',
    tags: ['تطوير المواقع', 'الذكاء الاصطناعي', 'تجربة المستخدم'],
    sections: [
      {
        title: 'مقدمة',
        content: `يتغير مجال تطوير المواقع بشكل سريع مع دخول تقنيات الذكاء الاصطناعي. 
                 نستعرض في هذا المقال أهم التغييرات والتطورات في هذا المجال.`
      },
      {
        title: 'تأثير الذكاء الاصطناعي على تطوير المواقع',
        content: `يؤثر الذكاء الاصطناعي على تطوير المواقع في عدة مجالات:`,
        listItems: [
          'تسريع عملية التطوير',
          'تحسين تجربة المستخدم',
          'اختبار وتحسين الأداء',
          'تخصيص المحتوى',
          'تحسين الأمان'
        ]
      }
    ],
    conclusion: {
      title: 'الخاتمة',
      content: `مستقبل تطوير المواقع مرتبط بشكل وثيق بالذكاء الاصطناعي، والمطورون الذين يواكبون 
               هذه التطورات سيكونون في موقع أفضل للمنافسة.`
    }
  }
}

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