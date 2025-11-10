import { Link } from 'react-router-dom'
import { useUserRole } from '../hooks/useUserRole'

export function Navigation() {
  const { groups, isLoading } = useUserRole()

  if (isLoading) {
    return <nav className="bg-gray-800 text-white py-4">Loading...</nav>
  }

  const isSuperAdmin = groups.includes('SuperAdmin')
  const isSellerAdmin = groups.includes('SellerAdmin')
  const isYardOperator = groups.includes('YardOperator')
  const isBuyer = groups.includes('Buyer')
  const isInspector = groups.includes('Inspector')

  const canManageOrg = isSuperAdmin || isSellerAdmin
  const canManageInventory = isSuperAdmin || isSellerAdmin || isYardOperator
  const canViewSales = isSuperAdmin || isSellerAdmin || isBuyer
  const canInspect = isSuperAdmin || isInspector

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 py-4">
          <Link to="/" className="hover:bg-gray-700 px-3 py-2 rounded-md">
            Dashboard
          </Link>

          {canManageOrg && (
            <Link to="/organizations" className="hover:bg-gray-700 px-3 py-2 rounded-md">
              Organizations
            </Link>
          )}

          {canManageInventory && (
            <>
              <Link to="/boxes" className="hover:bg-gray-700 px-3 py-2 rounded-md">
                Boxes
              </Link>
              <Link to="/parts" className="hover:bg-gray-700 px-3 py-2 rounded-md">
                Parts
              </Link>
            </>
          )}

          {canViewSales && (
            <Link to="/sales" className="hover:bg-gray-700 px-3 py-2 rounded-md">
              Sales
            </Link>
          )}

          {canInspect && (
            <Link to="/inspections" className="hover:bg-gray-700 px-3 py-2 rounded-md">
              Inspections
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
