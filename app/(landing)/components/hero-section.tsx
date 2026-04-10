"use client"

import { useEffect, useState, useRef } from "react"
import { ArrowRight } from "lucide-react"
import { DashboardPreview } from "@/app/(landing)/components/dashboard-preview"
import { motion } from "framer-motion"

const ease = [0.22, 1, 0.36, 1] as const

export function HeroSection() {
  const [displayedText1, setDisplayedText1] = useState("")
  const [displayedText2, setDisplayedText2] = useState("")
  const [isTypingDone, setIsTypingDone] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const text1 = "Learn anything."
  const text2 = "Remember everything."

  // Typewriter effect
  useEffect(() => {
    let currentIndex = 0
    const fullText = text1 + "|" + text2

    const typeInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        const currentChar = fullText.substring(0, currentIndex)
        const parts = currentChar.split("|")
        setDisplayedText1(parts[0] || "")
        setDisplayedText2(parts[1] || "")
        currentIndex++
      } else {
        clearInterval(typeInterval)
        setIsTypingDone(true)
      }
    }, 80)

    return () => clearInterval(typeInterval)
  }, [])

  // Canvas animated dots on grid
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    interface GridDot {
      x: number; y: number
      direction: "horizontal" | "vertical"
      speed: number; size: number; opacity: number
      color: string; targetX: number; targetY: number
      trail: { x: number; y: number }[]
    }

    const gridSize = 64
    const dotCount = 20
    const snapToGrid = (value: number) => Math.round(value / gridSize) * gridSize

    const gridDots: GridDot[] = []
    for (let i = 0; i < dotCount; i++) {
      const isHorizontal = Math.random() > 0.5
      const x = snapToGrid(Math.random() * canvas.offsetWidth)
      const y = snapToGrid(Math.random() * canvas.offsetHeight)
      gridDots.push({
        x, y,
        direction: isHorizontal ? "horizontal" : "vertical",
        speed: Math.random() * 1.5 + 1,
        size: Math.random() * 1 + 1,
        opacity: Math.random() * 0.4 + 0.3,
        color: "rgba(234, 88, 12, 0.8)",
        targetX: x, targetY: y, trail: [],
      })
    }

    let animationId: number
    let lastTime = 0
    const frameInterval = 1000 / 30

    const animate = (currentTime: number) => {
      animationId = requestAnimationFrame(animate)
      const deltaTime = currentTime - lastTime
      if (deltaTime < frameInterval) return
      lastTime = currentTime - (deltaTime % frameInterval)

      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      gridDots.forEach((dot) => {
        dot.trail.unshift({ x: dot.x, y: dot.y })
        if (dot.trail.length > 10) dot.trail.pop()

        if (dot.direction === "horizontal") {
          if (Math.abs(dot.x - dot.targetX) < dot.speed) {
            dot.x = dot.targetX
            if (Math.random() > 0.7) {
              dot.direction = "vertical"
              dot.targetY = dot.y + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1) * gridSize
            } else {
              dot.targetX = dot.x + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 8) + 2) * gridSize
            }
          } else {
            dot.x += dot.x < dot.targetX ? dot.speed : -dot.speed
          }
        } else {
          if (Math.abs(dot.y - dot.targetY) < dot.speed) {
            dot.y = dot.targetY
            if (Math.random() > 0.7) {
              dot.direction = "horizontal"
              dot.targetX = dot.x + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 8) + 2) * gridSize
            } else {
              dot.targetY = dot.y + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1) * gridSize
            }
          } else {
            dot.y += dot.y < dot.targetY ? dot.speed : -dot.speed
          }
        }

        if (dot.x < -gridSize) { dot.x = canvas.offsetWidth + gridSize; dot.targetX = dot.x; dot.trail = [] }
        if (dot.x > canvas.offsetWidth + gridSize) { dot.x = -gridSize; dot.targetX = dot.x; dot.trail = [] }
        if (dot.y < -gridSize) { dot.y = canvas.offsetHeight + gridSize; dot.targetY = dot.y; dot.trail = [] }
        if (dot.y > canvas.offsetHeight + gridSize) { dot.y = -gridSize; dot.targetY = dot.y; dot.trail = [] }

        if (dot.trail.length > 1) {
          ctx.beginPath()
          ctx.moveTo(dot.x, dot.y)
          for (let i = 0; i < dot.trail.length; i++) ctx.lineTo(dot.trail[i].x, dot.trail[i].y)
          ctx.strokeStyle = dot.color
          ctx.globalAlpha = dot.opacity * 0.4
          ctx.lineWidth = dot.size
          ctx.lineCap = "round"
          ctx.stroke()
        }

        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.size * 4, 0, Math.PI * 2)
        ctx.fillStyle = dot.color
        ctx.globalAlpha = dot.opacity * 0.15
        ctx.fill()

        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2)
        ctx.fillStyle = dot.color
        ctx.globalAlpha = dot.opacity
        ctx.fill()
      })

      ctx.globalAlpha = 1
    }

    animationId = requestAnimationFrame(animate)
    return () => { window.removeEventListener("resize", resizeCanvas); cancelAnimationFrame(animationId) }
  }, [])

  return (
    <section className="relative overflow-hidden pt-8 pb-4 sm:pt-12 sm:pb-8 lg:pt-16">
      {/* Grid line background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.08)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.08)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      {/* Animated canvas dots */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none [mask-image:radial-gradient(ellipse_80%_60%_at_50%_20%,#000_40%,transparent_100%)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero text block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mx-auto max-w-4xl text-center"
        >
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 border border-border/30 bg-muted/40 px-4 py-1.5 text-sm text-muted-foreground font-mono">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Introducing Athena
          </div>

          {/* Typewriter headline */}
          <h1 className="font-mono text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl relative">
            <span className="invisible" aria-hidden="true">
              <span className="text-balance">Learn anything.</span>
              <span className="text-balance"> Remember everything.</span>
            </span>

            <span className="absolute inset-0 flex flex-col items-center">
              <span className="whitespace-nowrap text-foreground">
                {displayedText1}
                {displayedText2 === "" && (
                  <span className="inline-block w-[3px] h-[0.9em] bg-primary ml-1 animate-pulse" />
                )}
              </span>
              <span className="whitespace-nowrap text-primary">
                {displayedText2}
                {displayedText2 !== "" && (
                  <span className={`inline-block w-[3px] h-[0.9em] bg-primary ml-1 ${isTypingDone ? "animate-blink" : "animate-pulse"}`} />
                )}
              </span>
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg lg:text-xl font-mono">
            Upload PDFs, YouTube videos, websites, and text. Ask Athena anything about your sources.
            Get flashcards, notes, practice tests, and audio walkthroughs — instantly.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="group flex items-center gap-0 bg-foreground text-background text-sm font-mono tracking-wider uppercase w-full sm:w-auto justify-center"
            >
              <span className="flex items-center justify-center w-10 h-10 bg-primary">
                <ArrowRight size={16} strokeWidth={2} className="text-primary-foreground" />
              </span>
              <span className="px-5 py-2.5">Get Started Free</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center border border-border px-6 py-2.5 text-sm font-mono tracking-wider uppercase w-full sm:w-auto text-foreground"
            >
              Watch Demo
            </motion.button>
          </div>
        </motion.div>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease }}
          className="mt-12 relative"
        >
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 blur-3xl opacity-50" />

          <DashboardPreview />


          <div className="lg:hidden flex justify-center mt-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span>Scroll to explore</span>
              <ArrowRight className="h-3 w-3 animate-pulse" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
