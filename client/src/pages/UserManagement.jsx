import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getUsers, promoteUser, verifyUser, assignDesk, getDesks } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [desks, setDesks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [selectedDesk, setSelectedDesk] = useState('');
  const { user: currentUser } = useAuth();

  // Loading states for actions
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, desksRes] = await Promise.all([getUsers(), getDesks()]);
      setUsers(usersRes.data.data?.docs || []);
      setDesks(desksRes.data.data?.docs || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Role Hierarchy Levels
  const roleLevels = {
    'GENERAL': 0,
    'OP_HEAD': 1,
    'DEPT_HEAD': 2,
    'Admin': 3
  };

  // Get available roles strictly lower than current user's role
  const getPromotableRoles = () => {
    if (!currentUser) return [];

    const currentLevel = roleLevels[currentUser.role] || 0;

    return Object.keys(roleLevels).filter(role => roleLevels[role] < currentLevel);
  };

  const canModifyUser = (targetUser) => {
    if (!currentUser || !targetUser) return false;
    const currentLevel = roleLevels[currentUser.role] || 0;
    const targetLevel = roleLevels[targetUser.role] || 0;
    return currentLevel > targetLevel;
  };

  const handlePromote = async () => {
    if (!selectedUser || !newRole) return;
    setActionLoading(true);
    const toastId = toast.loading('Promoting user...');
    try {
      const res = await promoteUser(selectedUser._id, newRole);
      if (res.data.status === 'success') {
        toast.success('User promoted successfully', { id: toastId });
        setShowPromoteModal(false);
        setSelectedUser(null);
        setNewRole('');
        fetchData();
      }
    } catch (err) {
      toast.error('Error promoting user: ' + (err.response?.data?.message || err.message), { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerify = async (userId) => {
    const toastId = toast.loading('Verifying user...');
    try {
      const res = await verifyUser(userId);
      if (res.data.status === 'success') {
        toast.success('User verified successfully', { id: toastId });
        fetchData();
      }
    } catch (err) {
      toast.error('Error verifying user: ' + (err.response?.data?.message || err.message), { id: toastId });
    }
  };

  const handleAssignDesk = async () => {
    if (!selectedUser || !selectedDesk) return;
    setActionLoading(true);
    const toastId = toast.loading('Assigning desk...');
    try {
      const res = await assignDesk(selectedUser._id, selectedDesk);
      if (res.data.status === 'success') {
        toast.success('Desk assigned successfully', { id: toastId });
        setShowAssignModal(false);
        setSelectedUser(null);
        setSelectedDesk('');
        fetchData();
      }
    } catch (err) {
      toast.error('Error assigning desk: ' + (err.response?.data?.message || err.message), { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const openPromoteModal = (user) => {
    setSelectedUser(user);
    setNewRole('');
    setShowPromoteModal(true);
  };

  const openAssignModal = (user) => {
    setSelectedUser(user);
    setSelectedDesk('');
    setShowAssignModal(true);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-600';
      case 'DEPT_HEAD':
        return 'bg-blue-600';
      case 'OP_HEAD':
        return 'bg-green-600';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Layout isAdmin={true}>
        <div className="w-full px-4 py-4">
          <p className="text-gray-600">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAdmin={true}>
      <div className="w-full px-4 py-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-white">Manage user roles, verification, and desk assignments</p>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h6 className="text-lg font-semibold text-gray-700">All Users</h6>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Desk</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Verified</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{user.name}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {user.currentDesk ? `${user.currentDesk.designation} - ${user.currentDesk.office}` : 'Not Assigned'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.verified ? (
                        <span className="text-green-600">✓ Verified</span>
                      ) : (
                        <span className="text-yellow-600">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        {/* Promote Button - Only show if current user can promote */}
                        {getPromotableRoles().length > 0 && user._id !== currentUser?._id && (
                          <button
                            onClick={() => openPromoteModal(user)}
                            className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                          >
                            Promote
                          </button>
                        )}

                        {/* Verify Button - Only for OP_HEAD role */}
                        {currentUser?.role === 'OP_HEAD' && !user.verified && (
                          <button
                            onClick={() => handleVerify(user._id)}
                            className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
                          >
                            Verify
                          </button>
                        )}

                        {/* Assign Desk Button - Only for Admin */}
                        {currentUser?.role === 'Admin' && (
                          <button
                            onClick={() => openAssignModal(user)}
                            className="px-3 py-1 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition"
                          >
                            Assign Desk
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Promote Modal */}
        {showPromoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md bg-white rounded-xl shadow-xl">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h5 className="text-xl font-semibold text-gray-800">Promote User</h5>
                <button
                  onClick={() => setShowPromoteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <p className="mb-4 text-gray-600">
                  Promoting <strong>{selectedUser?.name}</strong> (current role: {selectedUser?.role})
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Role</option>
                    {getPromotableRoles().map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handlePromote}
                  disabled={!newRole}
                  className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  Promote User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Desk Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md bg-white rounded-xl shadow-xl">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h5 className="text-xl font-semibold text-gray-800">Assign Desk</h5>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <p className="mb-4 text-gray-600">
                  Assigning desk to <strong>{selectedUser?.name}</strong>
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Desk</label>
                  <select
                    value={selectedDesk}
                    onChange={(e) => setSelectedDesk(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Desk</option>
                    {desks.map((desk) => (
                      <option key={desk._id} value={desk._id}>
                        {desk.designation} - {desk.office}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAssignDesk}
                  disabled={!selectedDesk}
                  className="w-full px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50"
                >
                  Assign Desk
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
