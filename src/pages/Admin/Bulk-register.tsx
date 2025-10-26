import { useState } from "react";
import Papa from "papaparse";
import { FiUpload } from "react-icons/fi"; // install with `npm i react-icons`
import AdminHeader from "../../components/AdminHeader";
import AdminFooter from "../../components/Footer";
import api from "../../api/axiosInstance";

interface CsvRow {
  [key: string]: string;
}

export default function BulkRegister() {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [failedList, setFailedList] = useState<{ registerNo: string; message: string }[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      parseCsv(selectedFile);
    }
  };

  const parseCsv = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data as CsvRow[]);
      },
      error: (err) => {
        console.error("CSV parsing error:", err);
        setErrorMsg("Failed to parse CSV file.");
      },
    });
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
      <AdminHeader />

      <main className="flex-grow bg-gray-100 p-6 flex justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Bulk Student Registration
          </h1>

          {/* File Upload Area */}
          <div className="flex flex-col items-center mb-6">
            <label className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition">
              <FiUpload size={40} className="text-gray-400 mb-2" />
              <span className="text-gray-500">
                {file ? file.name : "Click to select a CSV file"}
              </span>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-md transition"
            >
              {loading ? "Uploading..." : "Upload CSV"}
            </button>
          </div>

          {/* Success & Error Messages */}
          {errorMsg && <p className="text-red-500 mb-2 text-center">{errorMsg}</p>}
          {successCount > 0 && (
            <p className="text-green-500 mb-4 text-center">
              {successCount} students registered successfully
            </p>
          )}

          {/* Display CSV Contents */}
          {csvData.length > 0 && (
            <div className="overflow-auto max-h-80 border border-gray-200 rounded-md p-2">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    {Object.keys(csvData[0]).map((key) => (
                      <th key={key} className="py-2 px-4 border">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {Object.values(row).map((val, i) => (
                        <td key={i} className="py-1 px-2 border text-sm">{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

      <AdminFooter />
    </div>
  );
}
