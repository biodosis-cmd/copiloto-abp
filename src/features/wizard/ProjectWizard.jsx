import React, { useState } from 'react';
import { copyToClipboard } from '@/utils/clipboard.js';
import { db } from '../../db';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ArrowRight, Wand2, Lightbulb, GraduationCap, BookOpen, CheckCircle2, Copy, Play, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { SUBJECTS, GRADES } from '@/constants';
import { buildMegaPrompt, parseAIResponse } from '@/services/ai';
import { toast } from 'sonner';

const STEPS = [
    { id: 'idea', title: 'La Chispa', icon: Lightbulb, description: 'Describe la idea central o problema.' },
    { id: 'context', title: 'El Contexto', icon: GraduationCap, description: 'Define el nivel y duración.' },
    { id: 'subjects', title: 'Herramientas', icon: BookOpen, description: 'Selecciona las asignaturas.' },
    { id: 'generate', title: 'Generar', icon: Wand2, description: 'Usa tu IA favorita para crear el plan.' }
];

export function ProjectWizard({ onSubmit, isLoading, initialData }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        idea: '',
        curso: '7° Básico',
        duracion: 6,
        school: '',
        launchDate: '',
        subjects: []
    });
    const [aiInput, setAiInput] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [customSubject, setCustomSubject] = useState('');

    // Load initial data if provided (for editing)
    React.useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                idea: initialData.idea || '',
                curso: initialData.curso || '7° Básico',
                duracion: initialData.duracion || 6,
                school: initialData.nombre_colegio || prev.school,
                launchDate: initialData.fecha_inicio || '',
                subjects: initialData.asignaturas || []
            }));
        }
    }, [initialData]);

    // Fetch default school on mount if not editing
    React.useEffect(() => {
        if (!initialData) {
            const loadDefaultSchool = async () => {
                try {
                    const setting = await db.settings.get('defaultSchool');
                    if (setting?.value) {
                        setFormData(prev => ({ ...prev, school: setting.value }));
                    }
                } catch (e) {
                    console.error("Error loading default school", e);
                }
            };
            loadDefaultSchool();
        }
    }, [initialData]);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) setCurrentStep(curr => curr + 1);
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(curr => curr - 1);
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 0: return formData.idea.length > 10;
            case 1: return formData.curso && formData.duracion > 0 && formData.school.length > 2;
            case 2: return formData.subjects.length > 0;
            default: return true;
        }
    };

    const handleCopyPrompt = async () => {
        const prompt = buildMegaPrompt(formData.idea, formData.curso, formData.duracion, formData.subjects);
        await copyToClipboard(prompt);
        toast.success('Prompt copiado al portapapeles. ¡Ahora pégalo en ChatGPT/Gemini!');
    };

    const handleProcessAI = () => {
        if (!aiInput.trim()) {
            toast.error('Por favor pega la respuesta de la IA primero.');
            return;
        }

        setIsParsing(true);
        try {
            const parsedData = parseAIResponse(aiInput);
            const finalData = {
                ...parsedData,
                curso: formData.curso,
                duracion: formData.duracion,
                asignaturas: formData.subjects,
                nombre_colegio: formData.school,
                fecha_inicio: formData.launchDate,
                idea: formData.idea // Persist the original idea for future editing
            };
            onSubmit(finalData);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsParsing(false);
        }
    };

    const handleAddCustomSubject = () => {
        if (customSubject.trim() && !formData.subjects.includes(customSubject.trim())) {
            setFormData(prev => ({
                ...prev,
                subjects: [...prev.subjects, customSubject.trim()]
            }));
            setCustomSubject('');
        }
    };

    return (
        <div className="max-w-4xl mx-auto w-full">
            <div className="mb-12">
                <div className="flex justify-between items-center relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800/50 -z-10 rounded-full" />
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-500 -z-10 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                        style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                    />

                    {STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const isActive = idx === currentStep;
                        const isCompleted = idx < currentStep;

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-3 px-2">
                                <div
                                    className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 relative z-10",
                                        isActive ? "bg-indigo-600 border-indigo-400 text-white scale-110 shadow-xl shadow-indigo-500/40 rotate-3" :
                                            isCompleted ? "bg-slate-800 border-indigo-500/50 text-indigo-400 shadow-lg" : "bg-slate-900 border-slate-800 text-slate-600"
                                    )}
                                >
                                    <Icon className={cn("h-6 w-6", isActive && "animate-pulse")} />
                                </div>
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block transition-colors duration-300",
                                    isActive ? "text-indigo-400" : "text-slate-600"
                                )}>
                                    {step.title}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="card-glass rounded-3xl overflow-hidden min-h-[500px] flex flex-col relative border-slate-700/50 shadow-2xl">

                <div className="p-4 md:p-8 flex-1">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="h-full flex flex-col"
                        >
                            <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2 tracking-tight">
                                {STEPS[currentStep].title}
                            </h2>
                            <p className="text-slate-400 mb-8 font-medium">{STEPS[currentStep].description}</p>


                            <div className="flex-1">
                                {currentStep === 0 && (
                                    <div className="space-y-4">
                                        <Textarea
                                            autoFocus
                                            value={formData.idea}
                                            onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
                                            placeholder="Describe la idea central, el problema, el contexto de tus estudiantes..."
                                            className="h-52 text-lg leading-relaxed resize-none"
                                        />
                                        <div className="bg-indigo-500/5 border border-indigo-500/20 p-5 rounded-2xl flex gap-4 text-indigo-300 text-sm">
                                            <div className="bg-indigo-500/20 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-indigo-500/20">
                                                <Lightbulb className="h-5 w-5 text-indigo-400" />
                                            </div>
                                            <p className="leading-relaxed">
                                                <span className="font-bold text-indigo-200 block mb-1">Tip para mejores resultados:</span>
                                                Puedes escribir párrafos largos explicando tu metodología, características del curso o materiales específicos.
                                            </p>
                                        </div>

                                    </div>
                                )}

                                {currentStep === 1 && (
                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <Label className="text-sm font-black uppercase tracking-widest text-slate-500 ml-1">Nivel Educativo</Label>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                {GRADES.map(grade => (
                                                    <button
                                                        key={grade}
                                                        onClick={() => setFormData({ ...formData, curso: grade })}
                                                        className={cn(
                                                            "p-4 rounded-xl border text-sm font-bold transition-all duration-300 hover:scale-[1.05] active:scale-95",
                                                            formData.curso === grade
                                                                ? "bg-gradient-to-br from-indigo-600 to-blue-600 text-white border-indigo-400 shadow-xl shadow-indigo-500/20"
                                                                : "bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                                                        )}
                                                    >
                                                        {grade}
                                                    </button>
                                                ))}
                                            </div>

                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label className="text-base">Duración del Proyecto</Label>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        max="40"
                                                        value={formData.duracion}
                                                        onChange={(e) => setFormData({ ...formData, duracion: parseInt(e.target.value) || 0 })}
                                                        className="pr-16 text-lg"
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium pointer-events-none">Semanas</span>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-base">Nombre del Colegio</Label>
                                                <Input
                                                    value={formData.school}
                                                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                                                    placeholder="Ej: Escuela Roberto Ojeda"
                                                    className="text-lg"
                                                />
                                            </div>

                                            <div className="space-y-3 md:col-span-2">
                                                <Label className="text-base">Fecha Estimada de Lanzamiento</Label>
                                                <Input
                                                    value={formData.launchDate}
                                                    onChange={(e) => setFormData({ ...formData, launchDate: e.target.value })}
                                                    placeholder="Ej: Segunda semana de Abril, o Mayo 2024"
                                                    className="text-lg"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {SUBJECTS.map(subject => {
                                                const isSelected = formData.subjects.includes(subject);
                                                return (
                                                    <button
                                                        key={subject}
                                                        onClick={() => {
                                                            const newSubjects = isSelected
                                                                ? formData.subjects.filter(s => s !== subject)
                                                                : [...formData.subjects, subject];
                                                            setFormData({ ...formData, subjects: newSubjects });
                                                        }}
                                                        className={cn(
                                                            "p-5 rounded-2xl border text-left flex flex-col gap-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden",
                                                            isSelected
                                                                ? "bg-indigo-500/10 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                                                                : "bg-slate-900/50 border-slate-800 hover:border-indigo-500/30"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-300",
                                                            isSelected
                                                                ? "bg-indigo-500 border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                                                : "border-slate-700 bg-slate-950"
                                                        )}>
                                                            {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                                                        </div>
                                                        <span className={cn("font-bold text-sm tracking-tight transition-colors", isSelected ? "text-white" : "text-slate-400 group-hover:text-slate-200")}>
                                                            {subject}
                                                        </span>
                                                        {isSelected && (
                                                            <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-indigo-500/10 rounded-full blur-xl" />
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        {/* Custom Subject Input */}
                                        <div className="pt-8 border-t border-slate-800/50">
                                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1">¿Asignatura Adicional?</h3>
                                            <div className="flex gap-3">
                                                <Input
                                                    value={customSubject}
                                                    onChange={(e) => setCustomSubject(e.target.value)}
                                                    placeholder="Ej: Taller de Robótica..."
                                                    className="flex-1"
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSubject()}
                                                />

                                                <Button
                                                    onClick={handleAddCustomSubject}
                                                    variant="secondary"
                                                    disabled={!customSubject.trim()}
                                                >
                                                    Agregar
                                                </Button>
                                            </div>

                                            {/* Render Custom Subjects that are NOT in the standard list */}
                                            {formData.subjects.filter(s => !SUBJECTS.includes(s)).length > 0 && (
                                                <div className="mt-5 flex flex-wrap gap-2">
                                                    {formData.subjects.filter(s => !SUBJECTS.includes(s)).map(subject => (
                                                        <div key={subject} className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-3">
                                                            {subject}
                                                            <button
                                                                onClick={() => setFormData(prev => ({ ...prev, subjects: prev.subjects.filter(s => s !== subject) }))}
                                                                className="hover:text-white transition-colors bg-indigo-500/20 rounded-md w-5 h-5 flex items-center justify-center"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="space-y-6">
                                        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 shadow-inner">
                                            <div className="flex items-center justify-between mb-5">
                                                <h3 className="font-black text-indigo-200 flex items-center gap-3 uppercase tracking-widest text-sm">
                                                    <span className="bg-indigo-600 text-white w-7 h-7 rounded-lg flex items-center justify-center text-xs shadow-lg shadow-indigo-500/20 font-black">1</span>
                                                    Prompt Maestro
                                                </h3>
                                                <Button size="sm" onClick={handleCopyPrompt} className="rounded-xl px-4 py-5 shadow-xl shadow-indigo-500/20 font-bold uppercase tracking-widest text-[10px]">
                                                    <Copy className="mr-2 h-4 w-4" /> Copiar Comando
                                                </Button>
                                            </div>
                                            <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                                Este comando contiene todas las instrucciones expertas para tu proyecto. Llévalo a <span className="text-white font-bold">ChatGPT, Claude o Gemini</span>.
                                            </p>
                                        </div>

                                        <div className="bg-slate-950/40 border border-slate-800/50 rounded-2xl p-6 shadow-2xl">
                                            <h3 className="font-black text-white flex items-center gap-3 mb-5 uppercase tracking-widest text-sm">
                                                <span className="bg-slate-800 text-white w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black">2</span>
                                                Respuesta de la IA
                                            </h3>
                                            <Textarea
                                                value={aiInput}
                                                onChange={(e) => setAiInput(e.target.value)}
                                                placeholder="Pega aquí el resultado JSON que te dio la IA..."
                                                className="min-h-[200px] font-mono text-xs bg-slate-950/50 border-slate-800 focus:border-indigo-500 tracking-tight"
                                            />
                                        </div>
                                    </div>
                                )}

                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="bg-slate-950/50 p-6 md:p-8 border-t border-slate-800/50 flex justify-between items-center">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={currentStep === 0 || isLoading || isParsing}
                        className={cn(
                            "w-12 h-12 md:w-14 md:h-14 rounded-2xl p-0 transition-all hover:bg-slate-900 text-slate-400 hover:text-white",
                            currentStep === 0 && "invisible"
                        )}
                        title="Anterior"
                    >
                        <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
                    </Button>

                    {currentStep === STEPS.length - 1 ? (
                        <Button
                            onClick={handleProcessAI}
                            disabled={!aiInput.trim() || isParsing}
                            size="icon"
                            className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-xl shadow-emerald-500/20 text-white rounded-[2rem] active:scale-95 transition-all group"
                            isLoading={isParsing}
                            title="Materializar Proyecto"
                        >
                            {!isParsing && <Play className="h-8 w-8 md:h-10 md:w-10 fill-current animate-pulse group-hover:animate-none" />}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            disabled={!isStepValid()}
                            size="icon"
                            className="w-12 h-12 md:w-14 md:h-14 rounded-2xl shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all"
                            title="Siguiente Paso"
                        >
                            <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
                        </Button>
                    )}
                </div>

            </div>
        </div>
    );
}
