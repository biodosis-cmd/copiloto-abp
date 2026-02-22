
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Copy, Wand2, Calculator, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from "@/utils/clipboard.js";
import { buildRubricPrompt, parseAIResponse } from '@/services/ai';
import { exportRubricToDocx } from '@/utils/export';

export function RubricView({ data, onUpdate }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [jsonInput, setJsonInput] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const rubric = data.rubrica || null;

    const handleCopyPrompt = async () => {
        const prompt = buildRubricPrompt(data);
        await copyToClipboard(prompt);
        toast.success("Prompt copiado al portapapeles. ¡Pégalo en tu IA!");
        setIsGenerating(true);
    };

    const handleProcessJson = () => {
        if (!jsonInput.trim()) {
            toast.error("Por favor pega el JSON primero");
            return;
        }

        try {
            const parsed = parseAIResponse(jsonInput);

            // Basic validation
            // If it's a project json, looks for criteria inside, or assume it's just criteria
            let criteriaList = parsed.criterios;

            // Fallback if user pasted full project but we only want rubric?
            // The AI parser now returns whatever it found.
            // If parsed has 'criterios', use it.

            if (!criteriaList || !Array.isArray(criteriaList)) {
                throw new Error("El JSON no tiene una lista de 'criterios' válida.");
            }

            const newRubric = { criterios: criteriaList };
            const newData = { ...data, rubrica: newRubric };
            onUpdate(newData);
            setIsGenerating(false);
            setJsonInput('');
            toast.success("¡Rúbrica generada con éxito!");
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleUpdateCell = (criterioIndex, field, value, nivelKey = null) => {
        const newRubric = { ...rubric };
        const newCriterios = [...newRubric.criterios];

        if (nivelKey) {
            // Update descriptor inside levels
            newCriterios[criterioIndex].niveles[nivelKey] = value;
        } else {
            // Update top level field (nombre, peso)
            newCriterios[criterioIndex][field] = value;
        }

        newRubric.criterios = newCriterios;
        onUpdate({ ...data, rubrica: newRubric });
    };

    if (!rubric && !isGenerating) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center card-glass rounded-3xl border-dashed border-slate-700/50 min-h-[500px] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
                <div className="p-6 bg-indigo-500/10 rounded-2xl mb-8 text-indigo-400 border border-indigo-500/20 shadow-2xl relative z-10 group-hover:scale-110 transition-transform duration-500">
                    <Calculator className="w-16 h-16" />
                </div>
                <h3 className="text-3xl font-black text-white mb-4 relative z-10 tracking-tight">Instrumentos de Evaluación</h3>
                <p className="text-slate-400 max-w-lg mb-10 relative z-10 leading-relaxed font-medium">
                    Genera una rúbrica detallada automáticamente basándote en los objetivos y productos de este proyecto.
                </p>
                <Button onClick={handleCopyPrompt} size="lg" className="relative z-10 rounded-2xl px-10 py-8 font-black uppercase tracking-[0.15em] text-xs shadow-2xl shadow-indigo-500/20">
                    <Wand2 className="w-5 h-5 mr-3 animate-pulse" />
                    Generar Rúbrica con IA
                </Button>
            </div>
        );
    }

    if (isGenerating && !rubric) {
        return (
            <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 flex gap-4 text-amber-200 text-sm shadow-xl">
                    <AlertCircle className="w-6 h-6 flex-shrink-0 text-amber-500" />
                    <div className="leading-relaxed">
                        <strong className="block mb-1 text-amber-400 font-black uppercase tracking-widest text-[10px]">Instrucciones:</strong>
                        Ya copiaste el prompt. Ahora ve a ChatGPT/Claude, pega el prompt, y cuando genere la respuesta, copia <span className="text-white font-bold underline decoration-amber-500/50">SOLO EL CÓDIGO JSON</span> resultante y pégalo aquí abajo.
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Entrada de Datos JSON</label>
                    <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        className="w-full h-80 p-6 rounded-3xl border border-slate-800 bg-slate-950/50 text-indigo-300 font-mono text-xs focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all shadow-2xl outline-none"
                        placeholder='{ "criterios": [ ... ] }'
                    />
                </div>

                <div className="flex gap-4 justify-end">
                    <Button variant="ghost" onClick={() => setIsGenerating(false)} className="rounded-xl px-6 font-bold uppercase tracking-widest text-[10px] text-slate-500 hover:text-white">
                        Cancelar
                    </Button>
                    <Button onClick={handleProcessJson} className="rounded-2xl px-8 font-black uppercase tracking-widest text-xs py-6 shadow-xl shadow-indigo-500/20">
                        <Save className="w-4 h-4 mr-2" />
                        Materializar Rúbrica
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center mb-4 no-print px-2">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">Rúbrica de Evaluación</h2>
                    <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-inner">
                        {rubric?.criterios?.length || 0} Criterios
                    </span>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost" size="sm" onClick={() => {
                        if (confirm("¿Estás seguro? Esto borrará la rúbrica actual.")) {
                            onUpdate({ ...data, rubrica: null });
                        }
                    }} className="text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 border-transparent font-bold uppercase tracking-widest text-[10px] rounded-xl px-4">
                        Eliminar
                    </Button>
                    <Button size="sm" onClick={() => exportRubricToDocx(data, rubric)} className="bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 rounded-xl px-6 font-bold uppercase tracking-widest text-[10px] shadow-xl">
                        Exportar Word (.docx)
                    </Button>
                </div>
            </div>

            <div className="card-glass rounded-[2rem] border-slate-700/30 overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] -mr-80 -mt-80 pointer-events-none" />

                <div className="overflow-x-auto relative z-10">
                    <table className="w-full text-sm text-left border-collapse min-w-[1100px]">
                        <thead>
                            <tr className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
                                <th className="p-6 w-[20%] min-w-[240px] font-black text-slate-500 uppercase text-[10px] tracking-[0.2em] sticky left-0 bg-slate-950/90 z-20 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.5)]">Criterio y Peso</th>
                                <th className="p-6 w-[20%] min-w-[240px] font-black text-indigo-400 uppercase text-[10px] tracking-[0.2em] border-l border-slate-800/50 bg-indigo-500/5">Excelente (7.0)</th>
                                <th className="p-6 w-[20%] min-w-[240px] font-black text-emerald-400 uppercase text-[10px] tracking-[0.2em] border-l border-slate-800/50 bg-emerald-500/5">Bueno (5.0 - 6.0)</th>
                                <th className="p-6 w-[20%] min-w-[240px] font-black text-amber-400 uppercase text-[10px] tracking-[0.2em] border-l border-slate-800/50 bg-amber-500/5">Suficiente (4.0)</th>
                                <th className="p-6 w-[20%] min-w-[240px] font-black text-rose-400 uppercase text-[10px] tracking-[0.2em] border-l border-slate-800/50 bg-rose-500/5">Insuficiente (1.0 - 3.9)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/30">
                            {rubric?.criterios?.map((criterio, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.02] group transition-all duration-300">
                                    <td className="p-6 align-top sticky left-0 bg-slate-900/95 group-hover:bg-slate-900 z-20 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.5)] transition-colors">
                                        <div
                                            className="font-black text-white mb-2 outline-none hover:bg-indigo-500/10 rounded-xl p-2 -ml-2 cursor-text transition-all focus:ring-2 focus:ring-indigo-500/30 leading-tight"
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => handleUpdateCell(idx, 'nombre', e.currentTarget.textContent)}
                                        >
                                            {criterio.nombre}
                                        </div>
                                        <div
                                            className="text-indigo-400/60 text-[10px] font-black uppercase tracking-widest outline-none hover:bg-slate-800 rounded-lg px-2 py-1 -ml-1 cursor-text w-fit transition-all"
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => handleUpdateCell(idx, 'peso', e.currentTarget.textContent)}
                                        >
                                            {criterio.peso || "0%"}
                                        </div>
                                    </td>

                                    {['excelente', 'bueno', 'suficiente', 'insuficiente'].map((level) => (
                                        <td key={level} className="p-6 align-top border-l border-slate-800/50 relative">
                                            <div
                                                className="text-slate-300 leading-relaxed outline-none focus:bg-slate-950 focus:shadow-2xl focus:ring-2 focus:ring-indigo-500/50 rounded-2xl p-4 transition-all min-h-[100px] font-medium selection:bg-indigo-500/30"
                                                contentEditable
                                                suppressContentEditableWarning
                                                onBlur={(e) => handleUpdateCell(idx, null, e.currentTarget.textContent, level)}
                                            >
                                                {criterio.niveles?.[level] || "-"}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mt-8 no-print animate-pulse">
                * Haz clic en cualquier texto para editarlo directamente
            </p>
        </div>
    );
}

