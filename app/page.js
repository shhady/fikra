import Hero from '@/components/Hero'
import ServicesShowcase from '@/components/ServicesShowcase'
import FeaturesSection from '@/components/FeaturesSection'
import CTASection from '@/components/CTASection'

export default function Home() {
  return (
    <main className="bg-black">
      <Hero />
      <ServicesShowcase />
      <FeaturesSection />
      <CTASection />
    </main>
  )
}
