import React, { useState, useEffect } from 'react';
import { TitleSlide } from './slides/TitleSlide';
import { ChallengeSlide } from './slides/ChallengeSlide';
import { QuestionSlide } from './slides/QuestionSlide';
import { TimelineSlide } from './slides/TimelineSlide';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PresentationView({ data, onExit }) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const timelineSlides = (data.cronograma || []).map((phase, index) => ({
        id: `timeline-${index}`,
        component: <TimelineSlide phase={phase} index={index} total={(data.cronograma || []).length} />
    }));

    const slides = [
        { id: 'title', component: <TitleSlide data={data} /> },
        { id: 'challenge', component: <ChallengeSlide data={data} /> },
        { id: 'question', component: <QuestionSlide data={data} /> },
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
        <div className="fixed inset-0 z-50 bg-[#020617] overflow-hidden flex flex-col selection:bg-indigo-500/30">
            {/* Background Light Effects */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[150px] -mr-96 -mt-96 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] -ml-80 -mb-80 pointer-events-none" />

            {/* Top Bar (Exit only) */}
            {/* Navigation Controls */}
            <div className="fixed inset-0 pointer-events-none z-50">
                {/* Exit Button (Top Right) */}
                <div className="absolute top-6 right-6 flex pointer-events-auto">
                    <button
                        onClick={onExit}
                        className="p-3 md:p-4 rounded-xl transition-all duration-300 bg-white/0 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 group border border-transparent hover:border-rose-500/20"
                        title="Salir (Esc)"
                    >
                        <X className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                {/* Previous Button (Left) */}
                <div className="absolute left-0 top-0 bottom-0 w-24 md:w-32 flex items-center justify-center">
                    <button
                        onClick={prevSlide}
                        disabled={currentSlide === 0}
                        className={cn(
                            "pointer-events-auto p-4 md:p-6 rounded-full transition-all duration-500 group",
                            "bg-white/0 hover:bg-white/[0.03] active:scale-90",
                            currentSlide === 0 ? "opacity-0 invisible" : "opacity-40 hover:opacity-100"
                        )}
                        title="Anterior (←)"
                    >
                        <ArrowLeft className="w-8 h-8 md:w-10 md:h-10 text-white transition-transform group-hover:-translate-x-1" />
                    </button>
                </div>

                {/* Next Button (Right) */}
                <div className="absolute right-0 top-0 bottom-0 w-24 md:w-32 flex items-center justify-center">
                    <button
                        onClick={nextSlide}
                        disabled={currentSlide === slides.length - 1}
                        className={cn(
                            "pointer-events-auto p-4 md:p-6 rounded-full transition-all duration-500 group",
                            "bg-white/0 hover:bg-white/[0.03] active:scale-90",
                            currentSlide === slides.length - 1 ? "opacity-0 invisible" : "opacity-40 hover:opacity-100"
                        )}
                        title="Siguiente (→)"
                    >
                        <ArrowRight className="w-8 h-8 md:w-10 md:h-10 text-white transition-transform group-hover:translate-x-1" />
                    </button>
                </div>

                {/* Top Center Counter */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2">
                    <div className="px-5 py-2 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-md shadow-2xl flex items-center gap-3 select-none">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500/60">Slide</span>
                        <div className="h-3 w-[1px] bg-white/10" />
                        <span className="text-xs font-black text-indigo-400/90">
                            {currentSlide + 1} <span className="text-slate-600">/</span> {slides.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full h-full relative overflow-hidden pt-16 md:pt-20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            const swipeThreshold = 50;
                            if (info.offset.x > swipeThreshold) prevSlide();
                            else if (info.offset.x < -swipeThreshold) nextSlide();
                        }}
                        initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full h-full flex items-center justify-center p-4 md:p-8 touch-pan-y"
                    >
                        <div className="w-full max-w-6xl mx-auto flex items-center justify-center">
                            {slides[currentSlide].component}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
