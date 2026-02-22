import React, { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card'; // Assuming you have a Card component
import { FolderOpen, Trash2, PlusCircle, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function ProjectList({ onOpenProject, onNewProject }) {
    // Live query to always show up-to-date list
    const projects = useLiveQuery(() => db.projects.toArray());

    if (!projects) return <div className="p-8 text-center text-slate-400">Cargando proyectos...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-center border-b border-slate-800/50 pb-8">
                <div>
                    <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400 tracking-tight">
                        Mis Proyectos
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">Gestiona y retoma tus planificaciones guardadas con IA.</p>
                </div>
                <Button
                    onClick={onNewProject}
                    size="icon"
                    className="w-12 h-12 md:w-14 md:h-14 rounded-2xl shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all group"
                    title="Nuevo Proyecto"
                >
                    <PlusCircle className="h-6 w-6 md:h-7 md:w-7 group-hover:rotate-90 transition-transform duration-300" />
                </Button>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-24 card-glass rounded-3xl border-dashed border-slate-700/50">
                    <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-indigo-500/20">
                        <FolderOpen className="h-10 w-10 text-indigo-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">No tienes proyectos guardados</h3>
                    <p className="text-slate-400 mt-3 max-w-sm mx-auto font-medium">Comienza una nueva aventura de aprendizaje ahora mismo.</p>
                    <Button onClick={onNewProject} variant="outline" className="mt-8 rounded-xl border-slate-700/50 text-indigo-400 hover:bg-slate-800/50 px-8">
                        Crear mi primer proyecto
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map(project => (
                        <Card key={project.id} className="group overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('¿Estás seguro de eliminar este proyecto permanentemente?')) {
                                            db.projects.delete(project.id);
                                        }
                                    }}
                                    className="text-slate-500 hover:text-red-400 transition-colors p-2 bg-slate-900/50 rounded-lg border border-slate-800/50"
                                    title="Eliminar proyecto"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="p-8">
                                <div className="bg-gradient-to-br from-indigo-500 to-blue-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6 transform group-hover:scale-110 transition-transform duration-300">
                                    <FolderOpen className="h-6 w-6 text-white" />
                                </div>

                                <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-indigo-300 transition-colors leading-tight">
                                    {project.nombre_proyecto || "Proyecto Sin Nombre"}
                                </h3>

                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-8">
                                    <span className="flex items-center text-slate-400 font-medium bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/30">
                                        <Calendar className="h-3.5 w-3.5 mr-2 text-indigo-400" />
                                        {project.timestamp ? formatDistanceToNow(new Date(project.timestamp), { addSuffix: true, locale: es }) : 'Reciente'}
                                    </span>
                                    {project.nombre_colegio && (
                                        <span className="bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/30 text-indigo-400 font-bold uppercase tracking-wider text-[10px] truncate max-w-[140px]">
                                            {project.nombre_colegio}
                                        </span>
                                    )}
                                </div>

                                <Button
                                    onClick={() => onOpenProject(project)}
                                    className="w-full bg-slate-900 border border-slate-800/50 text-slate-200 hover:bg-slate-800 hover:text-white rounded-xl py-6 font-bold"
                                    variant="secondary"
                                >
                                    Abrir Proyecto
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

        </div>
    );
}
