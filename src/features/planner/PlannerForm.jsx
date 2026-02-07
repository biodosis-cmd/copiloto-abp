import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { SUBJECTS, GRADES } from '@/constants';
import { Wand2 } from 'lucide-react';

export function PlannerForm({ onSubmit, isLoading }) {
    const [formData, setFormData] = useState({
        idea: '',
        curso: '7° Básico',
        duracion: 6,
        subjects: []
    });

    const handleSubjectChange = (subject) => {
        setFormData(prev => {
            const subjects = prev.subjects.includes(subject)
                ? prev.subjects.filter(s => s !== subject)
                : [...prev.subjects, subject];
            return { ...prev, subjects };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.idea || formData.subjects.length === 0) return;
        onSubmit(formData);
    };

    return (
        <Card className="w-full max-w-3xl mx-auto border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
                <div className="mx-auto bg-indigo-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <Wand2 className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                    Asistente de Planificación ABP
                </CardTitle>
                <p className="text-gray-500 mt-2">
                    Describe tu idea de proyecto y generaremos una planificación completa para ti.
                </p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="idea">Idea o Problema a Abordar</Label>
                        <Textarea
                            id="idea"
                            placeholder="Ej: Existe mucha basura en el patio de la escuela y los estudiantes no parecen preocupados por el medio ambiente."
                            className="resize-none h-32 text-base"
                            value={formData.idea}
                            onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="curso">Nivel / Curso</Label>
                            <Select
                                id="curso"
                                value={formData.curso}
                                onChange={(e) => setFormData({ ...formData, curso: e.target.value })}
                            >
                                {GRADES.map(grade => (
                                    <option key={grade} value={grade}>{grade}</option>
                                ))}
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duracion">Duración (semanas)</Label>
                            <Input
                                type="number"
                                id="duracion"
                                min="1"
                                max="40"
                                value={formData.duracion}
                                onChange={(e) => setFormData({ ...formData, duracion: parseInt(e.target.value) || 0 })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Asignaturas Involucradas</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {SUBJECTS.map((subject) => (
                                <div key={subject} className="flex items-center space-x-2 p-2 rounded-lg border border-transparent hover:bg-gray-50 transition-colors">
                                    <Checkbox
                                        id={`subject-${subject}`}
                                        checked={formData.subjects.includes(subject)}
                                        onChange={() => handleSubjectChange(subject)}
                                    />
                                    <Label htmlFor={`subject-${subject}`} className="cursor-pointer font-normal text-gray-600">
                                        {subject}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full text-lg py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg transform transition-all hover:scale-[1.01]"
                        isLoading={isLoading}
                        disabled={!formData.idea || formData.subjects.length === 0}
                    >
                        {isLoading ? "Diseñando tu proyecto..." : "Generar Planificación"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
