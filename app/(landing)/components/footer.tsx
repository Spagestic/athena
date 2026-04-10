"use client"

import { motion, useReducedMotion } from "framer-motion"

const entrance = [0.16, 1, 0.3, 1] as const

export function Footer() {
  const prefersReduced = useReducedMotion()

  return (
    <motion.footer
      initial={prefersReduced ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: entrance }}
      className="w-full border-t-2 border-foreground px-6 py-8 lg:px-12"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-mono tracking-[0.15em] uppercase font-bold text-foreground">
            ATHENA
          </span>
          <span className="text-[10px] font-mono tracking-widest text-muted-foreground">
            {"(C) 2026 ATHENA. YOUR KNOWLEDGE, ORGANIZED."}
          </span>
        </div>
        <div className="flex items-center gap-6">
          {["Privacy", "Terms", "Status", "About"].map((link, i) => (
            <motion.a
              key={link}
              href="#"
              initial={prefersReduced ? false : { opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.4, ease: entrance }}
              className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {link}
            </motion.a>
          ))}
        </div>
      </div>
    </motion.footer>
  )
}
