import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Wand2, FileText } from 'lucide-react';
import { InstrumentModal } from './InstrumentModal';

const EditableCell = ({ content, path, onUpdate, children }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const contentRef = React.useRef(null);
    const [showButton, setShowButton] = useState(false);

    React.useEffect(() => {
        if (contentRef.current) {
            setShowButton(contentRef.current.scrollHeight > 140);
        }
    }, [content]);

    return (
        <td className="p-5 align-top group/cell relative hover:bg-slate-900/40 transition-all duration-300 border-t border-slate-800/50">
            <div
                ref={contentRef}
                contentEditable
                suppressContentEditableWarning
                className={cn(
                    "outline-none focus:bg-indigo-500/10 p-3 rounded-xl -ml-2 transition-all duration-500 text-slate-200 leading-relaxed font-medium selection:bg-indigo-500/30 relative",
                    (!isExpanded && !isFocused) ? "max-h-[140px] overflow-hidden" : ""
                )}
                onBlur={(e) => {
                    setIsFocused(false);
                    onUpdate(path, e.currentTarget.textContent);
                }}
                onFocus={() => setIsFocused(true)}
            >
                {content}

                {/* Gradient overlap to indicate more content when collapsed */}
                {showButton && !isExpanded && !isFocused && (
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-900/90 to-transparent pointer-events-none group-hover/cell:from-slate-800/90 transition-all duration-300" />
                )}
            </div>

            {showButton && !isFocused && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2 group/btn"
                >
                    <div className="w-4 h-px bg-indigo-500/30 group-hover/btn:w-8 transition-all duration-300" />
                    {isExpanded ? "Ver Menos" : "Ver Más"}
                </button>
            )}

            {children}
        </td>
    )
}

const MobileEditableField = ({ label, content, path, onUpdate, children }) => (
    <div className="mb-6">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2 px-1">{label}</span>
        <div className="relative group/mobile-cell">
            <div
                contentEditable
                suppressContentEditableWarning
                className="outline-none focus:bg-indigo-500/10 p-4 rounded-2xl border border-slate-800 bg-slate-950/50 text-slate-100 text-sm min-h-[80px] shadow-2xl transition-all focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 leading-relaxed selection:bg-indigo-500/30"
                onBlur={(e) => onUpdate(path, e.currentTarget.textContent)}
            >
                {content}
            </div>
            {children}
        </div>
    </div>
);

