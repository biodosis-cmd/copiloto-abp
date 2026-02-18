import React, { useState, useEffect } from 'react';
import { TitleSlide } from './slides/TitleSlide';
import { ProblemSlide } from './slides/ProblemSlide';
import { TimelineSlide } from './slides/TimelineSlide';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

export function PresentationView({ data, onExit }) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const timelineSlides = (data.cronograma || []).map((phase, index) => ({
        id: `timeline-${index}`,
        component: <TimelineSlide phase={phase} index={index} total={(data.cronograma || []).length} />
    }));

    const slides = [
        { id: 'title', component: <TitleSlide data={data} /> },
        { id: 'problem', component: <ProblemSlide data={data} /> },
        ...timelineSlides
    ];

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) setCurrentSlide(curr => curr + 1);
    };

    const prevSlide = () => {
        if (currentSlide > 0) setCurrentSlide(curr => curr - 1);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'Escape') onExit();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentSlide, onExit]);

    return (
        <div className="fixed inset-0 z-50 bg-slate-50 overflow-hidden flex flex-col">
            {/* Top Bar (Controls) */}
            <div className="absolute top-0 w-full p-6 flex justify-between items-center z-50 pointer-events-none">
                <div className="pointer-events-auto">
                    <button
                        onClick={onExit}
                        className="p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:bg-rose-50 hover:text-rose-600 transition-all group"
                        title="Salir del modo presentación (Esc)"
                    >
                        <X className="w-6 h-6 text-slate-500 group-hover:text-rose-600" />
                    </button>
                </div>

                <div className="pointer-events-auto flex items-center gap-4 bg-white/80 backdrop-blur-md px-6 py-2 rounded-full shadow-lg">
                    <button
                        onClick={prevSlide}
                        disabled={currentSlide === 0}
                        className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-700" />
                    </button>
                    <span className="text-sm font-bold text-slate-400">
                        {currentSlide + 1} / {slides.length}
                    </span>
                    <button
                        onClick={nextSlide}
                        disabled={currentSlide === slides.length - 1}
                        className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                        <ArrowRight className="w-5 h-5 text-slate-700" />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full h-full relative overflow-y-auto scrollbar-hide">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full"
                    >
                        {slides[currentSlide].component}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
