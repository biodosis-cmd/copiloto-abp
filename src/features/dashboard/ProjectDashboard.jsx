import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LayoutGrid, List, Presentation, GraduationCap, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { MatrixView } from '../planner/MatrixView';
import { ScheduleView } from '../planner/ScheduleView';
import { RubricView } from '../planner/RubricView';
import { ExportMenu } from '@/components/ExportMenu';

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
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">Proyecto Activo</span>
                        <span className="text-slate-400 text-xs">Última actualización: Ahora mismo</span>
                    </div>
                    <h1
                        className="text-2xl md:text-3xl font-extrabold text-slate-900 outline-none focus:bg-indigo-50 rounded px-1 -ml-1 transition-colors"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleManualUpdate(['nombre_proyecto'], e.currentTarget.textContent)}
                    >
                        {localData.nombre_proyecto}
                    </h1>
                    <div className="flex flex-col gap-2 mt-3">
                        <div className="flex flex-wrap items-center gap-4">
                            {/* School Capsule */}
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500 text-sm font-medium">Institución:</span>
                                <div
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all cursor-text
                                        ${localData.nombre_colegio
                                            ? 'bg-indigo-50 border-indigo-200 hover:border-indigo-300'
                                            : 'bg-amber-50 border-amber-200 animate-pulse hover:bg-amber-100 ring-2 ring-amber-100'
                                        }`}
                                >
                                    {!localData.nombre_colegio && <span className="text-amber-600 text-xs font-bold uppercase tracking-wider mr-1">Requerido</span>}
                                    <h2
                                        className={`text-base font-medium outline-none min-w-[200px]
                                            ${localData.nombre_colegio ? 'text-indigo-700' : 'text-slate-400 italic'}`}
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
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500 text-sm font-medium">Fecha:</span>
                                <div
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all cursor-text
                                        ${localData.fecha_inicio
                                            ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                            : 'bg-amber-50 border-amber-200 animate-pulse hover:bg-amber-100 ring-2 ring-amber-100'
                                        }`}
                                >
                                    {!localData.fecha_inicio && <span className="text-amber-600 text-xs font-bold uppercase tracking-wider mr-1">Requerido</span>}
                                    <h2
                                        className={`text-base font-medium outline-none min-w-[120px]
                                            ${localData.fecha_inicio ? 'text-slate-700' : 'text-slate-400 italic'}`}
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => handleManualUpdate(['fecha_inicio'], e.currentTarget.textContent)}
                                        data-placeholder="Fecha de inicio..."
                                    >
                                        {localData.fecha_inicio || "Por definir"}
                                    </h2>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isFreshProject && (
                        <Button
                            variant="ghost"
                            onClick={onRefine}
                            className="hidden md:flex items-center gap-2 text-slate-600 hover:text-indigo-600 hover:bg-white"
                            title="Volver a editar la idea y generar de nuevo"
                        >
                            <Wand2 className="w-4 h-4" />
                            Refinar Idea
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={onPresent}
                        className="hidden md:flex items-center gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    >
                        <Presentation className="w-4 h-4" />
                        Presentar
                    </Button>
                    <ExportMenu data={localData} />
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-6 border-b border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <LayoutGrid className="h-4 w-4" /> Visión General (Matrix)
                </button>
                <button
                    onClick={() => setActiveTab('timeline')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'timeline' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <List className="h-4 w-4" /> Cronograma y Actividades
                </button>
                <button
                    onClick={() => setActiveTab('rubric')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'rubric' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <GraduationCap className="h-4 w-4" /> Evaluación
                </button>
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
                    <RubricView
                        data={localData}
                        onUpdate={(newData) => {
                            setLocalData(newData);
                            if (onUpdateProject) onUpdateProject(newData);
                        }}
                    />
                )}
            </div>
        </div>
    )
}
