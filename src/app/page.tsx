"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Upload,
  Sparkles,
  Download,
  Shield,
  Zap,
  FileText,
  Printer,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeInView, StaggerContainer, StaggerItem } from "@/components/MotionWrapper";

// ─── Data Constants ──────────────────────────────────────────────────────────

const STEPS = [
  {
    icon: Upload,
    title: "Upload Photo",
    description: "Drop any portrait photo — JPG or PNG up to 5MB.",
    bgLight: "bg-blue-50",
    bgDark: "dark:bg-blue-950/30",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Sparkles,
    title: "AI Processes",
    description: "Background removed instantly in HD with zero quality loss.",
    bgLight: "bg-indigo-50",
    bgDark: "dark:bg-indigo-950/30",
    textColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    icon: Download,
    title: "Download & Print",
    description: "Get your PNG/PDF or generate print-ready A4 passport sheets.",
    bgLight: "bg-emerald-50",
    bgDark: "dark:bg-emerald-950/30",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
] as const;

const FEATURES = [
  {
    icon: ImageIcon,
    title: "HD Background Removal",
    description: "AI-powered precision removal that preserves every detail — hair, edges, and transparency.",
  },
  {
    icon: Printer,
    title: "Passport Sheet Generator",
    description: "Configure quantity, size, gap, and margin for standard passport photo grids.",
  },
  {
    icon: FileText,
    title: "PDF & PNG Export",
    description: "Download in any format — high-resolution PNG for digital or PDF for direct printing.",
  },
  {
    icon: Zap,
    title: "Instant Processing",
    description: "Results in under 5 seconds. No waiting, no queues, no account required.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Images are processed on-server and never stored. Your photos stay yours.",
  },
  {
    icon: CheckCircle2,
    title: "Print-Ready Quality",
    description: "A4 layouts with precise cutting guides, optimized for professional printing.",
  },
] as const;

const STATS = [
  { value: "< 5s", label: "Processing Time" },
  { value: "HD", label: "Output Quality" },
  { value: "100%", label: "Private & Secure" },
  { value: "A4", label: "Print-Ready Sheets" },
] as const;

// ─── Page Component ──────────────────────────────────────────────────────────

export default function Home() {
  return (
    <main className="flex flex-col">
      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] sm:min-h-screen flex items-center justify-center overflow-hidden pt-20 sm:pt-16">
        {/* Background gradient mesh */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-[80px] sm:blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-indigo-200/30 dark:bg-indigo-900/20 rounded-full blur-[80px] sm:blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-[60px] sm:blur-[100px]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-5 sm:space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 rounded-full text-sm font-semibold text-blue-700 dark:text-blue-300">
              <Sparkles className="w-4 h-4" />
              AI-Powered Photo Studio
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.1] sm:leading-[1.05]"
          >
            Perfect Photos,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Instantly
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto font-medium leading-relaxed px-2 sm:px-0"
          >
            Remove backgrounds in HD, generate passport-size A4 layouts, and download
            print-ready files — all in seconds, no signup needed.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 w-full"
          >
            <Link href="/upload">
              <Button className="w-full sm:w-auto h-12 sm:h-14 px-8 text-base font-semibold rounded-full shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                Start Now — It&apos;s Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-12 sm:h-14 px-8 text-base font-semibold rounded-full border-2 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all"
              >
                See How It Works
              </Button>
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-6 text-sm text-neutral-500 dark:text-neutral-400 font-medium"
          >
            {["No signup required", "100% Private", "Instant Results"].map(
              (badge) => (
                <span key={badge} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {badge}
                </span>
              )
            )}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works Section ─────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-neutral-50/50 dark:bg-neutral-950/50"
      >
        <div className="max-w-6xl mx-auto">
          <FadeInView className="text-center mb-10 sm:mb-16">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Simple Process
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight mt-3">
              How It Works
            </h2>
            <p className="text-sm sm:text-lg text-neutral-500 dark:text-neutral-400 font-medium mt-3 sm:mt-4 max-w-xl mx-auto">
              Three simple steps to get your perfect document photos ready for print.
            </p>
          </FadeInView>

          <StaggerContainer
            staggerDelay={0.15}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8"
          >
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <StaggerItem key={step.title}>
                  <div className="relative group">
                    {/* Connector line (visible on desktop between cards) */}
                    {i < STEPS.length - 1 && (
                      <div className="hidden md:block absolute top-14 left-[calc(50%+60px)] w-[calc(100%-80px)] h-0.5 bg-gradient-to-r from-neutral-200 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900" />
                    )}
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200/60 dark:border-neutral-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center">
                      {/* Step number */}
                      <span className="text-xs font-black uppercase tracking-widest text-neutral-300 dark:text-neutral-700 mb-4 block">
                        Step {i + 1}
                      </span>
                      {/* Icon */}
                      <div
                        className={`inline-flex items-center justify-center w-16 h-16 ${step.bgLight} ${step.bgDark} rounded-2xl mb-5`}
                      >
                        <Icon className={`w-7 h-7 ${step.textColor}`} />
                      </div>
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ── Features Grid Section ────────────────────────────────────────── */}
      <section id="features" className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <FadeInView className="text-center mb-10 sm:mb-16">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight mt-3">
              Everything You Need
            </h2>
            <p className="text-sm sm:text-lg text-neutral-500 dark:text-neutral-400 font-medium mt-3 sm:mt-4 max-w-xl mx-auto">
              From background removal to print-ready passport sheets — all tools in one place.
            </p>
          </FadeInView>

          <StaggerContainer
            staggerDelay={0.1}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <StaggerItem key={feature.title}>
                  <div className="group bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200/60 dark:border-neutral-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-1.5">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ── Stats / Trust Bar ────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <FadeInView>
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  {stat.value}
                </p>
                <p className="text-sm text-blue-100 font-medium mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </FadeInView>
      </section>

      {/* ── Final CTA Section ────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <FadeInView>
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Ready to Create{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Perfect Photos?
              </span>
            </h2>
            <p className="text-base sm:text-lg text-neutral-500 dark:text-neutral-400 font-medium max-w-lg mx-auto">
              Upload your photo and get professional results in seconds. Free, private, and instant.
            </p>
            <Link href="/upload">
              <Button className="w-full sm:w-auto h-12 sm:h-14 px-10 text-base font-semibold rounded-full shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                Get Started — Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </FadeInView>
      </section>
    </main>
  );
}
