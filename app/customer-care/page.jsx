"use client";

import { Mail, Phone, MessageCircle, Instagram, Twitter, Facebook } from "lucide-react";

export default function CustomerCare() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Customer Care</h1>
          <p className="text-gray-600">
            Need help? Our team is here to assist you. Choose your preferred contact method below.
          </p>
        </header>

        {/* Contact Info */}
        <section className="bg-white border rounded-2xl shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Contact Us</h2>

          <div className="space-y-4 text-gray-700">

            {/* Email */}
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <span>
                Email:{" "}
                <a
                  href="mailto:godstimegodwin111@gmail.com"
                  className="text-blue-600 hover:underline"
                >
                  godstimegodwin111@gmail.com
                </a>
              </span>
            </div>

            {/* Normal Phone */}
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-green-600" />
              <span>
                Phone:{" "}
                <a
                  href="tel:+2349153607825"
                  className="text-green-600 hover:underline"
                >
                  09153607825
                </a>
              </span>
            </div>

            {/* WhatsApp */}
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-green-500" />
              <span>
                WhatsApp:{" "}
                <a
                  href="https://wa.me/2348120502003"
                  target="_blank"
                  className="text-green-500 hover:underline"
                >
                  08120502003
                </a>
              </span>
            </div>

            {/* Telegram Group */}
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              <span>
                Telegram Group:{" "}
                <a
                  href="https://t.me/chuloenterprise"
                  target="_blank"
                  className="text-blue-500 hover:underline"
                >
                  Join Group
                </a>
              </span>
            </div>

          </div>
        </section>

        {/* Social Links */}
        {/* <section className="bg-white border rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 text-center">Connect With Us</h2>
          <p className="text-gray-600 text-center">Follow us on social media for updates and support.</p>

          <div className="flex justify-center gap-6 text-gray-600">
            <a href="#" target="_blank" className="hover:text-blue-500 transition">
              <Twitter className="w-7 h-7" />
            </a>
            <a href="#" target="_blank" className="hover:text-pink-500 transition">
              <Instagram className="w-7 h-7" />
            </a>
            <a href="#" target="_blank" className="hover:text-blue-700 transition">
              <Facebook className="w-7 h-7" />
            </a>
          </div>
        </section> */}

        {/* Help Note */}
        <div className="text-center text-gray-600">
          <p>
            Our support team is available <strong>24/7</strong>. Expect a response within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
