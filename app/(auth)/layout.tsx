"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex bg-background overflow-hidden">
      {/* Visual Side (Desktop) */}
      <div className="hidden lg:flex w-1/2 relative bg-zinc-900 text-white items-center justify-center p-12 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
           <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-zinc-900/0 to-transparent" />
           <div className="absolute bottom-0 right-0 w-full h-full opacity-20 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-500/20 via-zinc-900/0 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-md space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-medium tracking-tight text-white/90">Sistema RAG</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-5xl font-medium tracking-tight leading-[1.1] text-white"
          >
            Unlock the power of <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">intelligent data.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg text-zinc-400 font-light leading-relaxed"
          >
            Seamlessly query your documents, extract insights, and accelerate your workflow with our advanced RAG engine.
          </motion.p>

          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 1, delay: 0.4 }}
             className="pt-8 flex items-center gap-4"
          >
             <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border border-zinc-900 bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400">
                    U{i}
                  </div>
                ))}
             </div>
             <p className="text-sm text-zinc-500">Trusted by leading teams</p>
          </motion.div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-sm">
           {children}
        </div>
      </div>
    </div>
  );
}
