import React, { useState } from 'react';
import { Sparkles, LayoutDashboard, Settings, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/supabaseClient'; // Import supabase

export function DashboardLayout({ children, currentView, onNavigate, user }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const handleNavigate = (view) => {
        onNavigate(view);
        setIsMobileMenuOpen(false);
    };

    const initial = user?.email ? user.email[0].toUpperCase() : 'U';

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 md:hidden backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar Drawer */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-indigo-600 p-2 rounded-lg">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Copiloto ABP</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <NavItem
                        icon={<LayoutDashboard className="h-5 w-5" />}
                        label="Mis Proyectos"
                        active={currentView === 'dashboard' || currentView === 'project'}
                        onClick={() => handleNavigate('dashboard')}
                    />
                    <NavItem
                        icon={<Sparkles className="h-5 w-5" />}
                        label="Nuevo Proyecto"
                        active={currentView === 'wizard'}
                        onClick={() => handleNavigate('wizard')}
                    />
                    <NavItem
                        icon={<Settings className="h-5 w-5" />}
                        label="Configuración"
                        active={currentView === 'settings'}
                        onClick={() => handleNavigate('settings')}
                    />
                </nav>

                <div className="p-4 border-t border-slate-800 mt-auto">
                    <div className="mb-4 flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                            {initial}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full px-4 py-3 rounded-lg hover:bg-slate-800 group"
                    >
                        <LogOut className="h-5 w-5 group-hover:text-red-400 transition-colors" />
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Desktop Sidebar */}
            <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col fixed inset-y-0 z-50 transition-all duration-300">
                <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">Copiloto ABP</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavItem
                        icon={<LayoutDashboard className="h-5 w-5" />}
                        label="Mis Proyectos"
                        active={currentView === 'dashboard' || currentView === 'project'}
                        onClick={() => onNavigate('dashboard')}
                    />
                    <NavItem
                        icon={<Sparkles className="h-5 w-5" />}
                        label="Nuevo Proyecto"
                        active={currentView === 'wizard'}
                        onClick={() => onNavigate('wizard')}
                    />
                    <NavItem
                        icon={<Settings className="h-5 w-5" />}
                        label="Configuración"
                        active={currentView === 'settings'}
                        onClick={() => onNavigate('settings')}
                    />
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full px-4 py-3 rounded-lg hover:bg-slate-800 group"
                    >
                        <LogOut className="h-5 w-5 group-hover:text-red-400 transition-colors" />
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>
                    <p className="text-xs text-slate-500 text-center mt-4">Version 1.0.0 (Local)</p>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all duration-300">
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 h-16 flex items-center px-6 justify-between">
                    <div className="md:hidden -ml-2">
                        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu className="h-6 w-6 text-slate-600" />
                        </Button>
                    </div>
                    <div className="flex items-center ml-auto space-x-4">
                        <div className="relative group cursor-pointer hidden md:block">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 ring-2 ring-offset-2 ring-indigo-500/20 flex items-center justify-center text-white font-bold text-sm shadow-sm select-none">
                                {initial}
                            </div>

                            {/* Tooltip */}
                            <div className="absolute right-0 top-full mt-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                                {user?.email}
                                <div className="absolute right-3 bottom-full border-4 border-transparent border-b-slate-800"></div>
                            </div>
                        </div>
                        {/* Mobile User Avatar is in Sidebar */}
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}

function NavItem({ icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 ${active
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
        >
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </button>
    )
}
