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
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                <div className="text-center mb-8">
                    <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform rotate-3">
                        <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Copiloto ABP</h1>
                    <p className="text-slate-500 mt-2">Acceso exclusivo para docentes autorizados.</p>
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="docente@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg py-6"
                    >
                        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Iniciar Sesión'}
                    </Button>
                </form>

                <div className="mt-8 text-center bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-xs text-yellow-800">
                        Esta aplicación es de uso privado. Si necesitas acceso, por favor contacta al administrador.
                    </p>
                </div>
            </div>
        </div>
    );
}
