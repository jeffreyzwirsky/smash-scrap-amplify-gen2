import { Link } from 'react-router-dom'

export function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-6 py-4">
          <Link
            to="/"
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            Dashboard
          </Link>
          <Link
            to="/organizations"
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            Organizations
          </Link>
          <Link
            to="/boxes"
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            Boxes
          </Link>
        </div>
      </div>
    </nav>
  )
}
