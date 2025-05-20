"use client";

import React from "react";

const navLinksGroup1 = [
  { name: "Falcon 9", href: "/vehicles/falcon-9/" },
  { name: "Falcon Heavy", href: "/vehicles/falcon-heavy/" },
  { name: "Dragon", href: "/vehicles/dragon/" },
  { name: "Starship", href: "/vehicles/starship/" },
  { name: "Human Spaceflight", href: "/humanspaceflight/" },
  { name: "Rideshare", href: "/rideshare/" },
  { name: "Starshield", href: "/starshield/" },
  { name: "Starlink", href: "https://www.starlink.com" },
];

const navLinksGroup2 = [
  { name: "Mission", href: "/mission/" },
  { name: "Launches", href: "/launches/" },
  { name: "Careers", href: "/careers/" },
  { name: "Updates", href: "/updates/" },
  { name: "Shop", href: "https://shop.spacex.com/" },
  { name: "Shooting Game", href: "/shooting-game/" },
];

const footerLinks = [
  { name: "PRIVACY POLICY", href: "/media/privacy_policy_spacex.pdf" },
  { name: "SUPPLIERS", href: "/supplier/" },
];

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen max-w-5xl mx-auto px-4 py-8">
      {/* Logo */}
      <header className="mb-12 flex justify-center">
        <h1 className="text-6xl font-extrabold tracking-widest font-sans">
          SPACEX
        </h1>
      </header>

      {/* Navigation */}
      <nav className="mb-12">
        <ul className="flex flex-wrap justify-center gap-6 mb-6">
          {navLinksGroup1.map((link) => (
            <li key={link.name}>
              <a
                href={link.href}
                className="text-black hover:underline font-medium text-lg"
                target={link.href.startsWith("http") ? "_blank" : "_self"}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : ""}
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>
        <ul className="flex flex-wrap justify-center gap-6">
          {navLinksGroup2.map((link) => (
            <li key={link.name}>
              <a
                href={link.href}
                className="text-black hover:underline font-medium text-lg"
                target={link.href.startsWith("http") ? "_blank" : "_self"}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : ""}
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-300 pt-6 flex flex-col items-center gap-4 text-sm font-light">
        <p>SpaceX © 2025</p>
        <div className="flex gap-6">
          {footerLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-black hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.name}
            </a>
          ))}
        </div>
      </footer>
    </main>
  );
}
