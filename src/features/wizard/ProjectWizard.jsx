import React, { useState } from 'react';
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

    const handleCopyPrompt = () => {
        const prompt = buildMegaPrompt(formData.idea, formData.curso, formData.duracion, formData.subjects);
        navigator.clipboard.writeText(prompt);
        toast.success('¡Prompt copiado! Ahora pégalo en ChatGPT/Gemini.');
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
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 rounded-full" />
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-indigo-600 -z-10 rounded-full transition-all duration-500"
                        style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                    />

                    {STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const isActive = idx === currentStep;
                        const isCompleted = idx < currentStep;

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2 bg-slate-50 px-2">
                                <div
                                    className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 bg-white",
                                        isActive ? "border-indigo-600 text-indigo-600 scale-110 shadow-lg" :
                                            isCompleted ? "border-indigo-600 bg-indigo-600 text-white" : "border-gray-200 text-gray-400"
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>
                                <span className={cn(
                                    "text-xs font-semibold uppercase tracking-wider hidden sm:block",
                                    isActive ? "text-indigo-600" : "text-gray-400"
                                )}>
                                    {step.title}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden min-h-[400px] flex flex-col relative">
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
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">{STEPS[currentStep].title}</h2>
                            <p className="text-slate-500 mb-6">{STEPS[currentStep].description}</p>

                            <div className="flex-1">
                                {currentStep === 0 && (
                                    <div className="space-y-4">
                                        <Textarea
                                            autoFocus
                                            value={formData.idea}
                                            onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
                                            placeholder=" Describe la idea central, el problema, el contexto de tus estudiantes, necesidades educativas especiales o recursos disponibles. ¡Mientras más detalles des, mejor será el plan!..."
                                            className="h-40 text-lg leading-relaxed resize-none border-slate-200 focus:border-indigo-500"
                                        />
                                        <div className="bg-indigo-50 p-4 rounded-lg flex gap-3 text-indigo-800 text-sm">
                                            <Lightbulb className="h-5 w-5 shrink-0" />
                                            <p>Tip: Puedes escribir párrafos largos explicando tu metodología, características del curso o materiales específicos. La IA tomará todo esto en cuenta.</p>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 1 && (
                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <Label className="text-base">Nivel Educativo</Label>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                                {GRADES.map(grade => (
                                                    <button
                                                        key={grade}
                                                        onClick={() => setFormData({ ...formData, curso: grade })}
                                                        className={cn(
                                                            "p-3 rounded-lg border text-sm font-medium transition-all hover:border-indigo-300",
                                                            formData.curso === grade
                                                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105"
                                                                : "bg-white text-slate-600 border-slate-200"
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
                                                            "p-4 rounded-xl border text-left flex flex-col gap-2 transition-all hover:shadow-md",
                                                            isSelected
                                                                ? "bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500"
                                                                : "bg-white border-slate-200 hover:border-indigo-200"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-6 h-6 rounded-full border flex items-center justify-center transition-colors",
                                                            isSelected
                                                                ? "bg-indigo-600 border-indigo-600"
                                                                : "border-slate-300"
                                                        )}>
                                                            {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                                                        </div>
                                                        <span className={cn("font-medium", isSelected ? "text-indigo-900" : "text-slate-600")}>{subject}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        {/* Custom Subject Input */}
                                        <div className="pt-4 border-t border-slate-100">
                                            <h3 className="text-sm font-bold text-slate-700 mb-3">¿Otra asignatura?</h3>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={customSubject}
                                                    onChange={(e) => setCustomSubject(e.target.value)}
                                                    placeholder="Ej: Taller de Karate"
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
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {formData.subjects.filter(s => !SUBJECTS.includes(s)).map(subject => (
                                                        <div key={subject} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                                                            {subject}
                                                            <button
                                                                onClick={() => setFormData(prev => ({ ...prev, subjects: prev.subjects.filter(s => s !== subject) }))}
                                                                className="hover:text-indigo-900"
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
                                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                                                    <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                                    Copia el Prompt Maestro
                                                </h3>
                                                <Button size="sm" onClick={handleCopyPrompt} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                                    <Copy className="mr-2 h-4 w-4" /> Copiar al Portapapeles
                                                </Button>
                                            </div>
                                            <p className="text-sm text-indigo-800/80 mb-2">
                                                Este comando contiene todas las instrucciones expertas para tu proyecto. Llévalo a ChatGPT, Claude o Gemini.
                                            </p>
                                        </div>

                                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-3">
                                                <span className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                                Pega la respuesta aquí
                                            </h3>
                                            <Textarea
                                                value={aiInput}
                                                onChange={(e) => setAiInput(e.target.value)}
                                                placeholder="Pega aquí el resultado JSON que te dio la IA..."
                                                className="min-h-[150px] font-mono text-sm bg-slate-50 border-slate-200 focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="bg-slate-50 p-4 md:p-6 border-t border-slate-100 flex justify-between items-center">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={currentStep === 0 || isLoading || isParsing}
                        className={currentStep === 0 ? "invisible" : ""}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                    </Button>

                    {currentStep === STEPS.length - 1 ? (
                        <Button
                            onClick={handleProcessAI}
                            disabled={!aiInput.trim() || isParsing}
                            size="lg"
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg text-white"
                            isLoading={isParsing}
                        >
                            {isParsing ? 'Procesando...' : (
                                <>Materializar Proyecto <Play className="ml-2 h-4 w-4 fill-current" /></>
                            )}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            disabled={!isStepValid()}
                            size="lg"
                        >
                            Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
