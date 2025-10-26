interface Props {
  show: boolean;
  receiptUrl?: string | null;
  error?: string | null;
  onClose: () => void;
}

export default function StripeSuccessModal({ show, receiptUrl, error, onClose }: Props) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md text-center animate-fadeIn">
        {receiptUrl ? (
          <>
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Payment Successful!
            </h2>
            <p className="mb-4 text-gray-700">
              Your payment has been successfully verified.
            </p>
            <a
              href={receiptUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition mb-4 inline-block"
            >
              View Receipt
            </a>
            <br />
            <button
              onClick={onClose}
              className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Close
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Payment Verification Failed
            </h2>
            <p className="mb-4 text-gray-700">{error || "Something went wrong."}</p>
            <button
              onClick={onClose}
              className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
