import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getFiles } from '../services/api';

export default function AdminLogDesk() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await getFiles();
      // Get all files and flatten their timeline entries
      const allFiles = res.data.data?.docs || [];
      setFiles(allFiles);
    } catch (err) {
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout isAdmin={true}>
      <div className="w-full px-4 py-4">
        <div className="mb-4">
          <div className="bg-white rounded-xl shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h6 className="text-lg font-semibold text-gray-700">File Activity Records</h6>
              <p className="text-sm text-gray-500">Overview of all files and their current status</p>
            </div>
            <div className="px-0 pb-2">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Current Desk</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Last Updated</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Timeline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-6 text-center text-gray-500">Loading...</td>
                      </tr>
                    ) : files.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-6 text-center text-gray-500">No files found</td>
                      </tr>
                    ) : (
                      files.map((file) => (
                        <tr key={file._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-800">{file.subject}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {file.currentDesk?.designation || 'N/A'} - {file.currentOffice || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${file.status === 'Approved' || file.status === 'Closed' ? 'bg-green-500' :
                                file.status === 'Rejected' ? 'bg-red-500' : 'bg-yellow-500'
                              }`}>
                              {file.status || 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {file.creationDate ? new Date(file.creationDate).toLocaleDateString('en-US') : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {file.dateOfLastForward ? new Date(file.dateOfLastForward).toLocaleDateString('en-US') : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-700">
                            {file.timeline?.length || 0} entries
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
