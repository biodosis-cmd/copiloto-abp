import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, FileDown, Download, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { exportToDocx, exportToDocxLandscape, exportToPdfLandscape, exportToPdfVertical } from '@/utils/export';
import { cn } from '@/lib/utils';

export function ExportMenu({ data }) {
    const handleExport = (action, label) => {
        if (!data.nombre_colegio) {
            toast.error('Indica el nombre del institución para exportar.');
            return;
        }

        toast.promise(
            async () => {
                await action(data);
            },
            {
                loading: `Generando ${label}...`,
                success: `${label} generado`,
                error: `Error: ${label}`
            }
        );
    };

    const exportOptions = [
        { label: 'Word Vertical', icon: FileText, action: exportToDocx, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        { label: 'Word Horizontal', icon: Layers, action: exportToDocxLandscape, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
        { label: 'PDF Vertical', icon: FileDown, action: exportToPdfVertical, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
        { label: 'PDF Horizontal', icon: Download, action: exportToPdfLandscape, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    ];

    return (
        <div className="flex items-center gap-2 px-2">
            {exportOptions.map((opt, idx) => (
                <ExportButton key={idx} opt={opt} onExport={() => handleExport(opt.action, opt.label)} />
            ))}
        </div>
    );
}

function ExportButton({ opt, onExport }) {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className="relative flex flex-col items-center">
            <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={onExport}
                className={cn(
                    "flex items-center justify-center h-10 w-10 md:h-9 md:w-9 rounded-xl border transition-all duration-300 shadow-lg flex-shrink-0",
                    "card-glass bg-slate-900/40 hover:bg-slate-900/80 hover:border-white/20",
                    opt.border,
                    "group"
                )}
            >
                <div className={cn(
                    "p-1.5 rounded-lg transition-colors duration-300",
                    opt.bg,
                    opt.color
                )}>
                    <opt.icon className="w-4 h-4" />
                </div>
            </button>

            <AnimatePresence>
                {showTooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute bottom-full mb-3 px-3 py-1.5 bg-slate-900/95 border border-slate-700/50 backdrop-blur-md rounded-lg shadow-2xl z-[100] whitespace-nowrap pointer-events-none"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                            {opt.label}
                        </span>
                        {/* Tooltip Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
