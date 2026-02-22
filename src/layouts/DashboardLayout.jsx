import React, { useState } from 'react';
import { Sparkles, LayoutDashboard, Settings, LogOut, Menu, X, Presentation } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/supabaseClient';
import { ExportMenu } from '@/components/ExportMenu';

export function DashboardLayout({ children, currentView, onNavigate, user, projectData, onPresent }) {
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
        <div className="min-h-screen bg-background flex font-sans text-slate-50 selection:bg-indigo-500/30">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-50 md:hidden backdrop-blur-md animate-in fade-in duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar Drawer */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800/50 text-white shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 border-b border-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-indigo-600 to-blue-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Copiloto ABP</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white transition-colors">
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

                <div className="p-4 border-t border-slate-800/50 mt-auto">
                    <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-slate-900/50 rounded-xl border border-slate-800/50">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
                            {initial}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-slate-400 hover:text-white transition-all w-full px-4 py-3 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 group"
                    >
                        <LogOut className="h-5 w-5 group-hover:text-red-400 transition-colors" />
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Desktop Sidebar */}
            <aside className="w-64 bg-slate-950 border-r border-slate-800/50 text-white hidden md:flex flex-col fixed inset-y-0 z-50">
                <div className="p-6 border-b border-slate-800/50 flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Copiloto ABP</span>
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

                <div className="p-4 border-t border-slate-800/50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-slate-400 hover:text-white transition-all w-full px-4 py-3 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 group"
                    >
                        <LogOut className="h-5 w-5 group-hover:text-red-400 transition-colors" />
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>
                    <p className="text-[10px] text-slate-600 text-center mt-4 uppercase tracking-widest font-bold">Version 1.0.0</p>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                <header className="glass-header sticky top-0 z-40 h-16 flex items-center px-6 justify-between transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="md:hidden -ml-2">
                            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                                <Menu className="h-6 w-6 text-slate-400 hover:text-white transition-colors" />
                            </Button>
                        </div>

                        {currentView === 'results' && projectData && (
                            <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-500">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onPresent}
                                    className="h-9 w-9 rounded-xl border border-slate-800/50 bg-slate-900/40 hover:bg-slate-900 hover:border-indigo-500/30 text-indigo-400 transition-all group shadow-2xl"
                                    title="Modo Presentación"
                                >
                                    <Presentation className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                </Button>
                                <div className="h-4 w-px bg-slate-800/50 mx-1" />
                                <ExportMenu data={projectData} />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center ml-auto">
                        <div className="relative group cursor-pointer hidden md:block">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 ring-2 ring-indigo-500/20 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/10 select-none hover:scale-105 transition-transform duration-300">
                                {initial}
                            </div>

                            {/* Tooltip */}
                            <div className="absolute right-0 top-full mt-3 px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 translate-y-2 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-2xl">
                                {user?.email}
                                <div className="absolute right-3 bottom-full border-4 border-transparent border-b-slate-800"></div>
                            </div>
                        </div>
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
            className={`flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-300 group ${active
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100 hover:scale-[1.02] border border-transparent hover:border-slate-800/50'
                }`}
        >
            <span className={`transition-transform duration-300 group-hover:scale-110 ${active ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`}>
                {icon}
            </span>
            <span className="text-sm font-medium">{label}</span>
        </button>
    )
}

