// src/pages/PublicVerifyNoDue.tsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axiosInstance";

interface CertificateData {
  studentName: string;
  registerNo: string;
  department: string;
  purpose: string;
  generatedAt: string;
  validTill: string;
  certificateId: string;
}

interface VerificationResponse {
  isValid: boolean;
  certificate?: CertificateData;
  message: string;
}

export default function PublicVerifyNoDue() {
  const { token } = useParams<{ token: string }>();
  const [verificationData, setVerificationData] = useState<VerificationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyCertificate = async () => {
      if (!token) {
        setError("No verification token provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/no-due/verify/${token}`);
        
        if (!response.data.error) {
          setVerificationData(response.data.data);
        } else {
          setError(response.data.message || "Failed to verify certificate");
        }
      } catch (err: any) {
        console.error("Verification error:", err);
        setError(err.response?.data?.message || "Error verifying certificate");
      } finally {
        setLoading(false);
      }
    };

    verifyCertificate();
  }, [token]);

  const getStatusColor = (isValid: boolean) => {
    return isValid ? "text-green-600" : "text-red-600";
  };

  const getStatusBgColor = (isValid: boolean) => {
    return isValid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200";
  };

  const getStatusIconColor = (isValid: boolean) => {
    return isValid ? "bg-green-500" : "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <h1 className="text-3xl font-bold text-gray-800 hover:text-indigo-600 transition-colors">
              Hostel & Mess Management System
            </h1>
          </Link>
          <h2 className="text-2xl font-semibold text-gray-700">No Due Certificate Verification</h2>
          <p className="text-gray-600 mt-2">
            Verify the authenticity of No Due certificates issued by our institution
          </p>
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Verifying certificate...</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 text-red-500">
                <svg fill="currentColor" viewBox="0 0 20 20" className="w-full h-full">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-red-600 mb-2">Verification Failed</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Return to Home
              </Link>
            </div>
          )}

          {verificationData && !loading && (
            <div className="space-y-8">
              {/* Status Banner */}
              <div className={`border-2 rounded-xl p-6 ${getStatusBgColor(verificationData.isValid)}`}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusIconColor(verificationData.isValid)}`}>
                      {verificationData.isValid ? (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold ${getStatusColor(verificationData.isValid)}`}>
                        {verificationData.isValid ? "Certificate Verified" : "Certificate Invalid"}
                      </h3>
                      <p className="text-gray-600 text-lg mt-1">{verificationData.message}</p>
                    </div>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-sm font-medium text-gray-500">Verification ID</p>
                    <p className="font-mono text-gray-800 text-lg font-semibold bg-gray-100 px-3 py-1 rounded">
                      {token?.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Certificate Details */}
              {verificationData.certificate && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Student Information */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                        Student Information
                      </h4>
                      <div className="space-y-4">
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-600 mb-1">Full Name</label>
                          <p className="text-gray-800 text-lg font-medium">{verificationData.certificate.studentName}</p>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-600 mb-1">Register Number</label>
                          <p className="text-gray-800 font-mono text-lg bg-blue-50 px-3 py-2 rounded border border-blue-100">
                            {verificationData.certificate.registerNo}
                          </p>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-600 mb-1">Department</label>
                          <p className="text-gray-800 text-lg">{verificationData.certificate.department}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                        Certificate Details
                      </h4>
                      <div className="space-y-4">
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-600 mb-1">Purpose</label>
                          <p className="text-gray-800 text-lg bg-white px-3 py-2 rounded border border-gray-200">
                            {verificationData.certificate.purpose}
                          </p>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-600 mb-1">Certificate ID</label>
                          <p className="text-gray-800 font-mono text-lg bg-yellow-50 px-3 py-2 rounded border border-yellow-100">
                            {verificationData.certificate.certificateId}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Validity Information */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                        Validity Information
                      </h4>
                      <div className="space-y-4">
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-600 mb-1">Generated On</label>
                          <p className="text-gray-800 text-lg bg-white px-3 py-2 rounded border border-gray-200">
                            {new Date(verificationData.certificate.generatedAt).toLocaleDateString('en-IN', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-600 mb-1">Valid Until</label>
                          <p className="text-gray-800 text-lg bg-white px-3 py-2 rounded border border-gray-200">
                            {new Date(verificationData.certificate.validTill).toLocaleDateString('en-IN', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-sm font-semibold text-gray-600 mb-1">Validity Status</label>
                          <p className={`text-lg font-bold px-3 py-2 rounded border ${
                            verificationData.isValid 
                              ? 'text-green-800 bg-green-100 border-green-200' 
                              : 'text-red-800 bg-red-100 border-red-200'
                          }`}>
                            {verificationData.isValid ? 'Valid Certificate' : 'Expired Certificate'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info Box */}
                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                      <h4 className="text-lg font-bold text-blue-800 mb-3">About This Certificate</h4>
                      <p className="text-blue-700 text-sm">
                        This No Due Certificate verifies that the student has cleared all outstanding dues 
                        related to hostel accommodation, mess charges, and other associated fees with the institution.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>
            For any issues with certificate verification, please contact the institution administration.
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} Hostel & Mess Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}