export function ScheduleView({ cronograma, onUpdate, projectData }) {
    const [activeModalIndex, setActiveModalIndex] = useState(null);

    if (!cronograma || cronograma.length === 0) return (
        <div className="p-20 text-center text-slate-500 card-glass rounded-3xl border-dashed">
            No hay cronograma disponible.
        </div>
    );

    const handleSaveInstrument = (index, instrument) => {
        onUpdate(['cronograma', index, 'instrumento_evaluacion'], instrument);
    };

    return (
        <div className="p-0">
            {/* Mobile Card View */}
            <div className="md:hidden space-y-6 p-4">
                {cronograma.map((item, idx) => (
                    <div key={idx} className="card-glass p-6 rounded-3xl border-slate-700/50 relative overflow-hidden group shadow-2xl">
                        <div className="flex justify-between items-start mb-6 border-b border-slate-800/50 pb-4">
                            <h3 className="font-black text-white text-lg tracking-tight">{item.fase}</h3>
                            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                Semana {item.semana}
                            </span>
                        </div>

                        <MobileEditableField
                            label="Actividades"
                            content={item.actividades}
                            path={['cronograma', idx, 'actividades']}
                            onUpdate={onUpdate}
                        />

                        <MobileEditableField
                            label="Evaluación"
                            content={item.evaluacion}
                            path={['cronograma', idx, 'evaluacion']}
                            onUpdate={onUpdate}
                        >
                            {(idx !== cronograma.length - 1 && !item.fase.toLowerCase().includes('cierre') && !item.fase.toLowerCase().includes('presentación final')) && (
                                <button
                                    onClick={() => setActiveModalIndex(idx)}
                                    className={`absolute top-2 right-2 p-2 rounded-full shadow-sm transition-all 
                                        ${item.instrumento_evaluacion
                                            ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                                            : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                                        }`}
                                    title={item.instrumento_evaluacion ? "Ver Instrumento" : "Generar Instrumento"}
                                >
                                    {item.instrumento_evaluacion ? <FileText className="w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
                                </button>
                            )}
                        </MobileEditableField>

                        <div className="grid grid-cols-1 gap-4">
                            <MobileEditableField
                                label="Recursos"
                                content={item.recursos}
                                path={['cronograma', idx, 'recursos']}
                                onUpdate={onUpdate}
                            />
                            <MobileEditableField
                                label="Producto"
                                content={item.producto_intermedio}
                                path={['cronograma', idx, 'producto_intermedio']}
                                onUpdate={onUpdate}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden rounded-3xl card-glass border-slate-700/30 shadow-2xl relative">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />

                <table className="w-full text-left border-collapse relative z-10">
                    <thead>
                        <tr className="bg-slate-950/80 backdrop-blur-xl">
                            <th className="p-6 font-black uppercase text-[10px] text-slate-500 tracking-[0.2em] w-1/12 border-b border-slate-800">Fase</th>
                            <th className="p-6 font-black uppercase text-[10px] text-slate-500 tracking-[0.2em] text-center w-16 border-b border-slate-800">Sem</th>
                            <th className="p-6 font-black uppercase text-[10px] text-slate-500 tracking-[0.2em] w-1/3 border-b border-slate-800">Actividades</th>
                            <th className="p-6 font-black uppercase text-[10px] text-slate-500 tracking-[0.2em] border-b border-slate-800">Evaluación</th>
                            <th className="p-6 font-black uppercase text-[10px] text-slate-500 tracking-[0.2em] border-b border-slate-800">Recursos</th>
                            <th className="p-6 font-black uppercase text-[10px] text-slate-500 tracking-[0.2em] border-b border-slate-800">Producto</th>
                        </tr>
                    </thead>
                    <tbody className="bg-transparent divide-y divide-slate-800/30">
                        {cronograma.map((item, idx) => (
                            <tr key={idx} className="group hover:bg-white/[0.02] transition-colors duration-300">
                                <td className="p-6 align-top font-black text-white text-sm border-t border-slate-800/50">{item.fase}</td>
                                <td className="p-6 align-top text-center text-indigo-400 font-black text-sm border-t border-slate-800/50">
                                    <span className="bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20 shadow-inner">
                                        {item.semana}
                                    </span>
                                </td>

                                <EditableCell
                                    content={item.actividades}
                                    path={['cronograma', idx, 'actividades']}
                                    onUpdate={onUpdate}
                                />
                                <EditableCell
                                    content={item.evaluacion}
                                    path={['cronograma', idx, 'evaluacion']}
                                    onUpdate={onUpdate}
                                >
                                    {(idx !== cronograma.length - 1 && !item.fase.toLowerCase().includes('cierre') && !item.fase.toLowerCase().includes('presentación final')) && (
                                        <button
                                            onClick={() => setActiveModalIndex(idx)}
                                            className={`absolute top-4 right-4 p-2.5 rounded-xl shadow-2xl transition-all duration-300 opacity-0 group-hover/cell:opacity-100 border backdrop-blur-md
                                                ${item.instrumento_evaluacion
                                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/40 shadow-emerald-500/20'
                                                    : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/40 shadow-indigo-500/20'
                                                }`}
                                            title={item.instrumento_evaluacion ? "Ver Instrumento" : "Generar Instrumento"}
                                        >
                                            {item.instrumento_evaluacion ? <FileText className="w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
                                        </button>
                                    )}
                                </EditableCell>
                                <EditableCell
                                    content={item.recursos}
                                    path={['cronograma', idx, 'recursos']}
                                    onUpdate={onUpdate}
                                />
                                <EditableCell
                                    content={item.producto_intermedio}
                                    path={['cronograma', idx, 'producto_intermedio']}
                                    onUpdate={onUpdate}
                                />
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {activeModalIndex !== null && (
                <InstrumentModal
                    isOpen={true}
                    onClose={() => setActiveModalIndex(null)}
                    clase={cronograma[activeModalIndex]}
                    claseIndex={activeModalIndex}
                    projectData={projectData} // Needs validation if passed prop
                    onSave={handleSaveInstrument}
                />
            )}
        </div>
    );
}
