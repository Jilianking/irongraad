import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { CheckCircle, Circle, Loader2, Package } from 'lucide-react';
import logo from '../assets/logo.png';

export default function CustomerTracking() {
  const { trackingLinkId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectByTrackingId = async () => {
      setLoading(true);
      setProject(null); // Reset project state before fetching
      console.log('[CustomerTracking] Attempting to fetch project for tracking ID:', trackingLinkId);
      try {
        if (!trackingLinkId) {
          console.log('[CustomerTracking] No trackingLinkId provided.');
          setLoading(false);
          return;
        }
        const projectsRef = collection(db, 'projects');
        const q = query(projectsRef, where('trackingLinkId', '==', trackingLinkId));
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const projectDoc = querySnapshot.docs[0];
          const projectData = projectDoc.data();
          console.log('[CustomerTracking] Project data successfully fetched:', projectData);
          setProject({ id: projectDoc.id, ...projectData });
        } else {
          console.log('[CustomerTracking] No project found for tracking ID:', trackingLinkId);
        }
      } catch (error) {
        console.error('[CustomerTracking] Firestore query failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectByTrackingId();
  }, [trackingLinkId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8 text-gray-700">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-600" />
        <p className="text-xl">Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8 text-center">
        <Package className="w-20 h-20 text-red-500 mb-6" /> 
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Project Not Found</h1>
        <p className="text-lg text-gray-600 mb-2">
          We couldn't find a project with tracking ID: 
          <strong className="text-red-600"> {trackingLinkId}</strong>
        </p>
        <p className="text-md text-gray-500">Please double-check the link or contact support if you believe this is an error.</p>
      </div>
    );
  }

  const { name, projectType, fixType, selectedSteps = [], currentStepIndex = 0 } = project;
  const isProjectComplete = currentStepIndex >= selectedSteps.length;
  // const currentStatusText = isProjectComplete ? "Project Complete" : selectedSteps[currentStepIndex]; // Not used directly in JSX below

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <img src={logo} alt="Irongraad Logo" className="mx-auto h-20 w-auto mb-6" />
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Project Tracking
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Stay updated on the progress of your project: <span className="font-semibold text-gray-800">{name}</span>
          </p>
        </div>

        {/* Project Details Card */}
        <div className="bg-white shadow-xl rounded-lg overflow-hidden mb-10">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Project Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-gray-700">
              <div><strong className="text-gray-900">Project Name:</strong> {name}</div>
              <div><strong className="text-gray-900">Type:</strong> {projectType || 'N/A'}</div>
              <div><strong className="text-gray-900">Fix:</strong> {fixType || 'N/A'}</div>
              <div>
                <strong className="text-gray-900">Status:</strong> 
                <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${isProjectComplete ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {isProjectComplete ? 'Completed' : 'In Progress'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Steps */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Progress Details</h2>
          {selectedSteps.length > 0 ? (
            <div className="space-y-8">
              {selectedSteps.map((step, index) => {
                const isActive = index === currentStepIndex && !isProjectComplete;
                const isCompleted = index < currentStepIndex || isProjectComplete;
                const isFuture = index > currentStepIndex && !isProjectComplete;

                return (
                  <div key={index} className="flex">
                    <div className="flex flex-col items-center mr-6">
                      <div>
                        {isCompleted ? (
                          <CheckCircle className="w-10 h-10 text-green-500" />
                        ) : isActive ? (
                          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                        ) : (
                          <Circle className="w-10 h-10 text-gray-300" />
                        )}
                      </div>
                      {index < selectedSteps.length - 1 && (
                        <div className={`w-1 flex-grow ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      )}
                    </div>
                    <div className={`pt-1 pb-8 ${isFuture ? 'opacity-50' : ''}`}>
                      <p className={`text-sm font-medium ${isCompleted ? 'text-green-600' : isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                        STEP {index + 1}
                      </p>
                      <p className="mt-1 text-xl font-semibold text-gray-800">{step}</p>
                      {isActive && (
                        <p className="mt-2 text-sm text-blue-600">Current active step</p>
                      )}
                    </div>
                  </div>
                );
              })}
              {isProjectComplete && (
                <div className="flex items-center p-4 bg-green-50 rounded-lg mt-8">
                  <CheckCircle className="w-10 h-10 text-green-500 mr-4" />
                  <div>
                    <p className="text-xl font-semibold text-green-700">Project Completed!</p>
                    <p className="text-gray-600">All steps have been successfully finished.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600">No steps defined for this project yet.</p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Irongraad. All rights reserved.</p>
          <p>Tracking ID: {trackingLinkId}</p>
        </div>
      </div>
    </div>
  );
}