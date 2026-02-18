import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { AuthView } from '@/features/auth/AuthView'
import { ProjectWizard } from '@/features/wizard/ProjectWizard'
import { ProjectDashboard } from '@/features/dashboard/ProjectDashboard'
import { ProjectList } from '@/features/dashboard/ProjectList'
import { SettingsView } from '@/features/settings/SettingsView'
import { PresentationView } from '@/features/presentation/PresentationView'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { Toaster, toast } from 'sonner'
import { db } from './db'
import { generateUUID } from '@/utils/uuid'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'

function App() {
  const [session, setSession] = useState(null);
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'wizard' | 'results' | 'settings'
  const [data, setData] = useState(null);
  const [wizardInitialData, setWizardInitialData] = useState(null); // Data for editing
  const [isFreshProject, setIsFreshProject] = useState(false); // Flag to control "Refine" availability
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Single Session Enforcement
  useEffect(() => {
    if (!session?.user) return;

    const mySessionId = generateUUID();
    let channel;

    const enforceSingleSession = async () => {
      // 1. Registrar mi ID de sesión en la base de datos
      await supabase
        .from('profiles')
        .update({ active_session_id: mySessionId })
        .eq('id', session.user.id);

      // 2. Escuchar cambios en mi perfil
      channel = supabase
        .channel(`public:profiles:${session.user.id}`)
        .on('postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${session.user.id}`
          },
          (payload) => {
            const newSessionId = payload.new.active_session_id;
            if (newSessionId && newSessionId !== mySessionId) {
              toast.error('Se ha iniciado sesión en otro dispositivo. Cerrando sesión...', { duration: 5000 });
              supabase.auth.signOut();
            }
          }
        )
        .subscribe();
    };

    enforceSingleSession();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [session]);

  // New handler: Receives already parsed data from ProjectWizard (Manual Bridge)
  const handleWizardSubmit = async (parsedData) => {
    setIsLoading(true);
    try {
      let finalData = { ...parsedData };

      // Check for default school if missing
      if (!finalData.nombre_colegio) {
        const settings = await db.settings.get('defaultSchool');
        if (settings?.value) {
          finalData.nombre_colegio = settings.value;
        }
      }

      // Save to DB immediately
      let savedProject;

      // If it has an ID, it's an update (refining)
      if (finalData.id) {
        await db.projects.update(finalData.id, finalData);
        savedProject = finalData;
        toast.success('¡Proyecto actualizado y refinado!');
      } else {
        // It's a new project
        const id = await db.projects.add({
          ...finalData,
          timestamp: new Date()
        });
        savedProject = { ...finalData, id };
        toast.success('¡Proyecto guardado y materializado!');
      }

      setData(savedProject);
      setWizardInitialData(null); // Clear editing data on success
      setIsFreshProject(true); // Allow refining because it's just created/updated
      setView('results');
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar el proyecto.');
      // Still show it even if save failed
      setData(parsedData);
      setView('results');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenProject = (project) => {
    setData(project);
    setWizardInitialData(null);
    setIsFreshProject(false); // Disable refining for historical projects
    setView('results');
  };

  const handleRefineProject = () => {
    if (data) {
      setWizardInitialData(data);
      setView('wizard');
    }
  };

  const handleUpdateProject = async (newData) => {
    setData(newData); // Update local state immediately for UI responsiveness
    if (newData.id) {
      try {
        await db.projects.update(newData.id, newData);
        // Silent update or minimal toast? Let's keep it silent for now to avoid spam
      } catch (error) {
        console.error("Failed to auto-save", error);
        toast.error("Error al guardar cambios automáticamente");
      }
    }
  };

  const handleReset = () => {
    setView('dashboard');
    setData(null);
    setWizardInitialData(null);
  };


  if (!session) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <AuthView />
      </>
    )
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      <DashboardLayout currentView={view} onNavigate={setView} user={session?.user}>
        {view === 'dashboard' && (
          <ProjectList
            onNewProject={() => {
              setWizardInitialData(null);
              setView('wizard');
            }}
            onOpenProject={handleOpenProject}
          />
        )}

        {view === 'settings' && (
          <SettingsView />
        )}

        {view === 'wizard' && (
          <div className="py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Crear Nuevo Proyecto ABP</h1>
              <p className="text-lg text-slate-500">Diseña experiencias de aprendizaje inolvidables con tu IA favorita.</p>
            </div>
            {/* We pass handleWizardSubmit directly */}
            <ProjectWizard
              onSubmit={handleWizardSubmit}
              isLoading={isLoading}
              initialData={wizardInitialData}
            />
          </div>
        )}

        {view === 'results' && (
          <ProjectDashboard
            data={data}
            onUpdateProject={handleUpdateProject}
            onReset={handleReset}
            onPresent={() => setView('presentation')}
            onRefine={handleRefineProject}
            isFreshProject={isFreshProject}
          />
        )}

        {view === 'presentation' && (
          <PresentationView
            data={data}
            onExit={() => setView('results')}
          />
        )}
      </DashboardLayout>
    </>
  )
}

export default App
