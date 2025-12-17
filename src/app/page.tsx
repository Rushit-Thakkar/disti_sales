import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 max-w-xl px-4">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">DistiSales Portal</h1>
        <p className="text-lg text-gray-600">
          The all-in-one platform for Distributors and Salesmen to manage orders and sales efficiently.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Go to Login
          </Link>
        </div>

        <div className="pt-8 text-sm text-gray-500 border-t mt-8">
          <p>Secure Role-Based Access • Real-time Orders • Inventory Tracking</p>
        </div>
      </div>
    </div>
  );
}
