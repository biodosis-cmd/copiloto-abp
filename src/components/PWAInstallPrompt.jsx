import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstall, setShowInstall] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Detect iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        setIsIOS(isIosDevice);

        const handler = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setShowInstall(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setShowInstall(false);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            toast.success('¡Gracias por instalar Copiloto ABP!');
        }

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setShowInstall(false);
    };

    const closePrompt = () => {
        setShowInstall(false);
    };

    if (!showInstall && !isIOS) return null;
    // Note: For this MVP, we only show the prompt if the event fires (Android/Desktop)
    // or if we want to show a manual "How to install on iOS" hint.
    // We'll stick to the event-based one for now to be less intrusive, 
    // but if you want to see the iOS hint, we can enable it.

    if (!showInstall) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white p-4 rounded-xl shadow-2xl border border-indigo-100 z-50 animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="bg-indigo-100 p-1.5 rounded-lg text-indigo-600">
                        <Download className="w-4 h-4" />
                    </span>
                    Instalar Aplicación
                </h3>
                <button onClick={closePrompt} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <p className="text-sm text-slate-600 mb-4">
                Instala Copiloto ABP para un acceso más rápido y mejor experiencia a pantalla completa.
            </p>

            <Button onClick={handleInstallClick} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                Instalar ahora
            </Button>
        </div>
    );
}
