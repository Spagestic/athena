"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const links = [
    { label: "Features", href: "#features" },
    { label: "About", href: "#about" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full px-4 pt-4 lg:px-6 lg:pt-6"
    >
      <nav className="mx-auto w-full max-w-7xl border border-foreground/20 bg-background/80 px-6 py-3 backdrop-blur-sm lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex items-center gap-3"
          >
            <Link href="/" className="flex items-center group">
              <Image
                alt="Logo"
                className="h-8 w-8 pixel-crisp"
                height={40}
                src="/logo_.png"
                width={40}
              />
              <span className="text-xs font-mono tracking-[0.15em] uppercase font-bold">
                Athena
              </span>
            </Link>
          </motion.div>

          {/* Center nav links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.3 + i * 0.06,
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="text-xs font-mono tracking-widest uppercase text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                {link.label}
              </motion.a>
            ))}
          </div>

          {/* Right side: Login + CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="flex items-center gap-4"
          >
            <Link href={"/login"}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-foreground text-background px-4 py-2 text-xs font-mono tracking-widest uppercase hover:cursor-pointer"
              >
                Login
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </nav>
    </motion.div>
  );
}
