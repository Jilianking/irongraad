import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const notifyCustomer = async ({ project, nextIndex }) => {
  try {
    console.log("📣 notifyCustomer called", project.name);
    const res = await fetch("https://irongraad.vercel.app/api/sendNotification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: project.name,
        email: project.email,
        phone: project.phone,
        contactMethod: project.contactMethod,
        currentStep: project.selectedSteps[nextIndex],
        trackingLinkId: project.trackingLinkId,
        isComplete: false,
        projectId: project.id // ✅ required for Firebase message logging
      })
    });

    const result = await res.json();
    console.log("📤 Notification result:", result);

    if (!res.ok) throw new Error(result.error || "Notification failed");
    console.log("✅ Notification sent successfully");
  } catch (err) {
    console.error("❌ Notification error:", err.message);
  }
};

export default function ActiveProjects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      const querySnapshot = await getDocs(collection(db, 'projects'));
      const data = querySnapshot.docs.map(doc => {
        const project = doc.data();
        return {
          id: doc.id,
          ...project,
          currentStepIndex: project.currentStepIndex ?? 0
        };
      });
      setProjects(data);
    };

    fetchProjects();
  }, []);

  const filtered = projects.filter(p =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.fixType || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.trackingLinkId || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">🔧 Active Projects</h1>

      <input
        type="text"
        placeholder="Search by name, type, or ID..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full p-3 mb-6 rounded bg-gray-700 text-white"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(project => {
          const currentStep = project.selectedSteps?.[project.currentStepIndex] ?? "✅ Complete";
          const isComplete = project.currentStepIndex >= project.selectedSteps?.length;

          return (
            <div
              key={project.id}
              className="bg-gray-800 border border-gray-600 rounded-xl p-5 shadow hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-lg font-semibold">{project.name}</p>
                  {project.email && (
                    <p className="text-sm text-gray-400">📧 {project.email}</p>
                  )}
                  {project.phone && (
                    <p className="text-sm text-gray-400">📞 {project.phone}</p>
                  )}
                  {project.contactMethod && (
                    <p className="text-xs italic text-gray-500">
                      Preferred: {project.contactMethod.toUpperCase()}
                    </p>
                  )}
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                  isComplete ? 'bg-green-600' : 'bg-yellow-600'
                }`}>
                  {isComplete ? 'Complete' : `Step ${project.currentStepIndex + 1}`}
                </span>
              </div>

              <p className="text-sm mb-1"><strong>Fix Type:</strong> {project.fixType}</p>
              <p className="text-sm mb-1"><strong>Project:</strong> {project.projectType}</p>
              <p className="text-sm mb-3"><strong>Tracking ID:</strong> {project.trackingLinkId}</p>

              <div className="bg-gray-700 p-3 rounded mb-3">
                <p className="text-sm font-semibold">Current Step:</p>
                <p className="text-sm text-blue-300">{currentStep}</p>
              </div>

              {!isComplete && (
                <div className="mb-3 text-sm text-gray-300">
                  <span className="font-semibold">Next Step:</span>{" "}
                  <span className="text-white font-semibold">
                    {project.selectedSteps?.[project.currentStepIndex + 1]}
                  </span>
                </div>
              )}

              <button
                onClick={async () => {
                  console.log("🟦 Button clicked - preparing to advance step for:", project.name);

                  const nextIndex = project.currentStepIndex + 1;
                  if (nextIndex < project.selectedSteps?.length) {
                    await updateDoc(doc(db, "projects", project.id), {
                      currentStepIndex: nextIndex
                    });

                    console.log(`✅ Advanced ${project.name} to Step ${nextIndex}`);

                    setProjects(prev =>
                      prev.map(p =>
                        p.id === project.id
                          ? { ...p, currentStepIndex: nextIndex }
                          : p
                      )
                    );

                    await notifyCustomer({ project, nextIndex });
                  }
                }}
                disabled={isComplete}
                className={`w-full py-2 mt-2 font-bold rounded ${
                  isComplete
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isComplete ? "✅ Done" : "Advance to Next Step"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
