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
            <div className="flex justify-between items-center border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mis Proyectos</h1>
                    <p className="text-slate-500 mt-1">Gestiona y retoma tus planificaciones guardadas.</p>
                </div>
                <Button onClick={onNewProject} size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Nuevo Proyecto
                </Button>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                    <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FolderOpen className="h-8 w-8 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-medium text-slate-900">No tienes proyectos guardados</h3>
                    <p className="text-slate-500 mt-2 max-w-sm mx-auto">Comienza una nueva aventura de aprendizaje ahora mismo.</p>
                    <Button onClick={onNewProject} variant="outline" className="mt-6 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                        Crear mi primer proyecto
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(project => (
                        <Card key={project.id} className="group hover:shadow-xl transition-all duration-300 border-slate-200 overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-10 h-10 rounded-lg flex items-center justify-center shadow-md">
                                        <FolderOpen className="h-5 w-5 text-white" />
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm('¿Estás seguro de eliminar este proyecto permanentemente?')) {
                                                db.projects.delete(project.id);
                                            }
                                        }}
                                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                        title="Eliminar proyecto"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                    {project.nombre_proyecto || "Proyecto Sin Nombre"}
                                </h3>

                                <div className="flex items-center text-xs text-slate-400 mb-6 space-x-3">
                                    <span className="flex items-center">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {project.timestamp ? formatDistanceToNow(new Date(project.timestamp), { addSuffix: true, locale: es }) : 'Reciente'}
                                    </span>
                                    {project.nombre_colegio && (
                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500 truncate max-w-[120px]">
                                            {project.nombre_colegio}
                                        </span>
                                    )}
                                </div>

                                <Button
                                    onClick={() => onOpenProject(project)}
                                    className="w-full bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200"
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
