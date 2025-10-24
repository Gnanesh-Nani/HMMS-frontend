import React, { useEffect, useState } from "react";
import AdminHeader from "../components/AdminHeader";
import Footer from "../components/Footer";
import api from "../api/axiosInstance";

type Meal = {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
};

type MealPlan = {
  id: string;
  name: string;
  meals: Meal[];
};

const defaultMeals: Meal[] = [
  { day: "monday", breakfast: "", lunch: "", dinner: "" },
  { day: "tuesday", breakfast: "", lunch: "", dinner: "" },
  { day: "wednesday", breakfast: "", lunch: "", dinner: "" },
  { day: "thursday", breakfast: "", lunch: "", dinner: "" },
  { day: "friday", breakfast: "", lunch: "", dinner: "" },
  { day: "saturday", breakfast: "", lunch: "", dinner: "" },
  { day: "sunday", breakfast: "", lunch: "", dinner: "" },
];

const MealPlanPage: React.FC = () => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newMealPlan, setNewMealPlan] = useState<MealPlan>({
    id: "",
    name: "",
    meals: defaultMeals,
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // ✅ Fetch all meal plans
  useEffect(() => {
    const fetchMealPlans = async () => {
      try {
        const res = await api.get("http://localhost:3001/meal-plan");
        setMealPlans(res.data.data || []);
      } catch (err) {
        console.error("Error fetching meal plans:", err);
      }
    };
    fetchMealPlans();
  }, []);

  // ✅ Handle edit field change
  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    day: string,
    field: keyof Meal
  ) => {
    if (!selectedPlan) return;
    const updatedMeals = selectedPlan.meals.map((m) =>
      m.day === day ? { ...m, [field]: e.target.value } : m
    );
    setSelectedPlan({ ...selectedPlan, meals: updatedMeals });
  };

  // ✅ Handle new plan field change
  const handleNewChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    day: string,
    field: keyof Meal
  ) => {
    const updatedMeals = newMealPlan.meals.map((m) =>
      m.day === day ? { ...m, [field]: e.target.value } : m
    );
    setNewMealPlan({ ...newMealPlan, meals: updatedMeals });
  };

  // ✅ Save edited meal plan (PATCH)
  const handleSaveEdit = async () => {
    if (!selectedPlan) return;
    try {
      const res = await api.patch(
        `http://localhost:3001/meal-plan/${selectedPlan.id}`,
        {
          name: selectedPlan.name,
          meals: selectedPlan.meals,
        }
      );
      setMealPlans((prev) =>
        prev.map((mp) => (mp.id === selectedPlan.id ? res.data.data : mp))
      );
      setSelectedPlan(null);
    } catch (err) {
      console.error("Error updating meal plan:", err);
    }
  };

  // ✅ Create new meal plan (POST)
  const handleCreateMealPlan = async () => {
    try {
      const res = await api.post("http://localhost:3001/meal-plan", {
        name: newMealPlan.name,
        meals: newMealPlan.meals,
      });
      setMealPlans([...mealPlans, res.data.data]);
      setIsCreateModalOpen(false);
      setNewMealPlan({ id: "", name: "", meals: defaultMeals });
    } catch (err) {
      console.error("Error creating meal plan:", err);
    }
  };

  // ✅ Delete Confirmation Modal
  const handleDeleteClick = (id: string) => {
    setSelectedPlanId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedPlanId) return;
    try {
      await api.delete(`http://localhost:3001/meal-plan/${selectedPlanId}`);
      setMealPlans(mealPlans.filter((mp) => mp.id !== selectedPlanId));
      setShowConfirm(false);
      setSelectedPlanId(null);
    } catch (err) {
      console.error("Error deleting meal plan:", err);
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setSelectedPlanId(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader />

      <main className="flex-1 p-6">
        {/* Header with Create Button */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Hostel Mess Meal Plans</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            + Create Meal Plan
          </button>
        </div>

        {/* Meal Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mealPlans.map((plan) => (
            <div
              key={plan.id}
              className="border rounded p-4 relative shadow hover:shadow-lg bg-white"
            >
              <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>

              <div className="text-sm">
                {plan.meals.map((meal) => (
                  <div key={meal.day} className="mb-1">
                    <strong className="capitalize">{meal.day}:</strong>{" "}
                    <span>
                      {meal.breakfast}, {meal.lunch}, {meal.dinner}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-3">
                <button
                  onClick={() => setSelectedPlan(plan)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(plan.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ✏️ Edit Modal */}
        {selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-3xl">
              <h2 className="text-xl font-bold mb-4">
                Edit Meal Plan - {selectedPlan.name}
              </h2>

              {selectedPlan.meals.map((meal) => (
                <div key={meal.day} className="mb-3">
                  <h3 className="font-semibold capitalize">{meal.day}</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={meal.breakfast}
                      onChange={(e) =>
                        handleEditChange(e, meal.day, "breakfast")
                      }
                      placeholder="Breakfast"
                      className="border p-2 rounded"
                    />
                    <input
                      type="text"
                      value={meal.lunch}
                      onChange={(e) => handleEditChange(e, meal.day, "lunch")}
                      placeholder="Lunch"
                      className="border p-2 rounded"
                    />
                    <input
                      type="text"
                      value={meal.dinner}
                      onChange={(e) => handleEditChange(e, meal.day, "dinner")}
                      placeholder="Dinner"
                      className="border p-2 rounded"
                    />
                  </div>
                </div>
              ))}

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ➕ Create Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-3xl">
              <h2 className="text-xl font-bold mb-4">Create New Meal Plan</h2>

              <label className="block mb-2">
                Plan Name:
                <input
                  type="text"
                  value={newMealPlan.name}
                  onChange={(e) =>
                    setNewMealPlan({ ...newMealPlan, name: e.target.value })
                  }
                  className="border rounded w-full p-2 mt-1"
                />
              </label>

              {newMealPlan.meals.map((meal) => (
                <div key={meal.day} className="mb-3">
                  <h3 className="font-semibold capitalize">{meal.day}</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={meal.breakfast}
                      onChange={(e) =>
                        handleNewChange(e, meal.day, "breakfast")
                      }
                      placeholder="Breakfast"
                      className="border p-2 rounded"
                    />
                    <input
                      type="text"
                      value={meal.lunch}
                      onChange={(e) => handleNewChange(e, meal.day, "lunch")}
                      placeholder="Lunch"
                      className="border p-2 rounded"
                    />
                    <input
                      type="text"
                      value={meal.dinner}
                      onChange={(e) => handleNewChange(e, meal.day, "dinner")}
                      placeholder="Dinner"
                      className="border p-2 rounded"
                    />
                  </div>
                </div>
              ))}

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateMealPlan}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Create Plan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🗑️ Delete Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96 text-center">
              <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this meal plan? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={confirmDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={cancelDelete}
                  className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MealPlanPage;
