import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function CustomerTracking() {
  const { trackingLinkId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const q = query(
          collection(db, "projects"),
          where("trackingLinkId", "==", trackingLinkId)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setProject(querySnapshot.docs[0].data());
        }
      } catch (err) {
        console.error("❌ Error fetching project:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [trackingLinkId]);

  if (loading) return <div className="p-6 text-white">Loading...</div>;

  if (!project) {
    return <div className="p-6 text-red-500">No project found with this link.</div>;
  }

  const currentStep = project.selectedSteps?.[project.currentStepIndex] ?? "✅ Complete";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2e0e17] to-[#511628] text-white p-6">
      <div className="max-w-2xl mx-auto bg-gray-800 p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-4">Project Progress</h1>
        <p><strong>Customer:</strong> {project.name}</p>
        <p><strong>Email:</strong> {project.email}</p>
        <p><strong>Project Type:</strong> {project.projectType}</p>
        <p><strong>Fix Type:</strong> {project.fixType}</p>
        <p className="mt-4"><strong>Current Step:</strong> <span className="text-blue-300">{currentStep}</span></p>
        <p><strong>Status:</strong> {project.currentStepIndex >= project.selectedSteps?.length ? "✅ Complete" : `Step ${project.currentStepIndex + 1} of ${project.selectedSteps.length}`}</p>
      </div>
    </div>
  );
} 