import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import { Link } from 'react-router-dom';
import Toast from '../components/ui/Toast';
import { Button } from "../components/ui/button";
import { Package } from "lucide-react";

const notifyCustomer = async ({ project, nextIndex }) => {
  try {
    if (!project?.id || !project.email) {
      console.warn('Project ID or email missing, cannot create inbox message.');
      return;
    }
    const isComplete = nextIndex >= project.selectedSteps.length;
    const currentStep = isComplete ? "Complete" : project.selectedSteps[nextIndex];
    const adminEmail = 'admin@irongraad.com';
    const contactEmailPair = [adminEmail, project.email].sort();
    const messageText = isComplete
      ? `✅ Project marked as complete.`
      : `📦 Project advanced to step: "${currentStep}"`;
    await addDoc(collection(db, 'messages'), {
      from: adminEmail,
      to: project.email,
      text: messageText,
      timestamp: serverTimestamp(),
      read: true, 
      source: project.contactMethod || 'email', 
      projectId: project.id,
      type: 'project_update',
      contactEmailPair
    });
    console.log('Inbox message created for project update with contactEmailPair.');
    if (project.email || project.phone) {
      const response = await fetch('/api/sendNotification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: project.name,
          email: project.email,
          phone: project.phone,
          currentStep,
          trackingLinkId: project.trackingLinkId,
          isComplete
        })
      });
      if (!response.ok) {
        throw new Error('Failed to send notification via API');
      }
      console.log('Notification API call successful.');
    }
  } catch (err) {
    console.error("❌ Notification error in notifyCustomer:", err.message);
  }
};

