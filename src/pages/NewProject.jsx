import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const fixTemplates = {
  Plumbing: {
    "Replace Sink": [
      "Shut off water",
      "Remove old sink",
      "Install new sink",
      "Reconnect pipes",
      "Seal edges",
      "Test for leaks"
    ],
    "Install Faucet": [
      "Shut off valves",
      "Install faucet",
      "Seal base",
      "Connect hoses",
      "Test flow"
    ]
  },
  Electrical: {
    "Replace Outlet": [
      "Turn off power",
      "Remove outlet",
      "Install new outlet",
      "Restore power",
      "Test outlet"
    ],
    "Install Light Fixture": [
      "Cut power",
      "Mount bracket",
      "Wire fixture",
      "Secure housing",
      "Test light"
    ]
  },
  Drywall: {
    "Repair Hole": [
      "Cut damaged area",
      "Install backing support",
      "Insert drywall patch",
      "Apply joint compound",
      "Sand smooth",
      "Paint wall"
    ],
    "New Wall Install": [
      "Frame wall",
      "Hang drywall sheets",
      "Tape and mud joints",
      "Sand and finish",
      "Prime and paint"
    ]
  },
  Roofing: {
    "Shingle Replacement": [
      "Remove old shingles",
      "Inspect decking",
      "Install underlayment",
      "Nail new shingles",
      "Seal flashing"
    ],
    "Repair Leak": [
      "Locate leak source",
      "Remove damaged area",
      "Patch or replace section",
      "Seal edges",
      "Test with hose"
    ]
  },
  Flooring: {
    "Install Vinyl": [
      "Clear area",
      "Clean subfloor",
      "Lay underlayment",
      "Install vinyl planks",
      "Roll and seal"
    ],
    "Replace Tile": [
      "Remove broken tiles",
      "Clean adhesive",
      "Apply new mortar",
      "Place tiles",
      "Grout and seal"
    ]
  }
};

export default function NewProject() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    fixType: "",
    projectType: "",
    description: "",
    contactMethod: "sms",
    selectedSteps: [],
  });

  const [showToast, setShowToast] = useState(false);
  const [lastTrackingId, setLastTrackingId] = useState("");

  useEffect(() => {
    if (showToast) {
      const timeout = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timeout);
    }
  }, [showToast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFixTypeSelect = (e) => {
    const fixType = e.target.value;
    setFormData((prev) => ({
      ...prev,
      fixType,
      projectType: "",
      selectedSteps: [],
    }));
  };

  const handleProjectTypeSelect = (e) => {
    const projectType = e.target.value;
    setFormData((prev) => ({
      ...prev,
      projectType,
      selectedSteps: [],
    }));
  };

  const handleStepChange = (step) => {
    setFormData((prev) => {
      const steps = prev.selectedSteps.includes(step)
        ? prev.selectedSteps.filter((s) => s !== step)
        : [...prev.selectedSteps, step];
      return { ...prev, selectedSteps: steps };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trackingLinkId = Math.random().toString(36).substring(2, 10);
    const newProject = {
      ...formData,
      trackingLinkId,
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, "projects"), newProject);
      setLastTrackingId(trackingLinkId);
      setShowToast(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        fixType: "",
        projectType: "",
        description: "",
        contactMethod: "sms",
        selectedSteps: [],
      });
    } catch (error) {
      console.error("❌ Error saving project:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto text-white relative">
      <h2 className="text-2xl font-bold mb-4">Create New Project</h2>

      <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 p-6 rounded-xl shadow-md">
        <input
          type="text"
          name="name"
          placeholder="Customer Name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full p-2 rounded bg-gray-700 text-white"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleInputChange}
          className="w-full p-2 rounded bg-gray-700 text-white"
          required
        />

        <select
          name="fixType"
          value={formData.fixType}
          onChange={handleFixTypeSelect}
          className="w-full p-2 rounded bg-gray-700 text-white"
          required
        >
          <option value="">Select Fix Type</option>
          {Object.keys(fixTemplates).map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        {formData.fixType && (
          <select
            name="projectType"
            value={formData.projectType}
            onChange={handleProjectTypeSelect}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          >
            <option value="">Select Project Type</option>
            {Object.keys(fixTemplates[formData.fixType]).map((project) => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
        )}

        {formData.fixType && formData.projectType && (
          <div>
            <p className="font-semibold mt-4 mb-2">Select Steps:</p>
            <div className="grid grid-cols-2 gap-2">
              {fixTemplates[formData.fixType][formData.projectType].map((step, index) => (
                <label key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.selectedSteps.includes(step)}
                    onChange={() => handleStepChange(step)}
                    className="mr-2"
                  />
                  {step}
                </label>
              ))}
            </div>
          </div>
        )}

        <textarea
          name="description"
          placeholder="Project Description"
          value={formData.description}
          onChange={handleInputChange}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />

        <div>
          <span className="font-semibold">Preferred Contact:</span>
          <label className="ml-4">
            <input
              type="radio"
              name="contactMethod"
              value="sms"
              checked={formData.contactMethod === "sms"}
              onChange={handleInputChange}
              className="mr-1"
            />
            SMS
          </label>
          <label className="ml-4">
            <input
              type="radio"
              name="contactMethod"
              value="email"
              checked={formData.contactMethod === "email"}
              onChange={handleInputChange}
              className="mr-1"
            />
            Email
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create Project
        </button>
      </form>

      {/* ✅ Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg transition-all z-50">
          ✅ Project Created!<br />
          Tracking ID: <code>{lastTrackingId}</code>
        </div>
      )}
    </div>
  );
}
