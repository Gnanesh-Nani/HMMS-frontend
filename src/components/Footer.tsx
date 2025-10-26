export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-gray-700 border-t border-gray-200 mt-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm text-gray-600">
          &copy; {currentYear} Hostel & Mess Management System. All Rights Reserved.
        </p>

        <div className="flex space-x-4 mt-2 md:mt-0">
          <a
            href="#"
            className="text-gray-600 hover:text-green-600 text-sm transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-green-600 text-sm transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-green-600 text-sm transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
