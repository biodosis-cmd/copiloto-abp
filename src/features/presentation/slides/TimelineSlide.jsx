import React from 'react';
import { motion } from 'framer-motion';
import { Flag, CheckCircle2, ArrowRight } from 'lucide-react';

export function TimelineSlide({ phase, index, total }) {
    // Helper to clean Markdown
    const cleanText = (text) => {
        if (!text) return "";
        return text.replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
            .replace(/\[.*?\]/g, "")          // Remove brackets
            .replace(/INCLUYE:?/gi, "")       // Remove specific keywords if any
            .trim();
    };

    // Dynamic Style based on content or index
    const getTheme = () => {
        const p = (phase.fase || "").toLowerCase();
        if (p.includes("lanzamiento") || p.includes("inicio")) return { bg: "from-blue-500 to-cyan-400", icon: Flag, color: "text-blue-600" };
        if (p.includes("cierre") || p.includes("public")) return { bg: "from-rose-500 to-orange-400", icon: CheckCircle2, color: "text-rose-600" };
        return { bg: "from-indigo-500 to-purple-500", icon: ArrowRight, color: "text-indigo-600" };
    };

    const theme = getTheme();
    const Icon = theme.icon;

    return (
        <div className="h-full flex flex-col p-8 md:p-16 relative overflow-hidden">
            {/* Background Decoration */}
            <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br ${theme.bg} opacity-10 rounded-full blur-3xl -mr-32 -mt-32`}></div>
            <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr ${theme.bg} opacity-10 rounded-full blur-3xl -ml-32 -mb-32`}></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 h-full flex flex-col justify-center max-w-5xl mx-auto w-full"
            >
                {/* Header Badge */}
                <div className="flex items-center gap-4 mb-8">
                    <span className={`px-4 py-2 rounded-full bg-white shadow-sm border border-slate-100 ${theme.color} font-bold text-sm tracking-widest uppercase`}>
                        Semana {phase.semana}
                    </span>
                    <span className="text-slate-400 font-medium">
                        Clase {index + 1} de {total}
                    </span>
                </div>

                {/* Title */}
                <h2 className="text-4xl md:text-6xl font-black text-slate-800 mb-8 leading-tight">
                    {cleanText(phase.fase)}
                </h2>

                {/* Content Card */}
                <div className="bg-white/60 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-lg border border-white/50 relative">
                    <div className={`absolute -left-3 top-10 w-1.5 h-20 bg-gradient-to-b ${theme.bg} rounded-full`}></div>

                    <div className="prose prose-lg md:prose-xl max-w-none text-slate-600 leading-relaxed font-medium">
                        {cleanText(phase.actividades)}
                    </div>

                    {phase.producto_intermedio && (
                        <div className="mt-8 flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-indigo-50 w-fit">
                            <div className={`p-2 rounded-full bg-gradient-to-br ${theme.bg} text-white`}>
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Entregable</p>
                                <p className="text-slate-700 font-bold">{cleanText(phase.producto_intermedio)}</p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
