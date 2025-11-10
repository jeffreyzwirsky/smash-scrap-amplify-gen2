export function Boxes() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Box Inventory</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Add New Box
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Box inventory listing will be implemented here with GraphQL queries.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          This page will display all boxes for the user's organization with filters and search.
        </p>
      </div>
    </div>
  )
}
