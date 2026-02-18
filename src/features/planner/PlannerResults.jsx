import React, { useState } from 'react';
import { copyToClipboard } from '@/utils/clipboard.js';
import { Button } from '@/components/ui/Button';
import { MatrixView } from './MatrixView';
import { ScheduleView } from './ScheduleView';
import { ImprovementModal } from './ImprovementModal';
import { Printer, Copy, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export function PlannerResults({ data, onReset }) {
    const [activeTab, setActiveTab] = useState('matrix');
    const [localData, setLocalData] = useState(data); // Local state for editing
    const [modalState, setModalState] = useState({ isOpen: false, context: '', currentText: '', fieldPath: null });

    // Sync prop data if it changes (optional if we want to support reset from parent properly)
    React.useEffect(() => {
        setLocalData(data);
    }, [data]);

    const handleOpenImprovement = (context, currentText, fieldPath) => {
        setModalState({ isOpen: true, context, currentText, fieldPath });
    };

    const handleImproveConfirm = (newText) => {
        const { fieldPath } = modalState;
        if (!fieldPath) return;

        const newData = { ...localData };

        // Basic path handling (e.g. 'problema' or 'cronograma[0].actividades')
        // For simplicity let's assume fieldPath is an array ['key', index, 'subKey']
        let target = newData;
        for (let i = 0; i < fieldPath.length - 1; i++) {
            target = target[fieldPath[i]];
        }
        const lastKey = fieldPath[fieldPath.length - 1];

        // Handle list items or string replacement depending on structure?
        // For lists in MatrixView, we probably want to append or replace if it's a specific item.
        // Let's assume fieldPath points directly to the string property to update.
        // But for 'oai' it's a list. 
        // If the prompt returns a list, replace logic needs to match.
        // For now, if it returns a string, we replace.

        target[lastKey] = newText;

        setLocalData(newData);
    };

    const projectContext = {
        problema: localData.problema,
        curso: localData.curso,
        asignaturas: localData.asignaturas // Array or string? likely string if joined, or we join it.
        // We pass whole localData mostly.
    };

    // Helper to update text manually (contentEditable blur)
    const handleManualUpdate = (fieldPath, value) => {
        const newData = { ...localData };
        let target = newData;
        for (let i = 0; i < fieldPath.length - 1; i++) {
            target = target[fieldPath[i]];
        }
        target[fieldPath[fieldPath.length - 1]] = value;
        setLocalData(newData);
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 no-print">
                <h2
                    className="text-2xl font-bold text-gray-900 truncate max-w-xl outline-none border-b border-transparent focus:border-indigo-300"
                    contentEditable
                    spellCheck={false}
                    onBlur={(e) => handleManualUpdate(['nombre_proyecto'], e.currentTarget.textContent)}
                    suppressContentEditableWarning
                >
                    {localData.nombre_proyecto}
                </h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" /> Imprimir
                    </Button>
                    <Button variant="outline" size="sm" onClick={async () => {
                        await copyToClipboard(JSON.stringify(localData, null, 2));
                        toast.success("JSON copiado al portapapeles");
                    }}>
                        <Copy className="mr-2 h-4 w-4" /> JSON
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onReset} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <RotateCcw className="mr-2 h-4 w-4" /> Reiniciar
                    </Button>
                </div>
            </div>

            {/* Header for Print: Always visible in print, hidden in screen if handled above */}
            <div className="hidden print:block text-center mb-6">
                <h1 className="text-3xl font-bold">{localData.nombre_proyecto}</h1>
                <p className="text-sm text-gray-500">Planificación Generada con Copiloto ABP</p>
            </div>

            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit no-print">
                <button
                    onClick={() => setActiveTab('matrix')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'matrix' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Parte I: Mátrix
                </button>
                <button
                    onClick={() => setActiveTab('schedule')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'schedule' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Parte II: Cronograma
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 min-h-[500px] print:shadow-none print:border-0">
                {activeTab === 'matrix' ? (
                    <MatrixView
                        data={localData}
                        onImprove={handleOpenImprovement}
                        onUpdate={handleManualUpdate}
                    />
                ) : (
                    <ScheduleView
                        cronograma={localData.cronograma}
                        onImprove={handleOpenImprovement}
                        onUpdate={handleManualUpdate}
                    />
                )}
            </div>

            <ImprovementModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                context={modalState.context}
                currentText={modalState.currentText}
                onImprove={handleImproveConfirm}
                projectContext={projectContext}
            />
        </div>
    );
}
