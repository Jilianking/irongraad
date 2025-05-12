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
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-b from-[#2e0e17] to-[#3a0d0d] text-white">
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-700 p-4 md:p-6 overflow-y-auto">
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <Sheet>
            <SheetTrigger>
              <Menu className="w-6 md:w-8 h-6 md:h-8 cursor-pointer" />
            </SheetTrigger>
            <SheetContent side="left" className="bg-gray-800 text-white w-64 p-6 h-full">
              <ul className="space-y-4 text-xl md:text-2xl font-large">
                <li><Link to="/activeprojects" className="hover:underline">Active Projects</Link></li>
                <li><Link to="/newproject" className="hover:underline">New Project</Link></li>
              </ul>
            </SheetContent>
          </Sheet>

          <h2 className="text-3xl md:text-5xl font-extrabold tracking-wide">
            <Link to="/" className="hover:underline">Projects</Link>
          </h2>
        </div>

        <input
          type="text"
          placeholder="Search by name or type..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full p-2 mb-4 text-base md:text-lg rounded bg-gray-800 text-white"
        />

        <ul className="space-y-2 max-h-[50vh] md:max-h-none overflow-y-auto">
          {filtered.map(project => (
            <li
              key={project.id}
              onClick={() => setSelectedProjectId(project.id)}
              className={`cursor-pointer p-2 md:p-3 rounded transition ${
                selectedProjectId === project.id ? 'bg-[#3a0d0d]' : 'hover:bg-[#4d1c1c]'
              }`}
            >
              <p className="font-semibold text-xl md:text-2xl">{project.name}</p>
              <p className="text-lg md:text-xl text-gray-400">{project.projectType}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="w-full md:w-2/3 p-4 md:p-8 text-base md:text-lg leading-relaxed">
        {selected ? (
          <>
            <div className="mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold mb-2">{selected.name}</h2>
              <p className="text-sm md:text-base">📧 {selected.email} | 📞 {selected.phone}</p>
              <p className="text-sm md:text-base italic text-gray-400">Preferred: {selected.contactMethod?.toUpperCase()}</p>
            </div>

            <div className="bg-gray-800 p-3 md:p-4 rounded-lg mb-4">
              <p className="text-sm md:text-base"><strong>Fix Type:</strong> {selected.fixType}</p>
              <p className="text-sm md:text-base"><strong>Project Type:</strong> {selected.projectType}</p>
              <p className="text-sm md:text-base"><strong>Tracking ID:</strong> {selected.trackingLinkId}</p>
              <p className="text-sm md:text-base"><strong>Current Step:</strong> {currentStep}</p>
              {!isComplete && (
                <p className="text-sm md:text-base"><strong>Next Step:</strong> {selected.selectedSteps?.[selected.currentStepIndex + 1]}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 md:gap-3 mt-4">
              {!isComplete && selected.currentStepIndex > 0 && (
                <button
                  onClick={async () => {
                    const prevIndex = selected.currentStepIndex - 1;
                    await updateDoc(doc(db, 'projects', selected.id), { currentStepIndex: prevIndex });
                    setProjects(prev =>
                      prev.map(p => p.id === selected.id ? { ...p, currentStepIndex: prevIndex } : p)
                    );
                    setToast("Step moved back.");
                  }}
                  className="w-full md:w-auto bg-yellow-700 hover:bg-yellow-800 text-white font-semibold px-3 md:px-4 py-2 rounded text-sm md:text-base"
                >
                  Go Back to Previous Step
                </button>
              )}

              {!isComplete && (
                <button
                  onClick={async () => {
                    const nextIndex = selected.currentStepIndex + 1;
                    await updateDoc(doc(db, 'projects', selected.id), { currentStepIndex: nextIndex });
                    setProjects(prev =>
                      prev.map(p => p.id === selected.id ? { ...p, currentStepIndex: nextIndex } : p)
                    );
                    await notifyCustomer({ project: selected, nextIndex });
                    setToast("Advanced to next step.");
                  }}
                  className="w-full md:w-auto bg-green-700 hover:bg-green-800 text-white font-semibold px-3 md:px-4 py-2 rounded text-sm md:text-base"
                >
                  Advance to Next Step
                </button>
              )}

              {!isComplete && (
                <button
                  onClick={async () => {
                    const completeIndex = selected.selectedSteps.length;
                    await updateDoc(doc(db, 'projects', selected.id), { currentStepIndex: completeIndex });
                    setProjects(prev =>
                      prev.map(p => p.id === selected.id ? { ...p, currentStepIndex: completeIndex } : p)
                    );
                    await notifyCustomer({ project: selected, nextIndex: completeIndex });
                    setToast("Project marked complete.");
                  }}
                  className="w-full md:w-auto bg-blue-700 hover:bg-blue-800 text-white font-semibold px-3 md:px-4 py-2 rounded text-sm md:text-base"
                >
                  Mark as Complete
                </button>
              )}
            </div>

            <a
              href={`/track/${selected.trackingLinkId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-3 text-blue-300 hover:underline text-xs md:text-sm"
            >
              View Customer Page
            </a>

            <div className="mt-4 md:mt-6">
              <label className="block mb-2 text-sm font-semibold">Internal Notes</label>
              <textarea
                rows={4}
                placeholder="Enter notes here..."
                value={internalNotes}
                onChange={e => setInternalNotes(e.target.value)}
                className="w-full p-2 md:p-3 rounded bg-gray-800 text-white border border-gray-600 text-sm md:text-base"
              />
              <button
                onClick={async () => {
                  await updateDoc(doc(db, 'projects', selected.id), { internalNotes });
                  setProjects(prev =>
                    prev.map(p => p.id === selected.id ? { ...p, internalNotes } : p)
                  );
                  setToast("Notes saved successfully.");
                }}
                className="mt-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold px-3 md:px-4 py-2 rounded text-sm md:text-base"
              >
                Save Notes
              </button>
            </div>
          </>
        ) : (
          <div className="text-gray-400 text-center mt-4">Select a project to view details.</div>
        )}
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}