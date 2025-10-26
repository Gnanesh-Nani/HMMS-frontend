import AdminHeader from "../../components/AdminHeader";
import Footer from "../../components/Footer";

export default function AdminDashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader />

      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold">Welcome, Admin!</h1>
        {/* Admin dashboard content */}
      </main>
      <Footer/>
    </div>
  );
}
