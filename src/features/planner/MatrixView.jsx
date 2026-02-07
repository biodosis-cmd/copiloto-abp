import React from 'react';

const EditableSection = ({ title, content, path, color, onUpdate, isList = false, listKey }) => {
    // If list, content is array.

    return (
        <div className={`relative group p-4 md:p-6 rounded-xl transition-all hover:shadow-md bg-${color}-50 border border-${color}-100`}>
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg text-gray-900">{title}</h3>
                {/* Wand removed as requested */}
            </div>

            {isList ? (
                <ul className="list-disc list-inside space-y-2">
                    {content?.map((item, idx) => {
                        // Special handling for OAI object structure
                        const isObject = typeof item === 'object';
                        const text = isObject ? item[listKey] : item; // e.g. item.oa
                        const itemPath = [...path, idx, isObject ? listKey : null].filter(p => p !== null);

                        return (
                            <li key={idx} className="relative group/item">
                                {isObject && <span className="font-semibold">{item.asignatura}: </span>}
                                <span
                                    contentEditable
                                    suppressContentEditableWarning
                                    className="outline-none focus:bg-white/50 rounded px-1"
                                    onBlur={(e) => onUpdate(itemPath, e.currentTarget.textContent)}
                                >
                                    {text}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p
                    contentEditable
                    suppressContentEditableWarning
                    className="outline-none focus:bg-white/50 p-2 rounded text-gray-700 leading-relaxed"
                    onBlur={(e) => onUpdate(path, e.currentTarget.textContent)}
                >
                    {content}
                </p>
            )}
        </div>
    );
};

export function MatrixView({ data, onUpdate }) {
    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-2">Información General</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        {data.curso && <p><span className="font-semibold">Curso:</span> {data.curso}</p>}
                        {data.duracion && <p><span className="font-semibold">Duración:</span> {data.duracion} semanas</p>}
                        {data.asignaturas && <p><span className="font-semibold">Asignaturas:</span> {Array.isArray(data.asignaturas) ? data.asignaturas.join(', ') : data.asignaturas}</p>}
                    </div>
                </div>

                <EditableSection
                    title="Problema"
                    content={data.problema}
                    path={['problema']}
                    color="red"
                    onUpdate={onUpdate}
                />

                <EditableSection
                    title="OAI (Objetivos de Aprendizaje)"
                    content={data.oai}
                    path={['oai']}
                    color="orange"
                    onUpdate={onUpdate}
                    isList
                    listKey="oa"
                />

                <EditableSection
                    title="RAI (Resultados de Aprendizaje)"
                    content={data.rai}
                    path={['rai']}
                    color="yellow"
                    onUpdate={onUpdate}
                    isList
                />

                <EditableSection
                    title="Habilidades Siglo XXI"
                    content={data.hsxxi}
                    path={['hsxxi']}
                    color="pink"
                    onUpdate={onUpdate}
                    isList
                />

                <EditableSection
                    title="Producto Final"
                    content={data.producto_final}
                    path={['producto_final']}
                    color="purple"
                    onUpdate={onUpdate}
                />

                <EditableSection
                    title="Pregunta Guía"
                    content={data.pregunta_guia}
                    path={['pregunta_guia']}
                    color="indigo"
                    onUpdate={onUpdate}
                />
            </div>
        </div>
    );
}
