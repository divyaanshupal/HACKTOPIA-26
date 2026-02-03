import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getUsers, getDesks, handleTransfer } from '../services/api';
import toast from 'react-hot-toast';

export default function HandleTransferDesk() {
  const [users, setUsers] = useState([]);
  const [transferForm, setTransferForm] = useState({
    userId: '',
    newDeskId: '',
  });
  const [desks, setDesks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, desksRes] = await Promise.all([
        getUsers(),
        getDesks(),
      ]);
      // Backend returns 'docs' array
      setUsers(usersRes.data.data?.docs || []);
      setDesks(desksRes.data.data?.docs || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to fetch data');
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Transferring user...');
    try {
      // Find the current user on the selected desk to get currentUserId
      const selectedDesk = desks.find(d => d._id === transferForm.newDeskId);
      const currentUserId = selectedDesk?.user?._id || selectedDesk?.user;

      const res = await handleTransfer(
        currentUserId,
        transferForm.userId,
        transferForm.newDeskId
      );
      if (res.data.status === 'Success') {
        toast.success('User transferred successfully', { id: toastId });
        setTransferForm({ userId: '', newDeskId: '' });
        fetchData();
      }
    } catch (err) {
      toast.error('Error transferring user: ' + (err.response?.data?.messege || err.message), { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout isAdmin={true}>
      <div className="w-full px-4 py-4">
        <div className="flex flex-wrap -mx-2">
          {/* Transfer User Card */}
          <div className="w-full xl:w-1/2 px-2 mb-4">
            <div className="bg-white rounded-xl shadow-md">
              <div className="relative p-3 pt-2">
                <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div className="text-right pt-1">
                  <h4 className="text-xl font-semibold text-gray-800">Transfer User to New Desk</h4>
                </div>
              </div>
              <hr className="border-gray-300" />
              <div className="p-4">
                <form onSubmit={handleTransferSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={transferForm.userId}
                      onChange={(e) => setTransferForm({ ...transferForm, userId: e.target.value })}
                      required
                    >
                      <option value="">Select User</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name} - {user.currentDesk?.designation || 'No Desk'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select New Desk</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={transferForm.newDeskId}
                      onChange={(e) => setTransferForm({ ...transferForm, newDeskId: e.target.value })}
                      required
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
                    disabled={loading}
                    className={`px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-lg font-medium hover:shadow-lg transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} type="submit">
                    {loading ? 'Processing...' : 'Transfer'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Current Users List */}
          <div className="w-full xl:w-1/2 px-2">
            <div className="bg-white rounded-xl shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h6 className="text-lg font-semibold text-gray-700">Current User Assignments</h6>
              </div>
              <div className="px-0 pb-2">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider opacity-70">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider opacity-70">Desk</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider opacity-70">Office</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-700">{user.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{user.currentDesk?.designation || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{user.currentDesk?.office || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
