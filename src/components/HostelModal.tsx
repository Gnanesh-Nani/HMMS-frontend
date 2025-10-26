import React from "react";
export interface MealPlan {
    id: string;
    name: string;
}

export interface Hostel {
    id: string;
    name: string;
    type: string;
    totalBlocks: number;
    warden: string;
    description: string;
    mealPlan: MealPlan | null;
}

interface HostelModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    editingHostel: Hostel | null;
    mealPlans: MealPlan[];
    formData: any;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export default function HostelModal({
    show,
    onClose,
    onSubmit,
    editingHostel,
    mealPlans,
    formData,
    setFormData
}: HostelModalProps) {
    if (!show) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4 text-center">
                    {editingHostel ? "Edit Hostel" : "Add Hostel"}
                </h2>

                <form
                    onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}
                    className="space-y-4"
                >
                    <input
                        type="text"
                        name="name"
                        placeholder="Hostel Name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required
                    />

                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    >
                        <option value="boys">Boys</option>
                        <option value="girls">Girls</option>
                    </select>

                    <input
                        type="number"
                        name="totalBlocks"
                        placeholder="Total Blocks"
                        value={formData.totalBlocks}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        min="1"
                    />

                    <input
                        type="text"
                        name="warden"
                        placeholder="Warden Name"
                        value={formData.warden}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />

                    <textarea
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />

                    <select
                        name="mealPlan"
                        value={formData.mealPlan}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    >
                        <option value="">Select Meal Plan</option>
                        {mealPlans.map((plan) => (
                            <option key={plan.id} value={plan.id}>
                                {plan.name}
                            </option>
                        ))}
                    </select>

                    <div className="flex justify-end space-x-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            {editingHostel ? "Update" : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
