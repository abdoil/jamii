import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 md:grid-cols-5 py-16">
          <div className="md:col-span-2">
            <div className="mb-6">
              <span className="text-2xl font-bold text-white">Jamii</span>
            </div>
            <p className="text-foreground mb-6 max-w-md">
              Transforming supply chains with blockchain technology for a more
              transparent, efficient, and secure future for businesses and
              customers.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white text-lg mb-4">
              Quick Links
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="text-foreground hover:text-white transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="text-foreground hover:text-foreground transition-colors"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-foreground hover:text-foreground transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-lg mb-4">
              For Business
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/auth/signin"
                  className="text-foreground hover:text-foreground transition-colors"
                >
                  Business Login
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/store-signup"
                  className="text-foreground hover:text-foreground transition-colors"
                >
                  Become a Partner
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-lg mb-4">
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Mail className="h-5 w-5 mr-3 text-foreground flex-shrink-0 mt-0.5" />
                <span className="text-foreground">support@jamii.online</span>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 mr-3 text-foreground flex-shrink-0 mt-0.5" />
                <span className="text-foreground">+254 712 345 678</span>
              </li>
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-foreground flex-shrink-0 mt-0.5" />
                <span className="text-foreground">Nairobi, Kenya</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="py-6 border-t border-slate-800 text-center md:flex md:justify-between md:text-left">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Jamii. All rights reserved.
          </p>
          <div className="flex justify-center md:justify-end space-x-6 mt-4 md:mt-0">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
