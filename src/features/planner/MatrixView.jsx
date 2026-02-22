import React from 'react';
import { cn } from '@/lib/utils';

const EditableSection = ({ title, content, path, color, onUpdate, isList = false, listKey }) => {
    // Mapping colors to dark variants
    const colorMap = {
        red: "from-red-500/20 to-red-600/5",
        orange: "from-orange-500/20 to-orange-600/5",
        yellow: "from-amber-500/20 to-amber-600/5",
        pink: "from-pink-500/20 to-pink-600/5",
        purple: "from-purple-500/20 to-purple-600/5",
        indigo: "from-indigo-500/20 to-indigo-600/5"
    };

    const gradient = colorMap[color] || "from-slate-800/50 to-slate-900/50";

    return (
        <div className={cn(
            "relative group p-6 rounded-2xl transition-all duration-300 card-glass border-slate-800/50 hover:border-indigo-500/30 overflow-hidden",
            `bg-gradient-to-br ${gradient}`
        )}>
            {/* Subtle light effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/10 transition-colors duration-500" />

            <div className="flex justify-between items-start mb-5 relative z-10">
                <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 group-hover:text-white transition-colors">
                    {title}
                </h3>
            </div>

            <div className="relative z-10">
                {isList ? (
                    <ul className="space-y-3">
                        {content?.map((item, idx) => {
                            const isObject = typeof item === 'object';
                            const text = isObject ? item[listKey] : item;
                            const itemPath = [...path, idx, isObject ? listKey : null].filter(p => p !== null);

                            return (
                                <li key={idx} className="flex gap-3 text-slate-100 font-medium">
                                    <span className="text-indigo-500 mt-1.5">•</span>
                                    <div className="flex-1">
                                        {isObject && <span className="text-indigo-400 font-bold text-xs uppercase tracking-wider block mb-1">{item.asignatura}</span>}
                                        <span
                                            contentEditable
                                            suppressContentEditableWarning
                                            className="outline-none focus:bg-slate-950/50 rounded px-1 transition-colors block leading-relaxed"
                                            onBlur={(e) => onUpdate(itemPath, e.currentTarget.textContent)}
                                        >
                                            {text}
                                        </span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p
                        contentEditable
                        suppressContentEditableWarning
                        className="outline-none focus:bg-slate-950/50 p-2 rounded text-slate-100 leading-relaxed font-medium"
                        onBlur={(e) => onUpdate(path, e.currentTarget.textContent)}
                    >
                        {content}
                    </p>
                )}
            </div>
        </div>
    );
};

export function MatrixView({ data, onUpdate }) {
    return (
        <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="col-span-1 md:col-span-2 card-glass p-8 rounded-3xl border-slate-700/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -mr-32 -mt-32" />

                    <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-500 mb-6 relative z-10">Información General</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm relative z-10">
                        {data.curso && (
                            <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1">Curso</span>
                                <span className="text-white font-bold text-lg">{data.curso}</span>
                            </div>
                        )}
                        {data.duracion && (
                            <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1">Duración</span>
                                <span className="text-white font-bold text-lg">{data.duracion} <span className="text-slate-500 text-sm font-medium lowercase">semanas</span></span>
                            </div>
                        )}
                        {data.asignaturas && (
                            <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1">Asignaturas</span>
                                <span className="text-indigo-400 font-bold text-base truncate block">
                                    {Array.isArray(data.asignaturas) ? data.asignaturas.join(', ') : data.asignaturas}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <EditableSection
                    title="Problema"
                    content={data.problema}
                    path={['problema']}
                    color="red"
                    onUpdate={onUpdate}
                />

                <EditableSection
                    title="OAI (Objetivos)"
                    content={data.oai}
                    path={['oai']}
                    color="orange"
                    onUpdate={onUpdate}
                    isList
                    listKey="oa"
                />

                <EditableSection
                    title="RAI (Resultados)"
                    content={data.rai}
                    path={['rai']}
                    color="yellow"
                    onUpdate={onUpdate}
                    isList
                />

                <EditableSection
                    title="Habilidades S. XXI"
                    content={data.hsxxi}
                    path={['hsxxi']}
                    color="pink"
                    onUpdate={onUpdate}
                    isList
                />

                <EditableSection
                    title="Producto Final"
                    content={data.producto_final}
                    path={['producto_final']}
                    color="purple"
                    onUpdate={onUpdate}
                />

                <EditableSection
                    title="Pregunta Guía"
                    content={data.pregunta_guia}
                    path={['pregunta_guia']}
                    color="indigo"
                    onUpdate={onUpdate}
                />
            </div>
        </div>
    );
}

