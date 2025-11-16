import "./globals.css";
import ClientLayout from "./components/ClientLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "react-hot-toast"; 

export const metadata = {
  title: "Chuloenterprise",
  description: "Buy verified social media accounts",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="overflow-x-hidden mt-16 bg-gray-50 text-gray-900">
        {/*  Wrap everything with AuthProvider */}
        <AuthProvider>
          <ClientLayout>
            {children}
          </ClientLayout>

          {/*  Global toast notifications */}
          <Toaster position="top-right" reverseOrder={false} />
        </AuthProvider>
      </body>
    </html>
  );
}
