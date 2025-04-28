// src/app/(public)/layout.tsx
import { Suspense } from "react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">

      <main>
        <Suspense
          fallback={
            <div className="container mx-auto px-4 py-8 text-center">
              Loading...
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
{/* 
      <footer className="mt-12 border-t bg-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-500">
                &copy; 2025 FoodCourt Hub. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-gray-700">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700">
                Terms of Service
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer> */}
    </div>
  );
}
