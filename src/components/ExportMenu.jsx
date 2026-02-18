import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, File, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { exportToDocx, exportToDocxLandscape, exportToPdfLandscape, exportToPdfVertical } from '@/utils/export';

export function ExportMenu({ data }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleExport = (action, label) => {
        if (!data.nombre_colegio) {
            toast.error('Debes indicar el nombre del colegio antes de descargar.');
            return;
        }

        try {
            action(data);
            setIsOpen(false);
            toast.success(`Exportando ${label}...`);
        } catch (error) {
            console.error(error);
            toast.error(`Error al exportar ${label}`);
        }
    };

    const options = [
        {
            type: 'Word (.docx)',
            icon: FileText,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            items: [
                { label: 'Formato Vertical', action: exportToDocx },
                { label: 'Formato Horizontal', action: exportToDocxLandscape }
            ]
        },
        {
            type: 'PDF (.pdf)',
            icon: Download,
            color: 'text-red-600',
            bg: 'bg-red-50',
            items: [
                { label: 'Formato Vertical', action: exportToPdfVertical },
                { label: 'Formato Horizontal', action: exportToPdfLandscape }
            ]
        }
    ];

    return (
        <div className="relative z-50" ref={menuRef}>
            <motion.button
                whileHover={{ scale: 1.1, rotate: isOpen ? 90 : 0 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    relative group flex items-center justify-center w-10 h-10 rounded-full shadow-sm transition-all duration-300
                    ${isOpen
                        ? 'bg-indigo-600 text-white shadow-indigo-200'
                        : 'bg-white text-slate-500 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300'}
                `}
            >
                <Download className="h-5 w-5" />

                {/* Tooltip only when closed */}
                {!isOpen && (
                    <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-2 py-1 bg-slate-800 text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        Exportar
                        <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-800" />
                    </div>
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9, x: 0 }}
                        animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 md:right-0 left-0 md:left-auto top-full mt-3 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 overflow-hidden origin-top-left md:origin-top-right"
                    >
                        <div className="flex flex-col gap-1">
                            {options.map((group, idx) => (
                                <div key={idx} className="p-2 first:mb-1">
                                    <div className="flex items-center gap-2 px-2 pb-2 mb-1 border-b border-slate-50 last:border-0 opacity-80">
                                        <group.icon className={`h-3.5 w-3.5 ${group.color}`} />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{group.type}</span>
                                    </div>
                                    <div className="space-y-1">
                                        {group.items.map((item, itemIdx) => (
                                            <button
                                                key={itemIdx}
                                                onClick={() => handleExport(item.action, item.label)}
                                                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-600 hover:text-indigo-700 hover:bg-slate-50 rounded-lg transition-colors text-left group/item"
                                            >
                                                <span>{item.label}</span>
                                                <ChevronRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-indigo-400" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
