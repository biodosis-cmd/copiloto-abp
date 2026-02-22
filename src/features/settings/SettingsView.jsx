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
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="pb-8 border-b border-slate-800/50">
                <h1 className="text-4xl font-black text-white tracking-tight mb-2">Configuración</h1>
                <p className="text-slate-400 font-medium">Personaliza tu experiencia y gestiona tus datos maestros.</p>
            </div>

            <div className="grid gap-8">
                <Section title="Datos Predeterminados" icon={<School className="h-5 w-5 text-indigo-400" />}>
                    <div className="card-glass p-8 rounded-3xl border-slate-800/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors duration-500" />

                        <form onSubmit={handleSaveSchool} className="flex flex-col md:flex-row gap-6 items-start md:items-end relative z-10">
                            <div className="flex-1 w-full space-y-3">
                                <label htmlFor="schoolName" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                                    Nombre de la Escuela / Institución
                                </label>
                                <input
                                    type="text"
                                    name="schoolName"
                                    id="schoolName"
                                    defaultValue={defaultSchool}
                                    placeholder="Ej: Escuela Roberto Ojeda Torres"
                                    className="w-full p-4 bg-slate-950/50 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-white font-medium placeholder:text-slate-600 shadow-2xl"
                                />
                                <p className="text-xs text-slate-500 italic ml-1">
                                    Este nombre se aplicará automáticamente a los nuevos proyectos generados.
                                </p>
                            </div>
                            <Button type="submit" className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-4 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                                <Save className="h-5 w-5" />
                                Guardar Cambios
                            </Button>
                        </form>
                    </div>
                </Section>

                <Section title="Respaldo y Restauración" icon={<Database className="h-5 w-5 text-indigo-400" />}>
                    <div className="card-glass p-8 rounded-3xl border-slate-800/50 relative overflow-hidden group">
                        <div className="flex items-start gap-4 mb-8 bg-indigo-500/5 p-5 rounded-2xl border border-indigo-500/10 backdrop-blur-md">
                            <AlertCircle className="h-6 w-6 text-indigo-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                Tus proyectos se guardan automáticamente en este navegador. <br />
                                Para proteger tu trabajo o moverlo a otro equipo, te recomendamos <span className="text-indigo-400 font-bold underline decoration-indigo-400/30 underline-offset-4">descargar una copia de seguridad</span> periódicamente.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6">
                            <Button onClick={handleExportBackup} variant="outline" className="flex-1 h-auto py-8 px-6 flex flex-col items-center gap-4 bg-slate-900/30 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/50 rounded-3xl transition-all duration-300 group/btn shadow-xl">
                                <div className="bg-indigo-500/10 p-5 rounded-2xl group-hover/btn:bg-indigo-500/20 group-hover/btn:scale-110 transition-all duration-500">
                                    <Download className="h-8 w-8 text-indigo-400" />
                                </div>
                                <div className="text-center">
                                    <span className="block font-black text-white text-lg tracking-tight mb-1">Exportar Backup</span>
                                    <span className="text-xs text-slate-500 font-medium uppercase tracking-widest">Descargar .json</span>
                                </div>
                            </Button>

                            <Button onClick={() => fileInputRef.current.click()} variant="outline" className="flex-1 h-auto py-8 px-6 flex flex-col items-center gap-4 bg-slate-900/30 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/50 rounded-3xl transition-all duration-300 group/btn shadow-xl">
                                <div className="bg-emerald-500/10 p-5 rounded-2xl group-hover/btn:bg-emerald-500/20 group-hover/btn:scale-110 transition-all duration-500">
                                    <Upload className="h-8 w-8 text-emerald-400" />
                                </div>
                                <div className="text-center">
                                    <span className="block font-black text-white text-lg tracking-tight mb-1">Restaurar Backup</span>
                                    <span className="text-xs text-slate-500 font-medium uppercase tracking-widest">Importar .json</span>
                                </div>
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
        <section className="animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="flex items-center gap-3 mb-6 ml-1">
                <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                    {icon}
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-widest">{title}</h2>
            </div>
            {children}
        </section>
    );
}
