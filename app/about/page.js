import Image from 'next/image'
import Link from 'next/link'
import { FaLinkedinIn, FaTwitter } from 'react-icons/fa'

export const metadata = {
  title: 'من نحن | وكالة الذكاء الاصطناعي',
  description: 'تعرف على وكالتنا المتخصصة في حلول الذكاء الاصطناعي وكيف نساعد الشركات على النمو والتطور',
}

const teamMembers = [
    {
        id: 1,
        name: 'شحاده سرحان',
        // role: 'الرئيس التنفيذي/المدير التقني/خبير الذكاء الاصطناعي',
        role: '',
        image: '/team/ceo.jpg',
        linkedin: 'https://www.linkedin.com/in/shhady-serhan-a11403124/',
        // twitter: '#',
      },
      {
        id: 2,
        name: 'عُمري منصور',
        role: '',
        image: '/team/devops-specialist.jpg',
        linkedin: 'https://www.linkedin.com/in/omri-mansour-1b35b6a0/',
        // twitter: '#',
      },
]

const values = [
  {
    id: 1,
    title: 'الابتكار',
    description: 'نسعى دائماً لتقديم حلول مبتكرة تتجاوز التوقعات',
    icon: '💡',
  },
  {
    id: 2,
    title: 'الجودة',
    description: 'نلتزم بأعلى معايير الجودة في كل ما نقدمه',
    icon: '⭐',
  },
  {
    id: 3,
    title: 'الشفافية',
    description: 'نؤمن بالتواصل المفتوح والشفاف مع عملائنا',
    icon: '🤝',
  },
  {
    id: 4,
    title: 'التطور المستمر',
    description: 'نواكب أحدث التقنيات لنقدم أفضل الحلول',
    icon: '📈',
  },
]

export default function AboutPage() {
  return (
    <main className="bg-black min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-black to-black opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            نحن نبتكر المستقبل
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            وكالة متخصصة في تقديم حلول الذكاء الاصطناعي المتكاملة لتمكين الشركات من النمو والتطور
          </p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-gradient-to-b from-black to-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">رؤيتنا</h2>
              <p className="text-gray-300 leading-relaxed">
                نسعى لأن نكون الرواد في تقديم حلول الذكاء الاصطناعي في العالم العربي، 
                ملتزمين بتمكين الشركات من مواكبة التطور التقني وتحقيق النمو المستدام.
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">رسالتنا</h2>
              <p className="text-gray-300 leading-relaxed">
                مهمتنا هي جسر الفجوة بين الممارسات التجارية التقليدية وتقنيات الذكاء الاصطناعي المتقدمة،
                من خلال تقديم حلول مبتكرة تساعد الشركات على تحسين كفاءتها وتعزيز تجربة عملائها.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-gradient-to-b from-blue-950 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">قيمنا الأساسية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.id} className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gradient-to-b from-black to-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">فريقنا المتميز</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl text-center">
                <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                <p className="text-gray-400 mb-4">{member.role}</p>
                <div className="flex justify-center space-x-4">
                  <a href={member.linkedin} className="text-gray-400 hover:text-white">
                    <FaLinkedinIn className="w-5 h-5" />
                  </a>
                  {/* <a href={member.twitter} className="text-gray-400 hover:text-white">
                    <FaTwitter className="w-5 h-5" />
                  </a> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-blue-950 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-3xl p-8 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="relative z-10">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  هل أنت جاهز لتطوير أعمالك؟
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  دعنا نساعدك في تحقيق أهدافك من خلال حلول الذكاء الاصطناعي المتطورة
                </p>
                <Link
                  href="/contact"
                  className="inline-block bg-white text-blue-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-50 transition-colors duration-300"
                >
                  تواصل معنا
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
} 