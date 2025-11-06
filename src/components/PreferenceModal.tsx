import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";

// Preference types
export const StudyHabit = {
  INDIVIDUAL_STUDY: "individual-study",
  GROUP_STUDY: "group-study",
  FLEXIBLE: "flexible",
} as const;

export type StudyHabit = typeof StudyHabit[keyof typeof StudyHabit];

export const HealthCondition = {
  NONE: 'none',
  COLD: 'cold',
  DUST_ALLERGY: 'dust-allergy',
  ASTHMA: 'asthma',
  HEADACHE: 'headache',
  MIGRAINE: 'migraine',
  SINUS: 'sinus',
  OTHER: 'other',
} as const;

export type HealthCondition = typeof HealthCondition[keyof typeof HealthCondition];

export type StudentProfile = {
  id: string;
  name: string;
  registerNo?: string;
  department?: string;
  year?: number;
};

export type StudentPreference = {
  studentProfileId: string;
  preferredRoommates: string[];
  wakeupTime: string;
  sleepTime: string;
  studyHabit: StudyHabit;
  healthCondition: HealthCondition;
  createdAt?: string;
  updatedAt?: string;
  id?: string;
};

interface PreferenceModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onSkip: () => void;
  profile: any;
  preferenceData: StudentPreference;
  setPreferenceData: React.Dispatch<React.SetStateAction<StudentPreference>>;
  loading: boolean;
  error: string;
}

export default function PreferenceModal({
  show,
  onClose,
  onSubmit,
  onSkip,
  profile,
  preferenceData,
  setPreferenceData,
  loading,
  error
}: PreferenceModalProps) {
  const [studentProfiles, setStudentProfiles] = useState<StudentProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch all student profiles
  const fetchStudentProfiles = async () => {
    try {
      const res = await api.get("/students/");
      if (!res.data.error) {
        setStudentProfiles(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching student profiles:", err);
    }
  };

  useEffect(() => {
    if (show) {
      fetchStudentProfiles();
    }
  }, [show]);

  const filteredStudents = studentProfiles.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    student.id !== profile?.id && // Exclude current student
    !preferenceData.preferredRoommates.includes(student.id) // Exclude already selected
  );

  const handleAddRoommate = (studentId: string) => {
    setPreferenceData(prev => ({
      ...prev,
      preferredRoommates: [...prev.preferredRoommates, studentId]
    }));
    setSearchTerm("");
    setShowDropdown(false);
  };

  const handleRemoveRoommate = (studentId: string) => {
    setPreferenceData(prev => ({
      ...prev,
      preferredRoommates: prev.preferredRoommates.filter(id => id !== studentId)
    }));
  };

  const getStudentName = (studentId: string) => {
    const student = studentProfiles.find(s => s.id === studentId);
    return student?.name || "Unknown Student";
  };

  const getStudentDetails = (studentId: string) => {
    const student = studentProfiles.find(s => s.id === studentId);
    if (!student) return "";
    return `${student.department || "N/A"} - Year ${student.year || "N/A"}`;
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Hostel Preference Form
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Please fill out your preferences for hostel allocation
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Preferred Roommates Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Roommates
          </label>
          
          {/* Selected Roommates */}
          <div className="mb-3">
            {preferenceData.preferredRoommates.length === 0 ? (
              <p className="text-gray-500 text-sm">No roommates selected</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {preferenceData.preferredRoommates.map(roommateId => (
                  <div
                    key={roommateId}
                    className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    <span>
                      {getStudentName(roommateId)}
                      <span className="text-xs text-blue-600 ml-1">
                        ({getStudentDetails(roommateId)})
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRoommate(roommateId)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search and Add Roommate */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search students by name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {showDropdown && searchTerm && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredStudents.length === 0 ? (
                  <div className="p-3 text-gray-500 text-sm">No students found</div>
                ) : (
                  filteredStudents.map(student => (
                    <div
                      key={student.id}
                      onClick={() => handleAddRoommate(student.id)}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                    >
                      <div className="font-medium text-gray-800">{student.name}</div>
                      <div className="text-sm text-gray-600">
                        {student.department || "N/A"} - Year {student.year || "N/A"}
                        {student.registerNo && ` (${student.registerNo})`}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Search and select students you'd like to room with
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Wake-up Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wake-up Time
            </label>
            <input
              type="time"
              value={preferenceData.wakeupTime}
              onChange={(e) => setPreferenceData(prev => ({
                ...prev,
                wakeupTime: e.target.value
              }))}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Sleep Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sleep Time
            </label>
            <input
              type="time"
              value={preferenceData.sleepTime}
              onChange={(e) => setPreferenceData(prev => ({
                ...prev,
                sleepTime: e.target.value
              }))}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Study Habit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Study Habit
            </label>
            <select
              value={preferenceData.studyHabit}
              onChange={(e) => setPreferenceData(prev => ({
                ...prev,
                studyHabit: e.target.value as StudyHabit
              }))}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={StudyHabit.INDIVIDUAL_STUDY}>Individual Study</option>
              <option value={StudyHabit.GROUP_STUDY}>Group Study</option>
              <option value={StudyHabit.FLEXIBLE}>Flexible</option>
            </select>
          </div>

          {/* Health Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Health Condition
            </label>
            <select
              value={preferenceData.healthCondition}
              onChange={(e) => setPreferenceData(prev => ({
                ...prev,
                healthCondition: e.target.value as HealthCondition
              }))}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={HealthCondition.NONE}>None</option>
              <option value={HealthCondition.COLD}>Cold</option>
              <option value={HealthCondition.DUST_ALLERGY}>Dust Allergy</option>
              <option value={HealthCondition.ASTHMA}>Asthma</option>
              <option value={HealthCondition.HEADACHE}>Headache</option>
              <option value={HealthCondition.MIGRAINE}>Migraine</option>
              <option value={HealthCondition.SINUS}>Sinus</option>
              <option value={HealthCondition.OTHER}>Other</option>
            </select>
          </div>
        </div>

        {/* Additional Notes */}
        {/* <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            value={preferenceData.additionalNotes}
            onChange={(e) => setPreferenceData(prev => ({
              ...prev,
              additionalNotes: e.target.value
            }))}
            rows={3}
            placeholder="Any additional preferences or requirements..."
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div> */}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onSkip}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium disabled:opacity-50"
          >
            Skip & Pay
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save & Continue to Pay"}
          </button>
        </div>
      </div>
    </div>
  );
}