
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-2xl card-glass bg-slate-900/90 max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.5)] border-slate-700/50 rounded-[2.5rem] animate-in zoom-in-95 duration-500 relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                <div className="p-8 relative z-10">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                    <FileText className="w-5 h-5 text-indigo-400" />
                                </div>
                                <h2 className="text-2xl font-black text-white tracking-tight">
                                    Instrumento de Evaluación
                                </h2>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
                                Clase {claseIndex + 1}: <span className="text-slate-400">{clase.fase}</span>
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-full transition-all">
                            <span className="text-xl leading-none">✕</span>
                        </button>
                    </div>

                    {step === 'prompt' && (
                        <div className="text-center py-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-6 bg-indigo-500/10 rounded-3xl w-24 h-24 flex items-center justify-center mx-auto text-indigo-400 border border-indigo-500/20 shadow-2xl relative">
                                <div className="absolute inset-0 bg-indigo-500/20 rounded-3xl blur-xl animate-pulse" />
                                <Wand2 className="w-10 h-10 relative z-10" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-xl font-black text-white tracking-tight">Generar Instrumento con IA</h3>
                                <p className="text-slate-400 max-w-md mx-auto leading-relaxed font-medium">
                                    Crea automáticamente una Lista de Cotejo, Quiz o Ticket de Salida personalizado para esta clase.
                                </p>
                            </div>
                            <Button onClick={handleCopyPrompt} className="rounded-2xl px-12 py-8 font-black uppercase tracking-[0.15em] text-xs shadow-2xl shadow-indigo-500/20">
                                <Copy className="w-4 h-4 mr-3" />
                                Copiar Prompt Mágico
                            </Button>
                        </div>
                    )}

                    {step === 'json' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex gap-4 text-amber-200 text-xs shadow-xl">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-500" />
                                <p className="leading-relaxed">
                                    <strong className="text-amber-400 font-black uppercase tracking-widest text-[9px] block mb-1">Instrucciones:</strong>
                                    Pega el JSON que generó tu IA aquí abajo para materializar el instrumento.
                                </p>
                            </div>
                            <textarea
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                className="w-full h-64 p-5 rounded-3xl border border-slate-800 bg-slate-950/50 text-indigo-300 font-mono text-xs focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all shadow-2xl outline-none"
                                placeholder='{ "instrumento": "...", "items": [...] }'
                            />
                            <div className="flex justify-end gap-4">
                                <Button variant="ghost" onClick={() => setStep('prompt')} className="rounded-xl px-6 font-bold uppercase tracking-widest text-[10px] text-slate-500 hover:text-white">
                                    Atrás
                                </Button>
                                <Button onClick={handleProcessJson} className="rounded-2xl px-10 font-black uppercase tracking-widest text-xs py-7 shadow-xl shadow-indigo-500/20">
                                    Procesar y Ver
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 'preview' && instrument && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="border border-slate-800 rounded-[2rem] p-8 bg-slate-950/40 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                                <div className="absolute top-6 right-6 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 shadow-inner">
                                    {instrument.tipo || "Instrumento"}
                                </div>

                                <h3 className="text-2xl font-black text-center text-white mb-4 tracking-tight px-10">{instrument.titulo}</h3>
                                <p className="text-sm text-center text-slate-400 italic mb-10 leading-relaxed font-medium">{instrument.instrucciones}</p>

                                <div className="space-y-5">
                                    {instrument.items.map((item, idx) => (
                                        <div key={idx} className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 hover:border-indigo-500/30 transition-all duration-300 group/item">
                                            <p className="font-black text-white mb-4 flex gap-3 leading-tight">
                                                <span className="text-indigo-500 italic">0{idx + 1}</span>
                                                {item.pregunta}
                                            </p>
                                            <div className="pl-10 space-y-3">
                                                {(item.opciones || ["Sí", "No"]).map((opt, i) => (
                                                    <div key={i} className="flex items-center gap-4 text-sm text-slate-400 group-hover/item:text-slate-300 transition-colors">
                                                        <div className="w-5 h-5 border-2 rounded-full border-slate-800 bg-slate-950 flex-shrink-0 relative">
                                                            <div className="absolute inset-1 rounded-full bg-indigo-500/20 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                                        </div>
                                                        <span className="font-medium text-sm">{opt}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-8 border-t border-slate-800/50">
                                <Button variant="ghost" size="sm" onClick={() => {
                                    if (confirm("¿Borrar este instrumento?")) {
                                        onSave(claseIndex, null);
                                        setStep('prompt');
                                    }
                                }} className="text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 font-bold uppercase tracking-[0.2em] text-[10px] rounded-xl px-5">
                                    Eliminar
                                </Button>
                                <Button onClick={() => exportInstrumentToDocx(projectData, instrument, claseIndex)} className="bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 rounded-2xl px-8 font-black uppercase tracking-widest text-xs py-7 shadow-2xl">
                                    <FileText className="w-4 h-4 mr-3" />
                                    Exportar a Word
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
}