export default function ActiveProjects() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [search, setSearch] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [toast, setToast] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'inProgress', 'complete'

  const getDemoStartTime = () => {
    const stored = localStorage.getItem('demoStartTime');
    if (!stored) {
      const now = new Date().toISOString();
      localStorage.setItem('demoStartTime', now);
      return now;
    }
    return stored;
  };
  const demoStartTime = getDemoStartTime();

  useEffect(() => {
    const fetchProjects = async () => {
      const querySnapshot = await getDocs(collection(db, 'projects'));
      const data = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
        currentStepIndex: docSnap.data().currentStepIndex ?? 0,
      }));
      setProjects(data);
      if (selectedProjectId) {
        const selectedProject = data.find(p => p.id === selectedProjectId);
        setInternalNotes(selectedProject?.internalNotes || '');
      }
    };
    fetchProjects();
  }, [selectedProjectId]);

  const filtered = projects.filter(p => {
    const matchesSearch = (
      (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.fixType || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.trackingLinkId || '').toLowerCase().includes(search.toLowerCase())
    );
    const isNewProject = p.createdAt > demoStartTime; 
    
    const projectIsComplete = (p.currentStepIndex ?? 0) >= (p.selectedSteps?.length || 0);
    let matchesStatus = true;
    if (statusFilter === 'inProgress') {
      matchesStatus = !projectIsComplete;
    } else if (statusFilter === 'complete') {
      matchesStatus = projectIsComplete;
    }
    
    return matchesSearch && isNewProject && matchesStatus;
  });

  const selected = projects.find(p => p.id === selectedProjectId);
  const currentStepName = selected?.selectedSteps?.[selected.currentStepIndex] ?? '✅ Complete';
  const isComplete = selected?.currentStepIndex >= selected?.selectedSteps?.length;

  const handleSaveNotes = async () => {
    if (!selected) return;
    try {
      await updateDoc(doc(db, 'projects', selected.id), { internalNotes });
      // Optimistically update local state if needed, or rely on next fetch
      setProjects(prev => 
        prev.map(p => p.id === selected.id ? { ...p, internalNotes } : p)
      );
      setToast("Notes saved successfully.");
    } catch (error) {
      console.error("Error saving notes:", error);
      setToast("Failed to save notes.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#2e0e17] to-[#3a0d0d] text-white">
      <div className="w-1/3 border-r border-gray-700 p-6 overflow-y-auto flex flex-col">
        <div className="mb-8 shrink-0">
          <div className="flex items-center gap-4 mb-4">
            <Sheet>
              <SheetTrigger asChild>
                <Menu className="w-8 h-8 cursor-pointer text-gray-600 hover:text-gray-900 transition-colors" />
              </SheetTrigger>
              <SheetContent side="left" className="bg-white text-gray-900 w-64 p-6 h-full border-r border-gray-200">
                <DialogTitle className="sr-only">Main Navigation</DialogTitle>
                <DialogDescription className="sr-only">Primary navigation menu for the application.</DialogDescription>
                <ul className="space-y-4 text-2xl font-large">
                  <li><Link to="/dashboard" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-lg transition-colors">Dashboard</Link></li>
                  <li><Link to="/activeprojects" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-lg transition-colors">Active Projects</Link></li>
                  <li><Link to="/newproject" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-lg transition-colors">New Project</Link></li>
                  <li><Link to="/calendar" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-lg transition-colors">Calendar</Link></li>
                  <li><Link to="/inbox" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-lg transition-colors">Inbox</Link></li>
                </ul>
              </SheetContent>
            </Sheet>
            <h2 className="text-5xl font-extrabold tracking-wide">
              <Link to="/" className="hover:underline">Projects</Link>
            </h2>
          </div>
          <input
            type="text"
            placeholder="Search by name or type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full p-2 mb-4 text-lg rounded bg-gray-800 text-white"
          />
          <div className="flex gap-2 mb-4">
            <Button
              variant={statusFilter === 'all' ? "default" : "outline"}
              onClick={() => setStatusFilter('all')}
              className={`${statusFilter === 'all' ? 'bg-blue-500 text-white' : 'text-black border-gray-600 hover:bg-gray-700 hover:text-white'} transition-colors duration-150`}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'inProgress' ? "default" : "outline"}
              onClick={() => setStatusFilter('inProgress')}
              className={`${statusFilter === 'inProgress' ? 'bg-blue-500 text-white' : 'text-black border-gray-600 hover:bg-gray-700 hover:text-white'} transition-colors duration-150`}
            >
              In Progress
            </Button>
            <Button
              variant={statusFilter === 'complete' ? "default" : "outline"}
              onClick={() => setStatusFilter('complete')}
              className={`${statusFilter === 'complete' ? 'bg-blue-500 text-white' : 'text-black border-gray-600 hover:bg-gray-700 hover:text-white'} transition-colors duration-150`}
            >
              Complete
            </Button>
          </div>
        </div>

        <ul className="space-y-2 flex-1 overflow-y-auto pr-2">
          {filtered.map(project => (
            <li
              key={project.id}
              onClick={() => setSelectedProjectId(project.id)}
              className={`cursor-pointer p-3 rounded transition relative ${
                selectedProjectId === project.id ? 'bg-[#3a0d0d]' : 'hover:bg-[#4d1c1c]'
              }`}
            >
              <p className="font-semibold text-2xl">{project.name}</p>
              <p className="text-xl text-gray-400">{project.projectType}</p>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="text-center text-gray-400 py-4">No projects match your current filters.</li>
          )}
        </ul>
      </div>

      <div className="w-2/3 p-8 text-base md:text-lg leading-relaxed overflow-y-auto">
        {selected ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-1">{selected.name}</h2>
              <p className="text-sm text-gray-400">{selected.email} {selected.phone && `| ${selected.phone}`}</p>
              <p className="text-sm italic text-gray-500">Preferred Contact: {selected.contactMethod?.toUpperCase()}</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">Project Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
                <div><strong className="text-gray-300">Fix Type:</strong> {selected.fixType}</div>
                <div><strong className="text-gray-300">Project Type:</strong> {selected.projectType}</div>
                <div><strong className="text-gray-300">Tracking ID:</strong> 
                  <a href={`/track/${selected.trackingLinkId}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1">
                    {selected.trackingLinkId}
                  </a>
                </div>
                <div><strong className="text-gray-300">Current Step:</strong> {currentStepName}</div>
                {!isComplete && selected.selectedSteps && selected.currentStepIndex + 1 < selected.selectedSteps.length && (
                  <div><strong className="text-gray-300">Next Step:</strong> {selected.selectedSteps[selected.currentStepIndex + 1]}</div>
                )}
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                {!isComplete && selected.currentStepIndex > 0 && (
                  <Button
                    onClick={async () => {
                      const prevIndex = selected.currentStepIndex - 1;
                      await updateDoc(doc(db, 'projects', selected.id), { currentStepIndex: prevIndex });
                      setProjects(prev =>
                        prev.map(p => p.id === selected.id ? { ...p, currentStepIndex: prevIndex } : p)
                      );
                      setToast("Step moved back.");
                    }}
                    variant="outline"
                    className="bg-yellow-600 hover:bg-yellow-700 border-yellow-700 text-white px-4 py-2 text-sm"
                  >
                    Go Back
                  </Button>
                )}
                {!isComplete && (
                  <Button
                    onClick={async () => {
                      try {
                        const nextIndex = selected.currentStepIndex + 1;
                        await updateDoc(doc(db, 'projects', selected.id), { currentStepIndex: nextIndex });
                        setProjects(prev =>
                          prev.map(p => p.id === selected.id ? { ...p, currentStepIndex: nextIndex } : p)
                        );
                        await notifyCustomer({ project: selected, nextIndex });
                        setToast("✅ Project advanced & notified");
                      } catch (error) {
                        console.error('Error advancing project:', error);
                        setToast("Project advanced, notification failed");
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm"
                  >
                    Advance Step
                  </Button>
                )}
                {!isComplete && (
                  <Button
                    onClick={async () => {
                      try {
                        const completeIndex = selected.selectedSteps.length;
                        await updateDoc(doc(db, 'projects', selected.id), { currentStepIndex: completeIndex });
                        setProjects(prev =>
                          prev.map(p => p.id === selected.id ? { ...p, currentStepIndex: completeIndex } : p)
                        );
                        await notifyCustomer({ project: selected, nextIndex: completeIndex });
                        setToast("✅ Project marked complete & notified");
                      } catch (error) {
                        console.error('Error completing project:', error);
                        setToast("Project completed, notification failed");
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
                  >
                    Mark Complete
                  </Button>
                )}
                {isComplete && (
                  <p className="text-green-400 font-semibold text-sm">Project is Complete!</p>
                )}
              </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-white mb-3">Project Communication</h3>
              <Link 
                to={`/inbox?projectId=${selected.id}`}
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-md gap-2"
              >
                Open Project Inbox
              </Link>
              <p className="text-sm text-gray-400 mt-2">
                View and send messages related to this project in the inbox.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-white mb-3">Internal Notes</h3>
              <textarea
                rows={5}
                placeholder="Enter internal notes here..."
                value={internalNotes}
                onChange={e => setInternalNotes(e.target.value)}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="mt-3 text-right">
                <Button
                  onClick={handleSaveNotes}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-md"
                >
                  Save Notes
                </Button>
              </div>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Package className="w-16 h-16 mb-4 text-gray-500" />
            <p className="text-xl">Select a project to view details.</p>
          </div>
        )}
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}