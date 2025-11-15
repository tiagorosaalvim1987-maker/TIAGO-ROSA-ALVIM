
import React, { useState, useCallback, useMemo } from 'react';
import type { Page, Funcionario, ART, ArtEmergencial, Checklist, ArtAtividade, MatrizBloqueio } from './types';
import { Dashboard, EmployeeManagement, ArtManagement, ArtEmergencialForm, ArtAtividadeForm, ChecklistForm, LockoutMatrixForm, DocumentManagement } from './forms';
import { MenuIcon, XIcon } from './components';

// useLocalStorage Hook
function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Global State Management using useLocalStorage
  const [funcionarios, setFuncionarios] = useLocalStorage<Funcionario[]>('funcionarios', []);
  const [arts, setArts] = useLocalStorage<ART[]>('arts', []); // ARTs stored as PDFs
  const [artEmergenciais, setArtEmergenciais] = useLocalStorage<ArtEmergencial[]>('artEmergenciais', []);
  const [checklists, setChecklists] = useLocalStorage<Checklist[]>('checklists', []);
  const [artAtividades, setArtAtividades] = useLocalStorage<ArtAtividade[]>('artAtividades', []);
  const [matrizesBloqueio, setMatrizesBloqueio] = useLocalStorage<MatrizBloqueio[]>('matrizesBloqueio', []);

  // State to manage editing specific documents from DocumentManagement
  const [editingArtEmergencialId, setEditingArtEmergencialId] = useState<string | null>(null);
  const [editingArtAtividadeId, setEditingArtAtividadeId] = useState<string | null>(null);
  const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null);
  const [editingMatrizBloqueioId, setEditingMatrizBloqueioId] = useState<string | null>(null);


  const handleSetPage = (newPage: Page) => {
    setPage(newPage);
    setSidebarOpen(false);
  }

  const PageContent = useMemo(() => {
    switch (page) {
      case 'dashboard':
        return <Dashboard setPage={handleSetPage} />;
      case 'cadastrar-art':
        return <ArtManagement arts={arts} setArts={setArts} />;
      case 'cadastrar-funcionario':
        return <EmployeeManagement funcionarios={funcionarios} setFuncionarios={setFuncionarios} />;
      case 'art-emergencial':
        return <ArtEmergencialForm 
                  funcionarios={funcionarios} 
                  savedArts={artEmergenciais} 
                  setSavedArts={setArtEmergenciais}
                  editingId={editingArtEmergencialId}
                  setEditingId={setEditingArtEmergencialId}
                  setPage={handleSetPage} // Pass setPage to allow form to navigate back or to doc management
                  />;
      case 'art-atividade':
        return <ArtAtividadeForm 
                  funcionarios={funcionarios} 
                  arts={arts} // Pass the 'arts' (registered PDFs) here
                  savedData={artAtividades} 
                  setSavedData={setArtAtividades}
                  editingId={editingArtAtividadeId}
                  setEditingId={setEditingArtAtividadeId}
                  setPage={handleSetPage}
                  />;
      case 'check-list':
        return <ChecklistForm 
                  funcionarios={funcionarios} 
                  savedChecklists={checklists}
                  setSavedChecklists={setChecklists}
                  editingId={editingChecklistId}
                  setEditingId={setEditingChecklistId}
                  setPage={handleSetPage}
                  />;
      case 'matriz-de-bloqueio':
        return <LockoutMatrixForm 
                  funcionarios={funcionarios}
                  savedData={matrizesBloqueio}
                  setSavedData={setMatrizesBloqueio}
                  editingId={editingMatrizBloqueioId}
                  setEditingId={setEditingMatrizBloqueioId}
                  setPage={handleSetPage}
                  />;
      case 'document-management':
        return <DocumentManagement
                  artEmergenciais={artEmergenciais}
                  setArtEmergenciais={setArtEmergenciais}
                  artAtividades={artAtividades}
                  setArtAtividades={setArtAtividades}
                  checklists={checklists}
                  setChecklists={setChecklists}
                  matrizesBloqueio={matrizesBloqueio}
                  setMatrizesBloqueio={setMatrizesBloqueio}
                  setPage={handleSetPage}
                  setEditingArtEmergencialId={setEditingArtEmergencialId}
                  setEditingArtAtividadeId={setEditingArtAtividadeId}
                  setEditingChecklistId={setEditingChecklistId}
                  setEditingMatrizBloqueioId={setEditingMatrizBloqueioId}
                  funcionarios={funcionarios} // Pass for ArtEmergencialViewModal
                  arts={arts} // Pass for ArtAtividadeForm for linked ARTs
                  editingArtEmergencialId={editingArtEmergencialId} // Pass read-only ID
                  editingArtAtividadeId={editingArtAtividadeId}   // Pass read-only ID
                  editingChecklistId={editingChecklistId}         // Pass read-only ID
                  editingMatrizBloqueioId={editingMatrizBloqueioId} // Pass read-only ID
                />
      default:
        return <Dashboard setPage={handleSetPage}/>;
    }
  }, [
    page, 
    funcionarios, setFuncionarios, 
    arts, setArts, 
    artEmergenciais, setArtEmergenciais, editingArtEmergencialId, setEditingArtEmergencialId,
    checklists, setChecklists, editingChecklistId, setEditingChecklistId,
    artAtividades, setArtAtividades, editingArtAtividadeId, setEditingArtAtividadeId,
    matrizesBloqueio, setMatrizesBloqueio, editingMatrizBloqueioId, setEditingMatrizBloqueioId
  ]);

  const menuItems: { id: Page; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'cadastrar-art', label: 'Cadastrar ART' },
    { id: 'cadastrar-funcionario', label: 'Cadastrar Funcionário' },
    { id: 'art-emergencial', label: 'ART Emergencial' },
    { id: 'art-atividade', label: 'ART da Atividade' },
    { id: 'check-list', label: 'Check List' },
    { id: 'matriz-de-bloqueio', label: 'Matriz de Bloqueio' },
    { id: 'document-management', label: 'Gerenciamento de Documentos' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center p-4 bg-gray-800 text-white w-full fixed top-0 z-20">
        <h1 className="text-xl font-bold">ART</h1>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <XIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`bg-gray-800 text-white w-64 min-h-screen p-4 fixed md:relative transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out z-10 md:pt-4 pt-20`}>
        <div className="flex items-center mb-8">
            <div className="bg-yellow-400 p-2 rounded-md mr-3">
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <h1 className="text-2xl font-bold text-white">ART</h1>
        </div>
        <nav>
          <ul>
            {menuItems.map(item => (
              <li key={item.id} className="mb-2">
                <button
                  onClick={() => handleSetPage(item.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${page === item.id ? 'bg-yellow-400 text-gray-900' : 'hover:bg-gray-700'}`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto mt-16 md:mt-0">
        {PageContent}
      </main>
    </div>
  );
};

export default App;
