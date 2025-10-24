import { useState } from "react";
import api from "../../api/axiosInstance";
import AdminHeader from "../../components/AdminHeader";
import AdminFooter from "../../components/Footer";

export default function BulkRegister() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [failedList, setFailedList] = useState<{ registerNo: string; message: string }[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMsg("Please select a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setErrorMsg("");
      const res = await api.post("/admin/register/bulk", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success !== undefined) setSuccessCount(res.data.success);
      if (res.data.failed) setFailedList(res.data.failed);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Bulk registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Admin Header */}
      <AdminHeader />

      {/* Page Content */}
      <main className="flex-grow bg-gray-100 p-6 flex justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Bulk Student Registration
          </h1>

          {/* Upload Section */}
          <div className="flex flex-col items-center space-y-4 mb-6">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="border border-gray-300 rounded-md px-4 py-2 w-full"
            />
            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-md transition"
            >
              {loading ? "Uploading..." : "Upload CSV"}
            </button>
          </div>

          {/* Success & Error Messages */}
          {errorMsg && <p className="text-red-500 mb-2 text-center">{errorMsg}</p>}
          {successCount > 0 && (
            <p className="text-green-500 mb-4 text-center">{successCount} students registered successfully</p>
          )}

          {/* Failed List */}
          {failedList.length > 0 && (
            <div className="mt-4">
              <h2 className="font-semibold mb-2 text-gray-700 text-center">Failed Entries</h2>
              <div className="overflow-auto max-h-60 border border-gray-200 rounded-md p-2">
                <ul className="divide-y divide-gray-200">
                  {failedList.map((item) => (
                    <li key={item.registerNo} className="py-1 flex justify-between">
                      <span className="font-medium">{item.registerNo}</span>
                      <span className="text-red-500">{item.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Admin Footer */}
      <AdminFooter />
    </div>
  );
}
