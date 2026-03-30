import Navbar from "@/src/components/Navbar";
import { ProtectedRoute } from "@/src/components/ProtectedRoute";
import Sidebar from "@/src/components/SideBar";
import { AppDataProviders } from "@/src/context/AppDataProviders";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppDataProviders>
        <ProtectedRoute>
          <div className="h-screen w-full flex overflow-hidden bg-gray-50 font-sans rounded-lg">
            {/* Sidebar - Positioned self-containedly */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen transition-all duration-300 md:ml-64 rounded-lg">
              {/* Navbar Header */}
              <header className="no-print h-16 bg-white rounded-lg z-20 flex items-center px-4 border-b border-gray-100 shadow-sm transition-all md:rounded-br-[2.5rem]">
                <Navbar />
              </header>

              {/* Page Content */}
              <main className="flex-1 p-3 md:p-6 lg:p-8 bg-gray-50 flex-1 overflow-auto">
                <div className="h-full bg-white rounded-lg overflow-y-auto ">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </ProtectedRoute>
      </AppDataProviders>
    </>
  );
}
