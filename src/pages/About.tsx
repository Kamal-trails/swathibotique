import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Heart, Award, Users } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-boutique-cream to-boutique-rose/30 py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6">Our Story</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Where timeless elegance meets modern sophistication
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-8 text-center">
              Welcome to JAANU BOUTIQUE
            </h2>
            <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
              <p className="text-lg leading-relaxed">
                Founded with a passion for elegant fashion and timeless style, JAANU BOUTIQUE has been curating 
                exceptional pieces for the discerning fashionista since our inception. Our journey began with a 
                simple vision: to create a destination where quality meets style, and every piece tells a story.
              </p>
              <p className="text-lg leading-relaxed">
                We believe that fashion is more than just clothing—it's a form of self-expression, confidence, 
                and art. Each item in our collection is carefully selected to embody sophistication while remaining 
                accessible and wearable for everyday life.
              </p>
              <p className="text-lg leading-relaxed">
                Our commitment to quality, sustainability, and exceptional customer service has helped us build a 
                community of loyal customers who trust us to deliver pieces that elevate their wardrobe season 
                after season.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-12 text-center">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-3">Quality First</h3>
                <p className="text-muted-foreground">
                  We source only the finest materials and work with trusted artisans to ensure every piece 
                  meets our exacting standards of quality and craftsmanship.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-3">Timeless Style</h3>
                <p className="text-muted-foreground">
                  We curate collections that transcend fleeting trends, offering pieces that remain stylish 
                  and relevant year after year.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-3">Customer First</h3>
                <p className="text-muted-foreground">
                  Your satisfaction is our priority. From personalized styling advice to hassle-free returns, 
                  we're here to make your shopping experience exceptional.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
              Our Mission
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              To empower individuals through fashion by offering carefully curated, high-quality pieces 
              that inspire confidence and celebrate personal style. We're committed to providing an 
              exceptional shopping experience while maintaining our dedication to sustainability and 
              ethical practices.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-boutique-cream to-boutique-rose/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
              Join the JAANU Family
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience the difference of shopping with a boutique that truly cares about your style journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/shop">
                <button className="btn-boutique px-8 py-3 rounded-lg font-medium">
                  Shop Collection
                </button>
              </a>
              <a href="/contact">
                <button className="btn-outline-gold px-8 py-3 rounded-lg font-medium">
                  Get in Touch
                </button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
