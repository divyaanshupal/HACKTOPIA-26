import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getFiles } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { StatusPieChart, ActivityLineChart, DelayedPieChart, StatCard } from '../components/Charts';

export default function UserAnalytics() {
    const { user } = useAuth();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserFiles();
    }, []);

    const fetchUserFiles = async () => {
        try {
            const res = await getFiles();
            const allFiles = res.data.data?.docs || [];
            // Show all files the user has access to (files they created or are currently handling)
            const userId = user?._id || user?.id;
            const userFiles = allFiles.filter(f => {
                const createdById = f.createdBy?._id || f.createdBy;
                const currentUserId = f.currentUserId?._id || f.currentUserId || f.currentDesk?._id;
                return createdById === userId || currentUserId === userId;
            });
            setFiles(userFiles);
        } catch (err) {
            console.error('Error fetching files:', err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats
    const pendingCount = files.filter(f => f.status === 'Pending').length;
    const approvedCount = files.filter(f => f.status === 'Approved' || f.status === 'Closed').length;
    const rejectedCount = files.filter(f => f.status === 'Rejected').length;
    const delayedCount = files.filter(f => f.delayed).length;

    if (loading) {
        return (
            <Layout isAdmin={false}>
                <div className="w-full px-4 py-8 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout isAdmin={false}>
            <div className="w-full px-4 py-6">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        My Analytics Dashboard
                    </h1>
                    <p className="text-gray-500 mt-2">Track your personal file activity and performance</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    <StatCard
                        title="My Files"
                        value={files.length}
                        color="from-indigo-500 to-purple-600"
                        subValue="Total created/managed"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                    />
                    <StatCard
                        title="Pending"
                        value={pendingCount}
                        color="from-amber-400 to-orange-500"
                        subValue="Awaiting action"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <StatCard
                        title="Approved"
                        value={approvedCount}
                        color="from-emerald-400 to-teal-500"
                        subValue="Successfully closed"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <StatCard
                        title="Rejected"
                        value={rejectedCount}
                        color="from-rose-400 to-red-500"
                        subValue="Returned files"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Status Distribution */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <span className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mr-3 animate-pulse"></span>
                            My File Status
                        </h3>
                        <div className="h-72">
                            {files.length > 0 ? (
                                <StatusPieChart files={files} />
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-gray-400 text-lg">No files yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Activity Timeline */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <span className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mr-3 animate-pulse"></span>
                            My Activity Trend
                        </h3>
                        <div className="h-72">
                            {files.length > 0 ? (
                                <ActivityLineChart files={files} />
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-gray-400 text-lg">No activity data</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Deadline Performance */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <span className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mr-3 animate-pulse"></span>
                            My Deadline Compliance
                        </h3>
                        <div className="h-72">
                            {files.length > 0 ? (
                                <DelayedPieChart files={files} />
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-gray-400 text-lg">No deadline data</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Summary Card */}
                    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl shadow-lg p-6 text-white">
                        <h3 className="text-lg font-bold mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Quick Insights
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                <p className="text-sm opacity-80">Success Rate</p>
                                <p className="text-3xl font-bold">
                                    {files.length > 0 ? Math.round((approvedCount / files.length) * 100) : 0}%
                                </p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                <p className="text-sm opacity-80">On-Time Delivery</p>
                                <p className="text-3xl font-bold">
                                    {files.length > 0 ? Math.round(((files.length - delayedCount) / files.length) * 100) : 100}%
                                </p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                <p className="text-sm opacity-80">Active Files</p>
                                <p className="text-3xl font-bold">{pendingCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Files Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                        <h3 className="text-lg font-bold text-gray-800">Recent Files</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Subject</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Created</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Current Location</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {files.slice(0, 5).map((file) => (
                                    <tr key={file._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-800">{file.subject}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${file.status === 'Approved' || file.status === 'Closed' ? 'bg-emerald-100 text-emerald-700' :
                                                file.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {file.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {file.creationDate ? new Date(file.creationDate).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{file.currentOffice || 'N/A'}</td>
                                    </tr>
                                ))}
                                {files.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                                            No files found. Create your first file to see analytics!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
