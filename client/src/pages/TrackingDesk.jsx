import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Search,
  Filter,
  RotateCcw,
  FileText,
  ArrowRight
} from 'lucide-react';

export default function TrackingDesk() {
  const [files, setFiles] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [officeFilter, setOfficeFilter] = useState('NA');
  const [deptFilter, setDeptFilter] = useState('NA');

  useEffect(() => {
    fetchAllFiles();
  }, []);

  const fetchAllFiles = async () => {
    try {
      const res = await api.get('/files/getAllFiles');
      setFiles(res.data.data?.docs || []);
    } catch (err) {
      console.error('Error fetching files:', err);
      toast.error('Failed to fetch files');
    }
  };

  const handleSearchById = async (e) => {
    e.preventDefault();
    if (!searchId) return;
    const toastId = toast.loading('Searching...');
    try {
      const res = await api.get(`/files/getAFile/${searchId}`);
      if (res.data.data) {
        setFiles([res.data.data]);
        toast.dismiss(toastId);
      } else {
        toast.error('File not found', { id: toastId });
        setFiles([]);
      }
    } catch (err) {
      toast.error('File not found', { id: toastId });
      setFiles([]);
    }
  };

  const handleFilterSearch = async (e) => {
    e.preventDefault();
    try {
      const params = {};
      if (officeFilter !== 'NA') params.currentOffice = officeFilter;
      if (deptFilter !== 'NA') params.currentBranch = deptFilter;
      const res = await api.get('/files/fileFilter', { params });
      setFiles(res.data.files || []);
    } catch (err) {
      console.error('Error searching files:', err);
    }
  };

  const removeFilters = () => {
    setOfficeFilter('NA');
    setDeptFilter('NA');
    fetchAllFiles();
  };

  const offices = [
    'Administrative Block', 'Academic Block', 'Library', 'Sports Complex',
    'Hostel', 'Placement Cell', 'Research Center', 'Transport Section', 'Security Office'
  ];

  const departments = [
    'Computer Science', 'Information Technology', 'Electronics & Comm.',
    'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering',
    'Registrar Office', 'Accounts Section', 'Exam Cell', 'Student Section',
    'Humanities', 'Mathematics'
  ];

  return (
    <Layout isAdmin={true}>
      <div className="w-full px-6 py-6 font-sans text-slate-700">

        {/* --- Top Search Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

          {/* Card 1: Search by ID (Takes up 4 cols) */}
          <div className="lg:col-span-4 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Search size={20} />
                </div>
                <h4 className="text-lg font-bold text-slate-800">Search by ID</h4>
              </div>

              <form onSubmit={handleSearchById}>
                <label className="block text-xs font-bold text-slate uppercase tracking-wider mb-2">
                  File ID
                </label>
                <input
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  type="text"
                  placeholder="Enter ID..."
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                />
                <button
                  type="submit"
                  className="mt-4 w-full py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-900 transition-colors shadow-lg shadow-slate-200"
                >
                  Search
                </button>
              </form>
            </div>
          </div>

          {/* Card 2: Filter Search (Takes up 8 cols) */}
          <div className="lg:col-span-8 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <Filter size={20} />
                </div>
                <h4 className="text-lg font-bold text-slate-800">Filter Files</h4>
              </div>
            </div>

            <form onSubmit={handleFilterSearch}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate uppercase tracking-wider mb-2">
                    Current Office
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm text-slate-600 appearance-none"
                    value={officeFilter}
                    onChange={(e) => setOfficeFilter(e.target.value)}
                  >
                    <option value="NA">No Office Selected</option>
                    {offices.map((office) => (
                      <option key={office} value={office}>{office}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate uppercase tracking-wider mb-2">
                    Current Branch
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm text-slate-600 appearance-none"
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                  >
                    <option value="NA">No Branch Selected</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-900 transition-colors shadow-lg shadow-slate-200"
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={removeFilters}
                  className="flex items-center gap-2 px-6 py-2.5 border border-slate-200 text-slate rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Results Table */}
        <div className="mt-4"></div>
        <div className="mb-4">
          <div className="bg-white/80 rounded-xl shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-wrap">
                <div className="w-full lg:w-1/2">
                  <h6 className="text-lg font-semibold text-gray-700">Result of your Search</h6>
                </div>
              </div>
            </div>
            <div className="px-0 pb-2">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider opacity-70">Subject</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider opacity-70">File ID</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider opacity-70">Current Office</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider opacity-70">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {files.map((file) => (
                      <tr className="text-gray-800 hover:bg-gray-50" key={file._id || file.id}>
                        <td className="px-4 py-3 font-medium">{file.subject}</td>
                        <td className="px-4 py-3">{file._id || file.id}</td>
                        <td className="px-4 py-3">{file.currentOffice}</td>
                        <td className="px-4 py-3 text-center">
                          <Link to={`/trackfile/${file._id}`}>
                            <button className="px-3 py-1 border border-gray-700 text-gray-700 rounded-lg hover:bg-gray-100 transition" type="button">
                              <svg className="w-4 h-4 inline" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
                              </svg>
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <footer className="py-4"></footer>
      </div>
    </Layout>
  );
}