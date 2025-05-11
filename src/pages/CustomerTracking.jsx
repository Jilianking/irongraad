import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function CustomerTracking() {
  const { trackingLinkId } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      const q = query(collection(db, 'projects'), where('trackingLinkId', '==', trackingLinkId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setProject(snapshot.docs[0].data());
      }
    };

    fetchProject();
  }, [trackingLinkId]);

  if (!project) return <div className="text-white p-8">Loading...</div>;

  const currentStep = project.selectedSteps?.[project.currentStepIndex] ?? "✅ Complete";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2e0e17] to-[#511628] text-white p-8">
      <h1 className="text-3xl font-bold mb-4">{project.name}'s Project</h1>
      <p className="mb-2"><strong>Project Type:</strong> {project.projectType}</p>
      <p className="mb-2"><strong>Fix Type:</strong> {project.fixType}</p>
      <p className="mb-2"><strong>Current Step:</strong> {currentStep}</p>
    </div>
  );
}