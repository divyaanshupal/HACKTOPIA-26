import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * ProtectedRoute - Guards routes based on user role
 * 
 * Usage:
 * - requiredRole="admin" - Only Admin, DEPT_HEAD, OP_HEAD can access
 * - requiredRole="user" - Only GENERAL users can access
 * - requiredRole="any" - Any logged-in user can access
 */
export default function ProtectedRoute({ children, requiredRole = 'any' }) {
    const { user, loading } = useAuth();

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    // Not logged in - redirect to login
    if (!user) {
        return <Navigate to="/" replace />;
    }

    const userRole = user.role;
    const isAdmin = userRole === 'Admin' || userRole === 'DEPT_HEAD' || userRole === 'OP_HEAD';

    // Check role requirements
    if (requiredRole === 'admin' && !isAdmin) {
        // GENERAL user trying to access admin page - redirect to user dashboard
        return <Navigate to="/userDashboard" replace />;
    }

    if (requiredRole === 'user' && isAdmin) {
        // Admin trying to access user-only page - redirect to admin dashboard
        return <Navigate to="/adminDashboard" replace />;
    }

    // All checks passed - render the children
    return children;
}
