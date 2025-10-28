import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosInstance";
import PopupAlert from "../../components/PopupAlert";
import StudentHeader from "../../components/StudentHeader";
import Footer from "../../components/Footer";

interface Meal {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}

interface MealPlan {
  id: string;
  name: string;
  meals: Meal[];
}

interface Hostel {
  id: string;
  name: string;
  type: string;
  totalBlocks: number;
  warden: string;
  description: string;
  mealPlan: string;
}

export default function StudentMealPlanPage() {
  const { profile } = useAuth();
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [popup, setPopup] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const showPopup = (type: "success" | "error", message: string) => setPopup({ type, message });

  // Fetch hostel and meal plan data
  const fetchMealPlanData = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get the student's hostel ID (you might need to adjust this based on your API)
      const studentRes = await api.get(`/students/${profile?.id}`);
      if (studentRes.data.error) {
        throw new Error(studentRes.data.message);
      }

      const studentData = studentRes.data.data;
      const hostelId = studentData.hostel; // Adjust this based on your student data structure

      if (!hostelId) {
        throw new Error("Student is not assigned to any hostel");
      }

      // Fetch hostel details
      const hostelRes = await api.get(`/hostel/${hostelId}`);
      if (hostelRes.data.error) {
        throw new Error(hostelRes.data.message);
      }

      const hostelData = hostelRes.data.data;
      setHostel(hostelData);

      // Fetch meal plan details
      const mealPlanRes = await api.get(`/meal-plan/${hostelData.mealPlan}`);
      if (mealPlanRes.data.error) {
        throw new Error(mealPlanRes.data.message);
      }

      setMealPlan(mealPlanRes.data.data);

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch meal plan";
      setError(errorMessage);
      showPopup("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMealPlanData();
  }, [profile]);

  // Format day name
  const formatDayName = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Get current day
  const getCurrentDay = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <StudentHeader />
        <main className="flex-grow bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading meal plan...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !mealPlan) {
    return (
      <div className="min-h-screen flex flex-col">
        <StudentHeader />
        <main className="flex-grow bg-gray-100 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 text-6xl mb-4">🍽️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Meal Plan Not Available</h2>
            <p className="text-gray-600 mb-4">{error || "Unable to load meal plan information"}</p>
            <button
              onClick={fetchMealPlanData}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentDay = getCurrentDay();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <StudentHeader />
      
      <main className="flex-grow p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Weekly Meal Plan</h1>
                <p className="text-gray-600">
                  {hostel ? `Hostel: ${hostel.name}` : 'Your assigned meal schedule'}
                </p>
              </div>
              <div className="bg-blue-100 border border-blue-200 rounded-lg px-4 py-3">
                <p className="text-blue-800 font-medium text-sm">
                  Current Plan: <span className="font-bold">{mealPlan.name}</span>
                </p>
                {hostel && (
                  <p className="text-blue-700 text-xs mt-1">
                    Warden: {hostel.warden}
                  </p>
                )}
              </div>
            </div>

            {/* Today's Special Highlight */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white mb-8">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🍽️</div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Today's Menu ({formatDayName(currentDay)})</h2>
                  {mealPlan.meals.find(meal => meal.day === currentDay) ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-semibold">Breakfast:</span>
                        <p className="opacity-90">{mealPlan.meals.find(meal => meal.day === currentDay)?.breakfast}</p>
                      </div>
                      <div>
                        <span className="font-semibold">Lunch:</span>
                        <p className="opacity-90">{mealPlan.meals.find(meal => meal.day === currentDay)?.lunch}</p>
                      </div>
                      <div>
                        <span className="font-semibold">Dinner:</span>
                        <p className="opacity-90">{mealPlan.meals.find(meal => meal.day === currentDay)?.dinner}</p>
                      </div>
                    </div>
                  ) : (
                    <p>No meal plan for today</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Meal Plan Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Weekly Schedule</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Day
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Breakfast
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lunch
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dinner
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mealPlan.meals.map((meal, _) => (
                    <tr 
                      key={meal.day} 
                      className={`hover:bg-gray-50 transition-colors ${
                        meal.day === currentDay ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`text-sm font-medium ${
                            meal.day === currentDay ? 'text-blue-600' : 'text-gray-900'
                          }`}>
                            {formatDayName(meal.day)}
                          </span>
                          {meal.day === currentDay && (
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                              Today
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{meal.breakfast}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{meal.lunch}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{meal.dinner}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Meal Timings</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Breakfast</span>
                  <span className="font-semibold text-gray-800">8:00 AM - 9:30 AM</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Lunch</span>
                  <span className="font-semibold text-gray-800">12:30 PM - 2:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Dinner</span>
                  <span className="font-semibold text-gray-800">7:00 PM - 8:30 PM</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Hostel Information</h3>
              {hostel ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name</span>
                    <span className="font-semibold text-gray-800">{hostel.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type</span>
                    <span className="font-semibold text-gray-800 capitalize">{hostel.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Warden</span>
                    <span className="font-semibold text-gray-800">{hostel.warden}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Blocks</span>
                    <span className="font-semibold text-gray-800">{hostel.totalBlocks}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No hostel information available</p>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-yellow-800 mb-2">Important Notes</h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Meal timings are strictly followed. Latecomers may not be served.</li>
              <li>• Special dietary requirements should be discussed with the warden.</li>
              <li>• Weekend timings may vary - please check with hostel administration.</li>
              <li>• Menu is subject to change based on availability and special occasions.</li>
            </ul>
          </div>
        </div>
      </main>

      {popup && <PopupAlert type={popup.type} message={popup.message} onClose={() => setPopup(null)} />}
      
      <Footer />
    </div>
  );
}