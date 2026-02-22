import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Quote } from 'lucide-react';

export function QuestionSlide({ data }) {
    const cleanText = (text) => text ? text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\[.*?\]/g, "").trim() : "";

    return (
        <div className="flex items-center justify-center w-full min-h-[70vh] p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-2xl bg-[#312e81] p-6 md:p-12 rounded-[1.5rem] md:rounded-[2.5rem] shadow-[0_40px_100px_rgba(49,46,129,0.5)] flex flex-col justify-center relative overflow-hidden group border-t border-white/20"
            >
                {/* Ethereal background effects */}
                <div className="absolute top-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-indigo-400/20 rounded-full blur-[100px] md:blur-[150px] -mr-80 -mt-80 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/40 rounded-full blur-[100px] -ml-40 -mb-40" />

                <div className="relative z-10 text-center">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="flex justify-center mb-6 md:mb-10"
                    >
                        <div className="p-3 md:p-4 bg-white/10 rounded-xl md:rounded-2xl backdrop-blur-xl border border-white/20 shadow-2xl">
                            <Lightbulb className="w-8 h-8 md:w-10 md:h-10 text-yellow-300 drop-shadow-[0_0_15px_rgba(251,243,63,0.5)]" />
                        </div>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7, duration: 1 }}
                        className="text-base md:text-lg font-black text-white/70 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-6 md:mb-10 leading-none"
                    >
                        Pregunta Guía
                    </motion.h2>

                    <div className="relative inline-block max-w-xl px-4">
                        <Quote className="absolute -top-4 -left-1 md:-top-6 md:-left-6 w-8 h-8 md:w-12 md:h-12 text-white/5 rotate-180" />
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9, duration: 1.2 }}
                            className="text-[clamp(1rem,3vw,1.25rem)] md:text-[clamp(1.25rem,4vw,1.75rem)] text-white font-medium leading-[1.2] tracking-tight px-2"
                        >
                            {cleanText(data.pregunta_guia) || "¿Cómo transformaremos el futuro?"}
                        </motion.p>
                        <Quote className="absolute -bottom-4 -right-1 md:-bottom-6 md:-right-6 w-8 h-8 md:w-12 md:h-12 text-white/5" />
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                        className="mt-12 md:mt-16 flex justify-center gap-2"
                    >
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white/20" />
                        ))}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
