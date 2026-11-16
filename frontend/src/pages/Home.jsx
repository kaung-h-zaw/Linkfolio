import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import ResumePortfolioShowcase from '../components/ResumePortfolioShowcase'
import PricingPreview from '../components/PricingPreview'
import CTA from '../components/CTA'
import Footer from '../components/Footer'
import '../components/publicPages.css'
export default function Home() {
  return (
    <div className="public-home">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <HowItWorks />
        <ResumePortfolioShowcase />
        <PricingPreview />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
