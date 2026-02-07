import React, { useRef } from 'react';
import { db } from '../../db';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Download, Upload, Database, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useLiveQuery } from 'dexie-react-hooks';
import { School, Save } from 'lucide-react'; // Added icons

export function SettingsView() {
    const fileInputRef = useRef(null);
    const settings = useLiveQuery(() => db.settings.toArray());
    const defaultSchool = settings?.find(s => s.key === 'defaultSchool')?.value || '';

    const handleSaveSchool = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const schoolName = formData.get('schoolName');

        try {
            await db.settings.put({ key: 'defaultSchool', value: schoolName });
            toast.success('Escuela predeterminada guardada.');
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar configuración.');
        }
    };


    const handleExportBackup = async () => {
        try {
            const allProjects = await db.projects.toArray();
            const backupData = {
                version: 1,
                timestamp: new Date().toISOString(),
                projects: allProjects
            };

            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `copiloto_backup_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success(`Copia de seguridad generada con ${allProjects.length} proyectos.`);
        } catch (error) {
            console.error(error);
            toast.error("Error al generar la copia de seguridad.");
        }
    };

    const handleImportBackup = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.projects || !Array.isArray(data.projects)) {
                    throw new Error("Formato de archivo inválido");
                }

                if (window.confirm(`Se encontraron ${data.projects.length} proyectos en el respaldo. ¿Deseas importarlos? (Esto fusionará con los existentes)`)) {
                    // Bulk put to merge/overwrite
                    await db.projects.bulkPut(data.projects);
                    toast.success("Copia de seguridad restaurada exitosamente.");
                }
            } catch (error) {
                console.error(error);
                toast.error("Error al leer el archivo de respaldo.");
            }
        };
        reader.readAsText(file);
        // Reset input
        event.target.value = null;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="border-b border-slate-200 pb-6">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Configuración</h1>
                <p className="text-slate-500 mt-1">Opciones generales y gestión de datos.</p>
            </div>

            <div className="grid gap-8">
                <Section title="Datos Predeterminados" icon={<School className="h-5 w-5 text-indigo-600" />}>
                    <Card className="p-6">
                        <form onSubmit={handleSaveSchool} className="flex gap-4 items-end">
                            <div className="flex-1 space-y-2">
                                <label htmlFor="schoolName" className="text-sm font-medium text-slate-700">Nombre de la Escuela / Institución</label>
                                <input
                                    type="text"
                                    name="schoolName"
                                    id="schoolName"
                                    defaultValue={defaultSchool}
                                    placeholder="Ej: Escuela Roberto Ojeda Torres"
                                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <p className="text-xs text-slate-500">Este nombre aparecerá automáticamente al crear nuevos proyectos.</p>
                            </div>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                <Save className="h-4 w-4 mr-2" />
                                Guardar
                            </Button>
                        </form>
                    </Card>
                </Section>

                <Section title="Respaldo y Restauración" icon={<Database className="h-5 w-5 text-indigo-600" />}>
                    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                        <div className="flex items-start gap-4 mb-6">
                            <AlertCircle className="h-5 w-5 text-indigo-500 mt-1 flex-shrink-0" />
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Tus proyectos se guardan automáticamente en este navegador. <br />
                                Para proteger tu trabajo o moverlo a otro equipo, te recomendamos <strong>descargar una copia de seguridad</strong> periódicamente.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button onClick={handleExportBackup} variant="outline" className="flex-1 h-auto py-4 flex flex-col items-center gap-2 border-slate-300 hover:border-indigo-400 hover:bg-white transition-all group">
                                <div className="bg-indigo-50 p-3 rounded-full group-hover:bg-indigo-100 transition-colors">
                                    <Download className="h-6 w-6 text-indigo-600" />
                                </div>
                                <span className="font-semibold text-slate-700 group-hover:text-indigo-700">Exportar Copia de Seguridad</span>
                                <span className="text-xs text-slate-400 font-normal">Descargar archivo .json</span>
                            </Button>

                            <Button onClick={() => fileInputRef.current.click()} variant="outline" className="flex-1 h-auto py-4 flex flex-col items-center gap-2 border-slate-300 hover:border-emerald-400 hover:bg-white transition-all group">
                                <div className="bg-emerald-50 p-3 rounded-full group-hover:bg-emerald-100 transition-colors">
                                    <Upload className="h-6 w-6 text-emerald-600" />
                                </div>
                                <span className="font-semibold text-slate-700 group-hover:text-emerald-700">Restaurar Copia de Seguridad</span>
                                <span className="text-xs text-slate-400 font-normal">Importar archivo .json</span>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImportBackup}
                                    accept=".json"
                                    className="hidden"
                                />
                            </Button>
                        </div>
                    </div>
                </Section>
            </div>
        </div>
    );
}

function Section({ title, icon, children }) {
    return (
        <section>
            <div className="flex items-center gap-2 mb-4">
                {icon}
                <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            </div>
            {children}
        </section>
    );
}
