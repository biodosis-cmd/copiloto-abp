import React from 'react';
import { motion } from 'framer-motion';

export function TitleSlide({ data }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full text-center space-y-6 md:space-y-8 p-4 md:p-6 relative overflow-hidden">
            {/* Cinematic Background Light */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-indigo-500/10 rounded-full blur-[80px] md:blur-[120px] animate-pulse pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-10 w-full max-w-2xl"
            >
                <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/10 text-indigo-400 text-[8px] md:text-[9px] font-black tracking-[0.2em] md:tracking-[0.25em] mb-4 md:mb-5 uppercase border border-indigo-500/20 shadow-2xl">
                    Proyecto de Aprendizaje
                </span>
                <h1 className="text-[clamp(1.25rem,4vw,2.5rem)] md:text-[clamp(2rem,6vw,3.5rem)] font-black bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-500 leading-[1.1] tracking-tighter mb-4 drop-shadow-[0_10px_30px_rgba(255,255,255,0.1)] mx-auto px-2">
                    {data.nombre_proyecto || "Proyecto Sin Título"}
                </h1>
                <div className="h-0.5 md:h-1 w-16 md:w-24 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto rounded-full mt-4 md:mt-5 shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1.2 }}
                className="space-y-3 md:space-y-4 relative z-10 w-full"
            >
                <h2 className="text-[clamp(1rem,3vw,1.5rem)] md:text-2xl text-slate-200 font-semibold tracking-tight px-4">
                    {data.nombre_colegio || "Escuela"}
                </h2>
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-slate-500 font-medium uppercase tracking-[0.1em] md:tracking-[0.2em] text-[8px] md:text-[10px]">
                    <span>{data.curso || "Curso"}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-800 hidden xs:block" />
                    <span>{data.fecha_inicio || "Fecha"}</span>
                </div>
                {data.duracion && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900/50 rounded-lg border border-slate-800 mt-2">
                        <span className="text-indigo-400 font-medium text-[10px] md:text-xs uppercase tracking-widest text-center">
                            {data.duracion} semanas
                        </span>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
