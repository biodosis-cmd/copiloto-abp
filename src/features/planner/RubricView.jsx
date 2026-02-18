
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
            <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 min-h-[400px]">
                <div className="p-4 bg-indigo-100 rounded-full mb-6 text-indigo-600">
                    <Calculator className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Aún no hay Rúbrica de Evaluación</h3>
                <p className="text-slate-500 max-w-lg mb-8">
                    Genera una rúbrica detallada automáticamente basándote en los objetivos y productos de este proyecto.
                </p>
                <Button onClick={handleCopyPrompt} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generar Rúbrica con IA
                </Button>
            </div>
        );
    }

    if (isGenerating && !rubric) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>
                        <strong> Instrucciones:</strong> Ya copiaste el prompt. Ahora ve a ChatGPT/Claude, pega el prompt, y cuando genere la respuesta, copia <strong>SOLO EL CÓDIGO JSON</strong> resultante y pégalo aquí abajo.
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Pegar JSON de la IA aquí:</label>
                    <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        className="w-full h-64 p-4 rounded-xl border border-slate-300 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder='{ "criterios": [ ... ] }'
                    />
                </div>

                <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={() => setIsGenerating(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleProcessJson} className="bg-indigo-600 text-white">
                        <Save className="w-4 h-4 mr-2" />
                        Procesar y Guardar
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex justify-between items-center mb-4 no-print">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-800">Rúbrica de Evaluación</h2>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                        {rubric?.criterios?.length || 0} Criterios
                    </span>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                        if (confirm("¿Estás seguro? Esto borrará la rúbrica actual.")) {
                            onUpdate({ ...data, rubrica: null });
                        }
                    }} className="text-red-500 hover:bg-red-50 border-red-200">
                        Eliminar
                    </Button>
                    <Button size="sm" onClick={() => exportRubricToDocx(data, rubric)} className="bg-blue-600 text-white hover:bg-blue-700">
                        Exportar Word (.docx)
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-4 w-[20%] min-w-[200px] font-bold text-slate-700 uppercase text-xs tracking-wider sticky left-0 bg-slate-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Criterio y Peso</th>
                                <th className="p-4 w-[20%] min-w-[200px] font-bold text-indigo-700 uppercase text-xs tracking-wider border-l border-slate-100 bg-indigo-50/30">Excelente (7.0)</th>
                                <th className="p-4 w-[20%] min-w-[200px] font-bold text-emerald-700 uppercase text-xs tracking-wider border-l border-slate-100 bg-emerald-50/30">Bueno (5.0 - 6.0)</th>
                                <th className="p-4 w-[20%] min-w-[200px] font-bold text-amber-700 uppercase text-xs tracking-wider border-l border-slate-100 bg-amber-50/30">Suficiente (4.0)</th>
                                <th className="p-4 w-[20%] min-w-[200px] font-bold text-rose-700 uppercase text-xs tracking-wider border-l border-slate-100 bg-rose-50/30">Insuficiente (1.0 - 3.9)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rubric?.criterios?.map((criterio, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 group transition-colors">
                                    <td className="p-4 align-top sticky left-0 bg-white group-hover:bg-slate-50/50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                        <div
                                            className="font-bold text-slate-900 mb-1 outline-none hover:bg-indigo-50 rounded px-1 -ml-1 cursor-text focus:ring-1 focus:ring-indigo-300"
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => handleUpdateCell(idx, 'nombre', e.currentTarget.textContent)}
                                        >
                                            {criterio.nombre}
                                        </div>
                                        <div
                                            className="text-slate-400 text-xs font-mono outline-none hover:bg-slate-100 rounded px-1 -ml-1 cursor-text w-fit"
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => handleUpdateCell(idx, 'peso', e.currentTarget.textContent)}
                                        >
                                            {criterio.peso || "0%"}
                                        </div>
                                    </td>

                                    {['excelente', 'bueno', 'suficiente', 'insuficiente'].map((level) => (
                                        <td key={level} className="p-4 align-top border-l border-slate-100 relative">
                                            <div
                                                className="text-slate-600 leading-relaxed outline-none focus:bg-white focus:shadow-md focus:ring-2 focus:ring-indigo-500 rounded p-2 transition-all min-h-[80px]"
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

            <p className="text-center text-xs text-slate-400 italic mt-4 no-print">
                * Puedes editar cualquier texto haciendo clic directamente sobre él.
            </p>
        </div>
    );
}
