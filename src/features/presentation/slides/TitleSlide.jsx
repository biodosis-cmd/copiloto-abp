import React from 'react';
import { motion } from 'framer-motion';

export function TitleSlide({ data }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-full text-center space-y-8 p-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold tracking-wider mb-4 uppercase">
                    Proyecto de Aprendizaje
                </span>
                <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-tight tracking-tight mb-2">
                    {data.nombre_proyecto || "Proyecto Sin Título"}
                </h1>
                <div className="h-2 w-32 bg-indigo-500 mx-auto rounded-full mt-6"></div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="space-y-2"
            >
                <h2 className="text-3xl text-slate-600 font-medium">
                    {data.nombre_colegio || "Escuela"}
                </h2>
                <p className="text-xl text-slate-400 font-medium">
                    {data.curso || "Curso"} • {data.fecha_inicio || "Fecha"}
                </p>
                {data.duracion && (
                    <p className="text-lg text-indigo-500 font-semibold mt-2">
                        Duración: {data.duracion} semanas
                    </p>
                )}
            </motion.div>
        </div>
    );
}
