import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="display-heading mb-4 text-3xl">About Us</h1>
          <h2 className="display-heading mb-4 text-xl">Deva Pk Medicine in Pakistan Wholesale 100% Natural</h2>
          <p className="display-heading text-lg">About Deva Pk Medicine in Rawalpindi!</p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <section className="border-2 border-foreground p-8">
            <p className="mb-6 text-foreground leading-relaxed">
              At Deva Pk Medicine in Rawalpindi you experience an easy & hassle free online shopping in Pakistan. 
              Deva Pk Medicine in Pakistan is a platform where you can avail bundles of outrageous discounts on 
              quality products & services. We work with the best companies to bring you goods/offers you wish for. 
              At Deva Pk we strive to achieve the highest level of "customer satisfaction" possible. Our cutting 
              edge e-commerce platform, highly experienced team & quality brands do it in style.
            </p>
          </section>

          <section className="border-2 border-foreground p-8">
            <h2 className="display-heading mb-6 text-xl">What is Herbalism?</h2>
            <p className="mb-4 text-foreground leading-relaxed">
              Herbalism (also herbal medicine or phytotherapy) is the study of botany and use of plants intended 
              for medicinal purposes or for supplementing a diet. Plants have been the basis for medical 
              treatments through much of human history, and such traditional medicine is still widely practiced 
              today.
            </p>
            <p className="mb-4 text-foreground leading-relaxed">
              Modern medicine recognizes herbalism as a form of alternative medicine and pseudoscience, as the 
              practice of herbalism is not strictly based on evidence gathered using the scientific method. 
              Modern medicine makes use of many plant-derived compounds as the basis for evidence-based 
              pharmaceutical drugs.
            </p>
          </section>

          {/* Contact Information */}
          <section className="border-2 border-foreground p-8">
            <h2 className="display-heading mb-6 text-xl">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-mono text-sm font-bold uppercase">Phone:</span>
                <span className="font-mono text-sm">+92 345 700 0088</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-sm font-bold uppercase">UAN:</span>
                <span className="font-mono text-sm">+92 304 111 1934</span>
              </div>
            </div>
          </section>

          {/* Footer Message */}
          <section className="border-2 border-foreground p-8">
            <p className="text-foreground leading-relaxed">
              We believe DevaPk Health to be a special company of people proud of their past and excited about 
              their future. Above all, it is a company defined by the character and integrity of its people. 
              As we work to serve our customers, to build strong technology and product.
            </p>
          </section>
        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link 
            to="/" 
            className="inline-block border-2 border-foreground bg-foreground px-8 py-3 font-mono text-sm font-bold uppercase tracking-widest text-background hover:bg-transparent hover:text-foreground"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
