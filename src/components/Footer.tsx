import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-muted border-t border-border mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-2xl font-bold mb-4">
              JAANU <span className="text-accent">BOUTIQUE</span>
            </h3>
            <p className="text-muted-foreground mb-4">
              Celebrating India's rich textile heritage through exquisite sarees, lehengas, and ethnic wear.
            </p>
            <div className="flex gap-3">
              <a href="#" className="hover:text-accent transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/shop" className="text-muted-foreground hover:text-accent transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link to="/shop?category=ethnic" className="text-muted-foreground hover:text-accent transition-colors">
                  Ethnic Wear
                </Link>
              </li>
              <li>
                <Link to="/shop?category=bridal" className="text-muted-foreground hover:text-accent transition-colors">
                  Bridal Collection
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-accent transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-accent transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                  Returns & Exchanges
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                  Size Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Stay Connected</h4>
            <p className="text-muted-foreground mb-4">
              Subscribe to receive updates on new collections, festive offers, and styling tips.
            </p>
            <form className="flex flex-col gap-2">
              <Input type="email" placeholder="Your email" />
              <Button className="btn-gold">Subscribe</Button>
            </form>
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>hello@jaanuboutique.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 JAANU BOUTIQUE. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-accent transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-accent transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
