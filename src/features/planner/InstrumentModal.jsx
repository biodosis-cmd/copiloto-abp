
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AlertCircle, Copy, FileText, Save, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from "@/utils/clipboard.js";
import { buildInstrumentPrompt, parseAIResponse } from '@/services/ai';
import { exportInstrumentToDocx } from '@/utils/export';

export function InstrumentModal({ isOpen, onClose, clase, claseIndex, projectData, onSave }) {
    if (!isOpen) return null;

    const [isGenerating, setIsGenerating] = useState(false); // 'prompt' | 'json' | 'preview'
    const [step, setStep] = useState('prompt');
    const [jsonInput, setJsonInput] = useState('');
    const [instrument, setInstrument] = useState(clase.instrumento_evaluacion || null);

    // Reset state when opening for a class without instrument
    React.useEffect(() => {
        if (clase.instrumento_evaluacion) {
            setInstrument(clase.instrumento_evaluacion);
            setStep('preview');
        } else {
            setInstrument(null);
            setStep('prompt');
        }
    }, [clase, isOpen]);

    const handleCopyPrompt = async () => {
        const prompt = buildInstrumentPrompt(clase, projectData);
        await copyToClipboard(prompt);
        toast.success("Prompt copiado al portapapeles");
        setStep('json');
    };

    const handleProcessJson = () => {
        try {
            const parsed = parseAIResponse(jsonInput);
            if (!parsed.instrumento || !parsed.items) throw new Error("JSON inválido (falta instrumento/items)");

            setInstrument(parsed);
            onSave(claseIndex, parsed); // Save to parent state immediately
            setStep('preview');
            toast.success("Instrumento guardado");
        } catch (e) {
            toast.error(e.message);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-2xl bg-white max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-600" />
                                Instrumento de Evaluación
                            </h2>
                            <p className="text-sm text-slate-500">
                                Clase {claseIndex + 1}: {clase.fase}
                            </p>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                            ✕
                        </button>
                    </div>

                    {step === 'prompt' && (
                        <div className="text-center py-8 space-y-4">
                            <div className="p-4 bg-indigo-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-indigo-600">
                                <Wand2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Generar Instrumento con IA</h3>
                            <p className="text-slate-600 max-w-md mx-auto">
                                Crea automáticamente una Lista de Cotejo, Quiz o Ticket de Salida personalizado para esta clase.
                            </p>
                            <Button onClick={handleCopyPrompt} className="bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                                <Copy className="w-4 h-4 mr-2" />
                                Copiar Prompt Mágico
                            </Button>
                        </div>
                    )}

                    {step === 'json' && (
                        <div className="space-y-4">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 text-amber-800 text-xs">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <p>Pega el JSON que generó tu IA aquí abajo.</p>
                            </div>
                            <textarea
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                className="w-full h-48 p-3 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                                placeholder='{ "instrumento": "...", "items": [...] }'
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setStep('prompt')}>Atrás</Button>
                                <Button onClick={handleProcessJson} className="bg-indigo-600 text-white">Procesar</Button>
                            </div>
                        </div>
                    )}

                    {step === 'preview' && instrument && (
                        <div className="space-y-6">
                            <div className="border rounded-lg p-6 bg-slate-50 relative">
                                <div className="absolute top-2 right-2 px-2 py-1 bg-white border rounded text-xs font-bold uppercase text-slate-500">
                                    {instrument.tipo || "Instrumento"}
                                </div>
                                <h3 className="text-xl font-bold text-center text-slate-900 mb-2">{instrument.titulo}</h3>
                                <p className="text-sm text-center text-slate-600 italic mb-6">{instrument.instrucciones}</p>

                                <div className="space-y-4">
                                    {instrument.items.map((item, idx) => (
                                        <div key={idx} className="bg-white p-3 rounded border border-slate-200">
                                            <p className="font-bold text-slate-800 mb-2">{idx + 1}. {item.pregunta}</p>
                                            <div className="pl-4 space-y-1">
                                                {(item.opciones || ["Sí", "No"]).map((opt, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                                        <div className="w-4 h-4 border rounded-full border-slate-300"></div>
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                <Button variant="outline" size="sm" onClick={() => {
                                    if (confirm("¿Borrar este instrumento?")) {
                                        onSave(claseIndex, null);
                                        setStep('prompt');
                                    }
                                }} className="text-red-500 hover:bg-red-50 border-red-200">
                                    Eliminar
                                </Button>
                                <Button onClick={() => exportInstrumentToDocx(projectData, instrument, claseIndex)} className="bg-blue-600 text-white hover:bg-blue-700">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Exportar a Word
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
