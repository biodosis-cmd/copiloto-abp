import React, { useState } from 'react';
import { supabase } from '@/supabaseClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function AuthView({ onLoginSuccess }) {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
        } catch (error) {
            console.error(error);
            toast.error('Credenciales incorrectas o acceso denegado.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 selection:bg-indigo-500/30">
            <div className="w-full max-w-md card-glass rounded-3xl p-10 border border-slate-700/50 shadow-2xl relative overflow-hidden group">
                {/* Background Decoration */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/20 transition-colors duration-700"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-colors duration-700"></div>

                <div className="text-center mb-10 relative z-10">
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/20 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                        <Sparkles className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400 tracking-tight">
                        Copiloto ABP
                    </h1>
                    <p className="text-slate-400 mt-3 font-medium">Docentes Autorizados</p>
                </div>

                <form onSubmit={handleAuth} className="space-y-6 relative z-10">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-300 ml-1 font-semibold text-xs uppercase tracking-wider">Correo Electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="docente@agendai.cl"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-slate-950/50 border-slate-700/50 focus:border-indigo-500/50 focus:ring-indigo-500/20 rounded-xl transition-all h-12"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-300 ml-1 font-semibold text-xs uppercase tracking-wider">Contraseña</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-slate-950/50 border-slate-700/50 focus:border-indigo-500/50 focus:ring-indigo-500/20 rounded-xl transition-all h-12"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full text-lg py-7 rounded-2xl font-bold tracking-wide mt-4"
                        variant="primary"
                    >
                        {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Iniciar Sesión'}
                    </Button>
                </form>

                <div className="mt-10 text-center bg-slate-950/40 p-5 rounded-2xl border border-slate-800/50 relative z-10 backdrop-blur-sm">
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        Esta aplicación es de uso privado. <br />
                        Si necesitas acceso, contacta al administrador.
                    </p>
                </div>
            </div>
            <p className="mt-8 text-slate-600 text-[10px] uppercase tracking-[0.2em] font-bold">Powered by Advanced Agentic AI</p>
        </div>
    );
}

