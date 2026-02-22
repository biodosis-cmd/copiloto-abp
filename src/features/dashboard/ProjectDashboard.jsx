import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LayoutGrid, List, GraduationCap, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MatrixView } from '../planner/MatrixView';
import { ScheduleView } from '../planner/ScheduleView';
import { RubricView } from '../planner/RubricView';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export function ProjectDashboard({ data, onReset, onUpdateProject, onPresent, onRefine, isFreshProject }) {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' (matrix) | 'timeline' (schedule)
    const [localData, setLocalData] = useState(data); // Local state for editing

    // Sync localData if data prop changes (e.g. opening different project)
    React.useEffect(() => {
        setLocalData(data);
    }, [data]);

    // Helper to handle manual updates
    const handleManualUpdate = (fieldPath, value) => {
        const newData = { ...localData };
        let target = newData;
        for (let i = 0; i < fieldPath.length - 1; i++) {
            target = target[fieldPath[i]];
        }
        target[fieldPath[fieldPath.length - 1]] = value;
        setLocalData(newData);

        // Trigger auto-save to parent
        if (onUpdateProject) {
            onUpdateProject(newData);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 selection:bg-indigo-500/30">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800/50 pb-8">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-black px-2.5 py-1 rounded-full border border-indigo-500/20 uppercase tracking-widest">
                            Proyecto Activo
                        </span>
                        <span className="text-slate-500 text-[10px] uppercase tracking-widest font-bold ml-2">Sincronizado</span>
                    </div>
                    <h1
                        className="text-3xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-slate-400 outline-none focus:bg-slate-900/50 rounded-xl px-2 -ml-2 transition-all duration-300 leading-tight"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleManualUpdate(['nombre_proyecto'], e.currentTarget.textContent)}
                    >
                        {localData.nombre_proyecto}
                    </h1>
                    <div className="flex flex-col gap-2 mt-6">
                        <div className="flex flex-wrap items-center gap-5">
                            {/* School Capsule */}
                            <div className="flex items-center gap-3">
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Institución:</span>
                                <div
                                    className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all duration-300 cursor-text group
                                        ${localData.nombre_colegio
                                            ? 'bg-slate-900/50 border-slate-800 hover:border-indigo-500/50'
                                            : 'bg-amber-900/10 border-amber-500/30 animate-pulse hover:bg-amber-900/20 ring-4 ring-amber-500/5'
                                        }`}
                                >
                                    {!localData.nombre_colegio && <span className="text-amber-500 text-[10px] font-black uppercase tracking-wider">Pendiente</span>}
                                    <h2
                                        className={`text-sm md:text-base font-bold outline-none min-w-[200px]
                                            ${localData.nombre_colegio ? 'text-white group-hover:text-indigo-400 transition-colors' : 'text-slate-600 italic'}`}
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => handleManualUpdate(['nombre_colegio'], e.currentTarget.textContent)}
                                        data-placeholder="Nombre del Colegio..."
                                    >
                                        {localData.nombre_colegio}
                                    </h2>
                                </div>
                            </div>

                            {/* Launch Date Field */}
                            <div className="flex items-center gap-3">
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Temporalidad:</span>
                                <div
                                    className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all duration-300 cursor-text group
                                        ${localData.fecha_inicio
                                            ? 'bg-slate-900/50 border-slate-800 hover:border-blue-500/50'
                                            : 'bg-slate-900/30 border-slate-800/50 hover:bg-slate-900/60'
                                        }`}
                                >
                                    <h2
                                        className={`text-sm md:text-base font-bold outline-none min-w-[140px]
                                            ${localData.fecha_inicio ? 'text-white group-hover:text-blue-400 transition-colors' : 'text-slate-600 italic'}`}
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => handleManualUpdate(['fecha_inicio'], e.currentTarget.textContent)}
                                        data-placeholder="Fecha de inicio..."
                                    >
                                        {localData.fecha_inicio || "Editable..."}
                                    </h2>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isFreshProject && (
                        <Button
                            variant="ghost"
                            onClick={onRefine}
                            className="hidden md:flex items-center gap-2 rounded-xl border border-transparent hover:border-slate-800 hover:bg-slate-900 px-5 transition-all text-slate-400 hover:text-indigo-400"
                            title="Volver a editar la idea y generar de nuevo"
                        >
                            <Wand2 className="w-4 h-4" />
                            Refinar Idea
                        </Button>
                    )}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-800/50">
                <div className="flex items-center space-x-6 overflow-x-auto whitespace-nowrap scrollbar-hide -mb-[2px] px-1 relative">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`pb-4 text-[10px] md:text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2.5 flex-shrink-0 ${activeTab === 'overview' ? 'border-indigo-500 text-white shadow-[0_4px_12px_-4px_rgba(99,102,241,0.5)]' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        <LayoutGrid className="h-4 w-4" /> Visión General
                    </button>
                    <button
                        onClick={() => setActiveTab('timeline')}
                        className={`pb-4 text-[10px] md:text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2.5 flex-shrink-0 ${activeTab === 'timeline' ? 'border-indigo-500 text-white shadow-[0_4px_12px_-4px_rgba(99,102,241,0.5)]' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        <List className="h-4 w-4" /> Cronograma
                    </button>
                    <button
                        onClick={() => setActiveTab('rubric')}
                        className={`pb-4 text-[10px] md:text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2.5 flex-shrink-0 ${activeTab === 'rubric' ? 'border-indigo-500 text-white shadow-[0_4px_12px_-4px_rgba(99,102,241,0.5)]' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        <GraduationCap className="h-4 w-4" /> Evaluación
                    </button>
                </div>

            </div>


            {/* Content Area */}
            <div className="min-h-[600px]">
                {activeTab === 'overview' && (
                    <MatrixView
                        data={localData}
                        onUpdate={handleManualUpdate}
                    />
                )}

                {activeTab === 'timeline' && (
                    <ScheduleView
                        cronograma={localData.cronograma}
                        onUpdate={handleManualUpdate}
                        projectData={localData}
                    />
                )}

                {activeTab === 'rubric' && (
                    <ErrorBoundary onReset={() => setActiveTab('overview')}>
                        <RubricView
                            data={localData}
                            onUpdate={(newData) => {
                                setLocalData(newData);
                                if (onUpdateProject) onUpdateProject(newData);
                            }}
                        />
                    </ErrorBoundary>
                )}
            </div>
        </div>
    );
}

