import { useState, useEffect } from 'react';
import {
  collection, query, where, onSnapshot,
  addDoc, orderBy, doc, deleteDoc
} from 'firebase/firestore';
import {
  signInWithPopup, GoogleAuthProvider,
  onAuthStateChanged, signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { db, auth } from '../firebase';
import { Project } from '../types';
import { toast } from 'sonner';
import { useTranslation } from '../contexts/LanguageContext';

const provider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  toast.error(`Firestore fejl (${operationType}): ${errInfo.error}`);
  return errInfo;
}

export interface UseProjectsReturn {
  user: FirebaseUser | null;
  projects: Project[];
  selectedProject: Project | null;
  searchQuery: string;
  isNewProjectModalOpen: boolean;
  newProjectName: string;
  connectionError: string | null;
  setSelectedProject: (project: Project | null) => void;
  setSearchQuery: (q: string) => void;
  setIsNewProjectModalOpen: (open: boolean) => void;
  setNewProjectName: (name: string) => void;
  createProject: () => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  handleLogin: () => void;
  handleLogout: () => void;
}

export function useProjects(): UseProjectsReturn {
  const { t } = useTranslation();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProjectState] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // Connection test
  useEffect(() => {
    import('firebase/firestore').then(({ getDocFromServer }) => {
      getDocFromServer(doc(db, 'test', 'connection')).catch((err) => {
        if (err instanceof Error && err.message.includes('offline')) {
          setConnectionError('Kunne ikke forbinde til databasen. Tjek venligst din konfiguration.');
        }
      });
    });
  }, []);

  // Projects real-time listener
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'projects'),
      where('ownerId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const p = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
        setProjects(p);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'projects')
    );
    return () => unsubscribe();
  }, [user]);

  // Restore last selected project from localStorage
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      const savedId = localStorage.getItem('selectedProjectId');
      const restored = projects.find((p) => p.id === savedId);
      setSelectedProjectState(restored || projects[0]);
    }
  }, [projects, selectedProject]);

  // Persist selection
  const setSelectedProject = (project: Project | null) => {
    setSelectedProjectState(project);
    if (project) localStorage.setItem('selectedProjectId', project.id);
  };

  const createProject = async () => {
    if (!user || !newProjectName.trim()) return;
    try {
      await addDoc(collection(db, 'projects'), {
        name: newProjectName.trim(),
        ownerId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setNewProjectName('');
      setIsNewProjectModalOpen(false);
      toast.success(`Projekt "${newProjectName.trim()}" oprettet!`);
    } catch (err) {
      const info = handleFirestoreError(err, OperationType.CREATE, 'projects');
      setConnectionError(`Kunne ikke oprette projekt: ${info.error}`);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'projects', projectId));
      
      // If the deleted project was selected, clear selection
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
        localStorage.removeItem('selectedProjectId');
      }
      
      toast.success(t('toasts.project_deleted') || 'Projekt slettet');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `projects/${projectId}`);
    }
  };

  const handleLogin = () => signInWithPopup(auth, provider);
  const handleLogout = () => signOut(auth);

  return {
    user,
    projects,
    selectedProject,
    searchQuery,
    isNewProjectModalOpen,
    newProjectName,
    connectionError,
    setSelectedProject,
    setSearchQuery,
    setIsNewProjectModalOpen,
    setNewProjectName,
    createProject,
    deleteProject,
    handleLogin,
    handleLogout,
  };
}
