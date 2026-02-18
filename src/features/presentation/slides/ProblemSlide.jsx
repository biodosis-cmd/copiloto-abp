import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Lightbulb } from 'lucide-react';

export function ProblemSlide({ data }) {
    const cleanText = (text) => text ? text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\[.*?\]/g, "").trim() : "";

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-full p-6 md:p-12 items-center">
            {/* Left: The Problem */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col justify-center relative overflow-hidden min-h-[300px]"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-100 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 bg-rose-100 rounded-2xl">
                            <BrainCircuit className="w-10 h-10 text-rose-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800">El Desafío</h2>
                    </div>
                    <p className="text-2xl text-slate-600 leading-relaxed font-medium">
                        {cleanText(data.problema) || "Definir el problema..."}
                    </p>
                </div>
            </motion.div>

            {/* Right: The Big Question */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-indigo-600 text-white p-8 rounded-3xl shadow-2xl shadow-indigo-200 flex flex-col justify-center relative overflow-hidden min-h-[300px]"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
                            <Lightbulb className="w-10 h-10 text-yellow-300" />
                        </div>
                        <h2 className="text-3xl font-bold text-white">Pregunta Guía</h2>
                    </div>
                    <p className="text-3xl md:text-4xl text-white font-bold leading-tight">
                        "{cleanText(data.pregunta_guia) || "¿...?"}"
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
