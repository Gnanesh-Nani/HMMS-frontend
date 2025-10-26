import { useEffect } from "react";

interface PopupAlertProps {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}

export default function PopupAlert({ type, message, onClose }: PopupAlertProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-5 right-5 z-[9999]">
      <div
        className={`px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300
        ${type === "success" ? "bg-green-600" : "bg-red-500"}`}
      >
        {message}
      </div>
    </div>
  );
}
