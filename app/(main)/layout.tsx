import Navbar from "@/src/components/Navbar";
import { ProtectedRoute } from "@/src/components/ProtectedRoute";
import Sidebar from "@/src/components/SideBar";
import { AppDataProviders } from "@/src/context/AppDataProviders";

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>

        <AppDataProviders>
            <ProtectedRoute>
                <div className="h-screen w-screen overflow-hidden">
                    {/* Sidebar */}
                    <div className="fixed left-0 top-0 h-full w-64 bg-gray-700 text-white">
                        <Sidebar />
                    </div>

                    {/* Navbar */}
                    <div className="fixed top-0 left-72 right-0 h-16 bg-white shadow z-10 flex items-center px-4">
                        <Navbar />
                    </div>

                    {/* Main Content */}
                    <div className="ml-64 mt-16 h-[calc(100vh-4rem)] overflow-y-auto bg-gray-100 p-4">
                        {children}
                    </div>
                </div>
            </ProtectedRoute>
        </AppDataProviders>

    </>;
}