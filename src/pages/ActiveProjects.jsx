import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { DialogTitle } from '@radix-ui/react-dialog';
import { Link } from 'react-router-dom';
import Toast from '../components/ui/Toast';

/**
 * Sends a notification to the customer about their project's status update
 * @param {Object} params - The parameters object
 * @param {Object} params.project - The project object containing customer and project details
 * @param {number} params.nextIndex - The index of the next step in the project
 * @returns {Promise<void>}
 */
const notifyCustomer = async ({ project, nextIndex }) => {
  try {
    if (!project?.id) return;

    const payload = {
      name: project.name,
      email: project.email,
      phone: project.phone,
      contactMethod: project.contactMethod,
      currentStep: project.selectedSteps[nextIndex],
      trackingLinkId: project.trackingLinkId,
      isComplete: false,
      projectId: project.id,
    };

    const res = await fetch("https://irongraad.vercel.app/api/sendNotification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || "Notification failed");
    }
  } catch (err) {
    console.error("❌ Notification error:", err.message);
  }
};

/**
 * ActiveProjects component displays and manages all active projects
 * Features include:
 * - Project listing and filtering
 * - Project details view
 * - Step progression management
 * - Internal notes management
 * - Customer notification system
 * 
 * @returns {JSX.Element} The ActiveProjects component
 */
