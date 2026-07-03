"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Zap,
  Route,
  BarChart3,
  GitBranch,
  Cpu,
  Shield,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Route, title: "Model Routing", desc: "Intelligent prompt analysis routes every request to the optimal model." },
  { icon: BarChart3, title: "Observability", desc: "Track latency, tokens, cost, and cache performance in real-time." },
  { icon: GitBranch, title: "Agent Loops", desc: "Autonomous coding agents with live step-by-step execution." },
  { icon: Cpu, title: "Fast Inference", desc: "Powered by Fireworks AI serverless endpoints for sub-second responses." },
  { icon: Shield, title: "Bring Your Own Key", desc: "Use your own Fireworks API key — stored in your browser, never on our servers." },
  { icon: Zap, title: "Open Models", desc: "Access DeepSeek, GLM, Kimi, and more state-of-the-art open models." },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const itemAnimation = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FFF9F5] overflow-hidden">
      {/* Warm gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#FF7A6E]/5 via-[#FFD89B]/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-[#F6D7D3]/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex items-center justify-between gap-3 px-4 sm:px-8 py-5 max-w-6xl mx-auto"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-[#FF7A6E] to-[#FFD89B] flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight whitespace-nowrap">Ember AI</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link href="/settings" className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Key className="w-3.5 h-3.5" />
              Add API Key
            </Button>
          </Link>
          <Link href="/chat">
            <Button size="sm" className="gap-1.5 whitespace-nowrap">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-16"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F6D7D3]/50 border border-[#F0E4E0] text-sm text-[#666] mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FF7A6E]" />
          <span>Powered by Fireworks AI</span>
        </motion.div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] max-w-4xl">
          <span className="text-[#222]">Fast ideas deserve</span>
          <br />
          <span className="bg-gradient-to-r from-[#FF7A6E] via-[#e8685a] to-[#FFD89B] bg-clip-text text-transparent">
            fast intelligence.
          </span>
        </h1>

        <p className="mt-6 text-lg text-[#666] max-w-xl leading-relaxed">
          An elegant AI workspace powered by Fireworks AI. Bring your own API key,
          explore intelligent routing, observability, and agent loops — at zero cost to the host.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-10 w-full max-w-xs sm:max-w-none sm:w-auto"
        >
          <Link href="/chat" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg hover:shadow-xl transition-all">
              Start Chatting <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              View Dashboard
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 sm:gap-16 mt-16 px-6 sm:px-8 py-6 rounded-2xl bg-white/50 border border-[#F0E4E0] shadow-sm"
        >
          {[
            ["10+", "Open Models"],
            ["<500ms", "Avg. Latency"],
            ["99.9%", "Uptime"],
            ["∞", "Context Length"],
          ].map(([stat, label]) => (
            <div key={label} className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-[#222]">{stat}</div>
              <div className="text-xs text-[#888] mt-0.5">{label}</div>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* Features */}
      <motion.section
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 max-w-5xl mx-auto px-6 pb-24"
      >
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight text-[#222]">
            Everything you need for agentic AI
          </h2>
          <p className="mt-3 text-[#888] max-w-lg mx-auto">
            Built on Fireworks AI serverless inference — fast, open, and observable.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                variants={itemAnimation}
                className="group p-6 rounded-2xl bg-white border border-[#F0E4E0] hover:shadow-lg hover:border-[#FFD89B]/50 transition-all duration-300 cursor-default"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF7A6E]/10 to-[#FFD89B]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-5 h-5 text-[#FF7A6E]" />
                </div>
                <h3 className="font-semibold text-[#222] mb-1.5">{feat.title}</h3>
                <p className="text-sm text-[#888] leading-relaxed">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#F0E4E0] py-8 text-center text-sm text-[#888]">
        <p>Built with Fireworks AI · Ember Workspace</p>
      </footer>
    </div>
  );
}
