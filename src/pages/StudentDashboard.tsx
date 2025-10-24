import StudentHeader from "../components/StudentHeader";
import Footer from "../components/Footer";
export default function StudentDashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      <StudentHeader/>

      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold">Welcome to the student dashboard</h1>
        {/* student dashboard content */}
      </main>
      <Footer/>
    </div>
  );
}
