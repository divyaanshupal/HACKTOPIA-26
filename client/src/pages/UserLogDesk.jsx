import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getFiles } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function UserLogDesk() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchMyFiles();
  }, [user]);

  const fetchMyFiles = async () => {
    try {
      const res = await getFiles();
      const allFiles = res.data.data?.docs || [];
      // Filter to show files the current user has worked on
      const myFiles = user ? allFiles.filter(f => f.currentUserId === user._id) : [];
      setFiles(myFiles);
    } catch (err) {
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout isAdmin={false}>
      <div className="w-full px-4 py-4">
        <div className="mb-4">
          <div className="bg-white/90 rounded-xl shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h6 className="text-lg font-semibold text-gray-700">Your File Activity</h6>
              <p className="text-sm text-gray-500">Files currently assigned to you</p>
            </div>
            <div className="px-0 pb-2">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">From</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Received</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Expected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-6 text-center text-gray-500">Loading...</td>
                      </tr>
                    ) : files.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-6 text-center text-gray-500">No files assigned to you</td>
                      </tr>
                    ) : (
                      files.map((file) => (
                        <tr key={file._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-800">{file.subject}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {file.previousDesk?.designation || 'Origin'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${
                              file.status === 'Approved' || file.status === 'Closed' ? 'bg-green-500' :
                              file.status === 'Rejected' ? 'bg-red-500' : 'bg-yellow-500'
                            }`}>
                              {file.status || 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {file.dateOfLastForward ? new Date(file.dateOfLastForward).toLocaleDateString('en-US') : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {file.expectedDate ? new Date(file.expectedDate).toLocaleDateString('en-US') : 'N/A'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

