import React, { useState } from 'react';
import { Wand2, FileText } from 'lucide-react';
import { InstrumentModal } from './InstrumentModal';

const EditableCell = ({ content, path, onUpdate, children }) => {
    return (
        <td className="p-4 align-top group/cell relative hover:bg-gray-50 transition-colors border-t border-gray-100">
            <div
                contentEditable
                suppressContentEditableWarning
                className="outline-none focus:bg-indigo-50/30 p-2 rounded -ml-2 transition-colors min-h-[60px]"
                onBlur={(e) => onUpdate(path, e.currentTarget.textContent)}
            >
                {content}
            </div>
            {children}
        </td>
    )
}

const MobileEditableField = ({ label, content, path, onUpdate, children }) => (
    <div className="mb-4">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">{label}</span>
        <div className="relative group/mobile-cell">
            <div
                contentEditable
                suppressContentEditableWarning
                className="outline-none focus:bg-indigo-50/50 p-3 rounded-lg border border-gray-200 bg-white text-sm min-h-[60px] shadow-sm transition-all focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
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

    if (!cronograma || cronograma.length === 0) return <div className="p-8 text-center text-gray-500">No hay cronograma disponible.</div>;

    const handleSaveInstrument = (index, instrument) => {
        onUpdate(['cronograma', index, 'instrumento_evaluacion'], instrument);
    };

    return (
        <div className="p-4 md:p-6 bg-slate-50/50 rounded-xl">
            {/* Mobile Card View */}
            <div className="md:hidden space-y-6">
                {cronograma.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                            <h3 className="font-bold text-indigo-900 text-lg">{item.fase}</h3>
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-mono font-bold">Semana {item.semana}</span>
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
            <div className="hidden md:block overflow-x-auto rounded-lg shadow-sm border border-gray-200">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-4 font-bold uppercase text-xs text-gray-500 tracking-wider w-1/12 border-b border-gray-200">Fase</th>
                            <th className="p-4 font-bold uppercase text-xs text-gray-500 tracking-wider text-center w-16 border-b border-gray-200">Sem</th>
                            <th className="p-4 font-bold uppercase text-xs text-gray-500 tracking-wider w-1/3 border-b border-gray-200">Actividades</th>
                            <th className="p-4 font-bold uppercase text-xs text-gray-500 tracking-wider border-b border-gray-200">Evaluación</th>
                            <th className="p-4 font-bold uppercase text-xs text-gray-500 tracking-wider border-b border-gray-200">Recursos</th>
                            <th className="p-4 font-bold uppercase text-xs text-gray-500 tracking-wider border-b border-gray-200">Producto</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {cronograma.map((item, idx) => (
                            <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                                <td className="p-4 align-top font-medium text-indigo-900 border-t border-gray-100">{item.fase}</td>
                                <td className="p-4 align-top text-center text-gray-500 font-mono bg-gray-50/50 border-t border-gray-100">{item.semana}</td>

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
                                    {/* Only show generator if NOT the last session AND not explicitly "Cierre" */}
                                    {(idx !== cronograma.length - 1 && !item.fase.toLowerCase().includes('cierre') && !item.fase.toLowerCase().includes('presentación final')) && (
                                        <button
                                            onClick={() => setActiveModalIndex(idx)}
                                            className={`absolute top-2 right-2 p-1.5 rounded-full shadow-sm transition-all opacity-0 group-hover/cell:opacity-100 
                                                ${item.instrumento_evaluacion
                                                    ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                                                    : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                                                }`}
                                            title={item.instrumento_evaluacion ? "Ver Instrumento" : "Generar Instrumento"}
                                        >
                                            {item.instrumento_evaluacion ? <FileText className="w-3 h-3" /> : <Wand2 className="w-3 h-3" />}
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
