import React from 'react';
import { motion } from 'framer-motion';
import { Flag, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TimelineSlide({ phase, index, total }) {
    // Helper to clean Markdown
    const cleanText = (text) => {
        if (!text) return "";
        return text.replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
            .replace(/\[.*?\]/g, "")          // Remove brackets
            .replace(/INCLUYE:?/gi, "")       // Remove specific keywords if any
            .trim();
    };

    // Helper to extract the main idea/objective
    const summarize = (text) => {
        if (!text) return "";
        const clean = cleanText(text);

        // Try to find the "Desarrollo" or the first main action
        const developmentMatch = clean.match(/Desarrollo.*?:(.*?)(?:\n|$)/i);
        if (developmentMatch && developmentMatch[1].trim().length > 10) {
            return developmentMatch[1].trim();
        }

        // Alternative: Try to find the second paragraph or first long line
        const lines = clean.split('\n').filter(l => l.trim().length > 20);
        if (lines.length > 0) return lines[0].trim();

        // Fallback: Truncate clean text
        return clean.length > 150 ? clean.substring(0, 150) + "..." : clean;
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
        <div className="min-h-full flex flex-col p-4 md:p-8 relative w-full max-w-5xl mx-auto">
            {/* Background Decoration */}
            <div className={`absolute top-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-gradient-to-br ${theme.bg} opacity-5 rounded-full blur-[80px] md:blur-[120px] -mr-32 -mt-32`}></div>
            <div className={`absolute bottom-0 left-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-gradient-to-tr ${theme.bg} opacity-5 rounded-full blur-[80px] md:blur-[120px] -ml-32 -mb-32`}></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 flex flex-col justify-center w-full py-6 md:py-10"
            >
                {/* Header Badge */}
                <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-6 md:mb-8">
                    <span className={cn(
                        "px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl bg-slate-900 border font-semibold text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] uppercase shadow-2xl transition-all duration-300",
                        theme.color.includes('blue') ? "text-blue-400 border-blue-500/30 shadow-blue-500/10" :
                            theme.color.includes('rose') ? "text-rose-400 border-rose-500/30 shadow-rose-500/10" :
                                "text-indigo-400 border-indigo-500/30 shadow-indigo-500/10"
                    )}>
                        Semana {phase.semana}
                    </span>
                    <span className="text-slate-500 font-semibold uppercase tracking-widest text-[8px] md:text-[9px]">
                        Clase {index + 1} <span className="text-slate-700">/</span> {total}
                    </span>
                </div>

                {/* Title */}
                <h2 className="text-[clamp(1.25rem,5vw,1.75rem)] md:text-[clamp(1.75rem,4vw,2.5rem)] font-black text-white mb-6 md:mb-8 leading-tight tracking-tight drop-shadow-sm px-1">
                    {cleanText(phase.fase)}
                </h2>

                {/* Content Card with Glassmorphism */}
                <div className="card-glass p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-slate-700/50 relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                    <div className={`absolute -left-1 top-6 md:top-8 w-1 h-16 md:w-1.5 md:h-20 bg-gradient-to-b ${theme.bg} rounded-full blur-[1px] shadow-[0_0_20px_rgba(99,102,241,0.5)]`}></div>

                    <div className="text-[clamp(0.875rem,3vw,1rem)] md:text-[clamp(1rem,3.5vw,1.125rem)] text-slate-200 leading-relaxed font-medium tracking-tight group-hover:text-white transition-colors duration-500 px-1">
                        {summarize(phase.actividades)}
                    </div>

                    {phase.producto_intermedio && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 md:mt-8 flex items-center gap-3 md:gap-4 bg-slate-950/50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-800 max-w-full backdrop-blur-md hover:border-indigo-500/30 transition-all duration-300"
                        >
                            <div className={`p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-br ${theme.bg} text-white shadow-lg flex-shrink-0`}>
                                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                            <div className="min-w-0 flex-1 overflow-hidden">
                                <p className="text-[8px] md:text-[9px] text-slate-500 font-semibold uppercase tracking-[0.15em] mb-0.5 truncate">Entregable Esperado</p>
                                <p className="text-sm md:text-base text-white font-semibold tracking-tight truncate overflow-hidden text-ellipsis whitespace-nowrap">{cleanText(phase.producto_intermedio)}</p>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
