import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function ProjectPage() {
  const { id } = useParams(); // /project/:id
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      const docRef = doc(db, "projects", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.currentStepIndex === undefined) {
          data.currentStepIndex = 0;
        }
        setProject({ id: docSnap.id, ...data });
      }
      setLoading(false);
    };

    fetchProject();
  }, [id]);

  const handleAdvanceStep = async () => {
    if (!project) return;
    const nextStepIndex = project.currentStepIndex + 1;
    if (nextStepIndex >= project.selectedSteps.length) return;

    setUpdating(true);
    const docRef = doc(db, "projects", project.id);
    await updateDoc(docRef, { currentStepIndex: nextStepIndex });
    setProject((prev) => ({ ...prev, currentStepIndex: nextStepIndex }));
    setUpdating(false);
  };

  if (loading) return <div className="p-6 text-white">Loading project...</div>;
  if (!project) return <div className="p-6 text-red-500">Project not found</div>;

  const { selectedSteps, currentStepIndex } = project;
  const currentStep = selectedSteps?.[currentStepIndex] ?? "All steps complete";

  return (
    <div className="p-8 text-white max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-xl mt-10">
      <h1 className="text-3xl font-bold mb-4">Project: {project.projectType}</h1>
      <p className="text-sm text-gray-400 mb-6">Tracking ID: {project.trackingLinkId}</p>

      <h2 className="text-xl font-semibold mb-2">Current Step:</h2>
      <div className="mb-4 text-lg bg-gray-700 p-4 rounded">
        {currentStep}
      </div>

      <button
        disabled={currentStepIndex >= selectedSteps.length - 1 || updating}
        onClick={handleAdvanceStep}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-40"
      >
        {updating ? "Updating..." : "Next Step"}
      </button>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">All Steps:</h2>
        <ol className="list-decimal pl-6 text-sm space-y-1">
          {selectedSteps?.map((step, idx) => (
            <li
              key={idx}
              className={idx === currentStepIndex ? "text-yellow-400 font-bold" : ""}
            >
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
