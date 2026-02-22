import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';

export function ChallengeSlide({ data }) {
    const cleanText = (text) => text ? text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\[.*?\]/g, "").trim() : "";

    return (
        <div className="flex items-center justify-center w-full min-h-[70vh] p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-2xl card-glass p-5 md:p-10 rounded-[1.25rem] md:rounded-[2rem] border-slate-700/50 relative overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.7)] group"
            >
                {/* Background conceptual effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px] -mr-64 -mt-64 group-hover:bg-rose-500/15 transition-colors duration-1000" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[80px] -ml-32 -mb-32" />

                <div className="relative z-10 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, rotate: -20 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        transition={{ delay: 0.4, duration: 1 }}
                        className="p-3 md:p-5 bg-rose-500/10 rounded-xl md:rounded-2xl border border-rose-500/20 shadow-2xl mb-6 md:mb-8"
                    >
                        <BrainCircuit className="w-8 h-8 md:w-12 md:h-12 text-rose-400" />
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, letterSpacing: "0.5em" }}
                        animate={{ opacity: 1, letterSpacing: "0.25em" }}
                        transition={{ delay: 0.6, duration: 1 }}
                        className="text-base md:text-xl font-black text-rose-400 uppercase tracking-[0.15em] md:tracking-[0.25em] mb-4 md:mb-8 leading-none"
                    >
                        El Desafío
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="text-[clamp(0.875rem,2.5vw,1rem)] md:text-[clamp(1rem,3vw,1.125rem)] text-slate-300 leading-relaxed font-medium max-w-xl mx-auto px-2"
                    >
                        {cleanText(data.problema) || "Definiendo el reto central del proyecto..."}
                    </motion.p>

                    {/* Conceptual line */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: 80 }}
                        transition={{ delay: 1.2, duration: 1.5 }}
                        className="h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent mt-8 md:mt-12"
                    />
                </div>
            </motion.div>
        </div>
    );
}
