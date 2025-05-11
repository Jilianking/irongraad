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
    <div className="min-h-screen bg-gradient-to-b from-[#2e0e17] to-[#511628] flex justify-center items-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-3xl space-y-6"
      >
        <h2 className="text-2xl font-bold text-maroonDark">New Project</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input type="text" name="name" placeholder="Customer Name" value={formData.name} onChange={handleInputChange} className="p-3 rounded bg-gray-100 text-black" required />
          <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} className="p-3 rounded bg-gray-100 text-black" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} className="p-3 rounded bg-gray-100 text-black" required />

          <div className="flex gap-6 items-center">
            <label className="text-maroonDark font-semibold">Contact:</label>
            <label>
              <input type="radio" name="contactMethod" value="sms" checked={formData.contactMethod === "sms"} onChange={handleInputChange} className="mr-1" />
              SMS
            </label>
            <label>
              <input type="radio" name="contactMethod" value="email" checked={formData.contactMethod === "email"} onChange={handleInputChange} className="mr-1" />
              Email
            </label>
          </div>
        </div>

        <select name="fixType" value={formData.fixType} onChange={handleFixTypeSelect} className="w-full p-3 rounded bg-gray-100 text-black" required>
          <option value="">Select Fix Type</option>
          {Object.keys(fixTemplates).map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        {formData.fixType && (
          <select name="projectType" value={formData.projectType} onChange={handleProjectTypeSelect} className="w-full p-3 rounded bg-gray-100 text-black" required>
            <option value="">Select Project Type</option>
            {Object.keys(fixTemplates[formData.fixType]).map((project) => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
        )}

        {formData.fixType && formData.projectType && (
          <div>
            <p className="text-maroonDark font-semibold">Steps:</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {fixTemplates[formData.fixType][formData.projectType].map((step, idx) => (
                <label key={idx} className="flex items-center text-sm">
                  <input type="checkbox" checked={formData.selectedSteps.includes(step)} onChange={() => handleStepChange(step)} className="mr-2" />
                  {step}
                </label>
              ))}
            </div>
          </div>
        )}

        <textarea name="description" placeholder="Project Description" value={formData.description} onChange={handleInputChange} className="w-full p-3 rounded bg-gray-100 text-black" rows={4} />

        <button type="submit" className="w-full bg-[#3a0d0d] hover:bg-[#5c1a1a] text-white font-semibold py-3 rounded">
          Create Project
        </button>
      </form>

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50">
          ✅ Project Created!<br />
          Tracking ID: <code>{lastTrackingId}</code>
        </div>
      )}
    </div>
  );
}