export default function ActiveProjects() {
  // State for managing the list of all projects
  const [projects, setProjects] = useState([]);
  // State for tracking which project is currently selected
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  // State for filtering projects by search term
  const [search, setSearch] = useState('');
  // State for managing internal notes for the selected project
  const [internalNotes, setInternalNotes] = useState('');
  // State for managing toast notifications
  const [toast, setToast] = useState(null);

  /**
   * Fetches all projects from Firestore and updates the local state
   * Also updates internal notes if a project is selected
   */
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
        const selected = data.find(p => p.id === selectedProjectId);
        setInternalNotes(selected?.internalNotes || '');
      }
    };
    fetchProjects();
  }, [selectedProjectId]);

  /**
   * Filters projects based on the search term
   * Matches against project name, fix type, and tracking ID
   */
  const filtered = projects.filter(p =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.fixType || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.trackingLinkId || '').toLowerCase().includes(search.toLowerCase())
  );

  /**
   * Currently selected project and its current step information
   */
  const selected = projects.find(p => p.id === selectedProjectId);
  const currentStep = selected?.selectedSteps?.[selected.currentStepIndex] ?? '✅ Complete';
  const isComplete = selected?.currentStepIndex >= selected?.selectedSteps?.length;

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#2e0e17] to-[#3a0d0d] text-white">
      <div className="w-1/3 border-r border-gray-700 p-6 overflow-y-auto">
        <div className="flex items-center gap-4 mb-8">
          <Sheet>
            <SheetTrigger>
              <Menu className="w-8 h-8 cursor-pointer" />
            </SheetTrigger>
            <SheetContent side="left" className="bg-gray-800 text-black w-64 p-6 h-full">
              <DialogTitle className="text-xl font-bold mb-2">Navigation</DialogTitle>
              <ul className="space-y-4 text-2xl font-large">
                <li><Link to="/activeprojects" className="hover:underline">Active Projects</Link></li>
                <li><Link to="/newproject" className="hover:underline">New Project</Link></li>
                <li><Link to="/calendar" className="hover:underline">Calendar</Link></li>
                <li><Link to="/track" className="hover:underline">Customer Tracking</Link></li>
                <li><Link to="/inbox" className="hover:underline">Inbox</Link></li>
              </ul>
            </SheetContent>
          </Sheet>

          <h2 className="text-5xl font-extrabold tracking-wide">Projects</h2>
        </div>

        <input
          type="text"
          placeholder="Search by name or type..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full p-2 mb-4 text-lg rounded bg-gray-800 text-white"
        />

        <ul className="space-y-2">
          {filtered.map(project => (
            <li
              key={project.id}
              onClick={() => setSelectedProjectId(project.id)}
              className={`cursor-pointer p-3 rounded transition ${
                selectedProjectId === project.id ? 'bg-[#3a0d0d]' : 'hover:bg-[#4d1c1c]'
              }`}
            >
              <p className="font-semibold text-2xl">{project.name}</p>
              <p className="text-xl text-gray-400">{project.projectType}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="w-2/3 p-8 text-base md:text-lg leading-relaxed">
        {selected ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{selected.name}</h2>
              <p className="text-sm">📧 {selected.email} | 📞 {selected.phone}</p>
              <p className="text-sm italic text-gray-400">Preferred: {selected.contactMethod?.toUpperCase()}</p>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg mb-4">
              <p><strong>Fix Type:</strong> {selected.fixType}</p>
              <p><strong>Project Type:</strong> {selected.projectType}</p>
              <p><strong>Tracking ID:</strong> {selected.trackingLinkId}</p>
              <p><strong>Current Step:</strong> {currentStep}</p>
              {!isComplete && (
                <p><strong>Next Step:</strong> {selected.selectedSteps?.[selected.currentStepIndex + 1]}</p>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              {!isComplete && selected.currentStepIndex > 0 && (
                <button
                  onClick={async () => {
                    /**
                     * Moves the project back one step and updates Firestore
                     * Updates local state and shows confirmation toast
                     */
                    const prevIndex = selected.currentStepIndex - 1;
                    await updateDoc(doc(db, 'projects', selected.id), { currentStepIndex: prevIndex });
                    setProjects(prev =>
                      prev.map(p => p.id === selected.id ? { ...p, currentStepIndex: prevIndex } : p)
                    );
                    setToast("Step moved back.");
                  }}
                  className="bg-yellow-700 hover:bg-yellow-800 text-white font-semibold px-4 py-2 rounded"
                >
                  Go Back to Previous Step
                </button>
              )}

              {!isComplete && (
                <button
                  onClick={async () => {
                    /**
                     * Advances the project to the next step
                     * Updates Firestore, sends customer notification, and shows confirmation toast
                     */
                    const nextIndex = selected.currentStepIndex + 1;
                    await updateDoc(doc(db, 'projects', selected.id), { currentStepIndex: nextIndex });
                    setProjects(prev =>
                      prev.map(p => p.id === selected.id ? { ...p, currentStepIndex: nextIndex } : p)
                    );
                    await notifyCustomer({ project: selected, nextIndex });
                    setToast("Advanced to next step.");
                  }}
                  className="bg-green-700 hover:bg-green-800 text-white font-semibold px-4 py-2 rounded"
                >
                  Advance to Next Step
                </button>
              )}

              {!isComplete && (
                <button
                  onClick={async () => {
                    /**
                     * Marks the project as complete
                     * Updates Firestore, sends final notification, and shows confirmation toast
                     */
                    const completeIndex = selected.selectedSteps.length;
                    await updateDoc(doc(db, 'projects', selected.id), { currentStepIndex: completeIndex });
                    setProjects(prev =>
                      prev.map(p => p.id === selected.id ? { ...p, currentStepIndex: completeIndex } : p)
                    );
                    await notifyCustomer({ project: selected, nextIndex: completeIndex });
                    setToast("Project marked complete.");
                  }}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded"
                >
                  Mark as Complete
                </button>
              )}
            </div>

            <a
              href={`/track/${selected.trackingLinkId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-3 text-blue-300 hover:underline text-sm"
            >
              View Customer Page
            </a>

            <div className="mt-6">
              <label className="block mb-2 text-sm font-semibold">Internal Notes</label>
              <textarea
                rows={4}
                placeholder="Enter notes here..."
                value={internalNotes}
                onChange={e => setInternalNotes(e.target.value)}
                className="w-full p-3 rounded bg-gray-800 text-white border border-gray-600"
              />
              <button
                onClick={async () => {
                  /**
                   * Saves internal notes to Firestore
                   * Updates local state and shows confirmation toast
                   */
                  await updateDoc(doc(db, 'projects', selected.id), { internalNotes });
                  setProjects(prev =>
                    prev.map(p => p.id === selected.id ? { ...p, internalNotes } : p)
                  );
                  setToast("Notes saved successfully.");
                }}
                className="mt-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold px-4 py-2 rounded"
              >
                Save Notes
              </button>
            </div>
          </>
        ) : (
          <div className="text-gray-400">Select a project to view details.</div>
        )}
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}