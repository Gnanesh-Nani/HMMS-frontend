export default function Footer() {
    const currentYear = new Date().getFullYear();
  
    return (
      <footer className="bg-green-600 text-white mt-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">
            &copy; {currentYear} Hostel & Mess Management System. All Rights Reserved.
          </p>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <a
              href="#"
              className="text-white hover:text-gray-200 text-sm"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-white hover:text-gray-200 text-sm"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-white hover:text-gray-200 text-sm"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    );
  }
  