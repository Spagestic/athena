"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useMotionValueEvent, useReducedMotion } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState } from "react"

const entrance = [0.16, 1, 0.3, 1] as const

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()
  const prefersReduced = useReducedMotion()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 100)
  })

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: entrance }}
      className="w-full px-4 pt-4 lg:px-6 lg:pt-6 sticky top-0 z-50"
    >
      <nav
        className={`w-full border border-foreground/20 px-6 py-3 lg:px-8 transition-all duration-300 ${
          scrolled
            ? "bg-background/95 backdrop-blur-md border-foreground/30"
            : "bg-background/80 backdrop-blur-sm"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4, ease: entrance }}
            className="flex items-center gap-3"
          >
            <Image
              src="/logo.png"
              alt="Athena"
              width={24}
              height={24}
              className="dark:invert"
            />
            <span className="text-xs font-mono tracking-[0.15em] uppercase font-bold">
              ATHENA
            </span>
          </motion.div>

          {/* Center nav links */}
          <div className="hidden md:flex items-center gap-8">
            {([
              { label: "Features", href: "#features" },
              { label: "Pricing", href: "#pricing" },
              { label: "Docs", href: "#" },
              { label: "About", href: "#about" },
            ] as const).map(({ label, href }, i) => (
              <motion.a
                key={label}
                href={href}
                initial={prefersReduced ? false : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.04, duration: 0.4, ease: entrance }}
                className="text-xs font-mono tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {label}
              </motion.a>
            ))}
          </div>

          {/* Right side: Login + CTA */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4, ease: entrance }}
            className="flex items-center gap-4"
          >
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden sm:block text-xs font-mono tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Log In
            </Link>
            <motion.div
              whileHover={prefersReduced ? {} : { scale: 1.02 }}
              whileTap={prefersReduced ? {} : { scale: 0.97 }}
            >
              <Link
                href="/signup"
                className="relative overflow-hidden bg-foreground text-background px-4 py-2 text-xs font-mono tracking-widest uppercase group flex items-center"
              >
                <span className="absolute inset-0 bg-[#E97316] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                <span className="relative z-10">Get Started Free</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </nav>
    </motion.div>
  )
}
