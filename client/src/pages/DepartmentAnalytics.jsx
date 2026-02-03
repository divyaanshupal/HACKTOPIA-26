import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getFiles } from '../services/api';
import { StatusPieChart, OfficeBarChart, BranchBarChart, ActivityLineChart, DelayedPieChart, StatCard } from '../components/Charts';

export default function DepartmentAnalytics() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllFiles();
    }, []);

    const fetchAllFiles = async () => {
        try {
            const res = await getFiles();
            const allFiles = res.data.data?.docs || [];
            setFiles(allFiles);
        } catch (err) {
            console.error('Error fetching files:', err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats
    const totalFiles = files.length;
    const pendingCount = files.filter(f => f.status === 'Pending').length;
    const approvedCount = files.filter(f => f.status === 'Approved' || f.status === 'Closed').length;
    const rejectedCount = files.filter(f => f.status === 'Rejected').length;
    const delayedCount = files.filter(f => f.delayed).length;
    const totalTimeline = files.reduce((sum, f) => sum + (f.timeline?.length || 0), 0);

    // Unique offices and departments
    const uniqueOffices = [...new Set(files.map(f => f.currentOffice).filter(Boolean))].length;
    const uniqueDepts = [...new Set(files.map(f => f.currentBranch).filter(Boolean))].length;

    if (loading) {
        return (
            <Layout isAdmin={true}>
                <div className="w-full px-4 py-8 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout isAdmin={true}>
            <div className="w-full px-4 py-6">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold  bg-clip-text text-white">
                        Organization Analytics
                    </h1>
                    <p className="text-gray-300 mt-2 ">Complete overview of file tracking across all departments</p>
                </div>

                {/* Stats Cards - Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                    <StatCard
                        title="Total Files"
                        value={totalFiles}
                        color="from-violet-500 to-purple-600"
                        subValue="System-wide"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>}
                    />
                    <StatCard
                        title="Active Offices"
                        value={uniqueOffices}
                        color="from-cyan-400 to-blue-500"
                        subValue="Departments active"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                    />
                    <StatCard
                        title="Departments"
                        value={uniqueDepts}
                        color="from-pink-400 to-rose-500"
                        subValue="Active branches"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                    />
                    <StatCard
                        title="Timeline Events"
                        value={totalTimeline}
                        color="from-amber-400 to-orange-500"
                        subValue="Total movements"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                    />
                </div>

                {/* Stats Cards - Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                    <StatCard
                        title="Pending Files"
                        value={pendingCount}
                        color="from-yellow-400 to-amber-500"
                        subValue={`${totalFiles > 0 ? Math.round((pendingCount / totalFiles) * 100) : 0}% of total`}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <StatCard
                        title="Approved/Closed"
                        value={approvedCount}
                        color="from-emerald-400 to-green-500"
                        subValue={`${totalFiles > 0 ? Math.round((approvedCount / totalFiles) * 100) : 0}% success rate`}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <StatCard
                        title="Delayed Files"
                        value={delayedCount}
                        color="from-red-400 to-rose-500"
                        subValue={`${totalFiles > 0 ? Math.round((delayedCount / totalFiles) * 100) : 0}% past deadline`}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                    />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Status Distribution */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <span className="w-3 h-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full mr-3 animate-pulse"></span>
                            Status Distribution
                        </h3>
                        <div className="h-72">
                            {files.length > 0 ? (
                                <StatusPieChart files={files} />
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-gray-400 text-lg">No data available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Office Distribution */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <span className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mr-3 animate-pulse"></span>
                            Files by Office
                        </h3>
                        <div className="h-72">
                            {files.length > 0 ? (
                                <OfficeBarChart files={files} />
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-gray-400 text-lg">No data available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Department Distribution */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <span className="w-3 h-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mr-3 animate-pulse"></span>
                            Files by Department
                        </h3>
                        <div className="h-72">
                            {files.length > 0 ? (
                                <BranchBarChart files={files} />
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-gray-400 text-lg">No data available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Activity Timeline */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <span className="w-3 h-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mr-3 animate-pulse"></span>
                            Monthly Activity Trend
                        </h3>
                        <div className="h-72">
                            {files.length > 0 ? (
                                <ActivityLineChart files={files} />
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-gray-400 text-lg">No data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Row - Full Width Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Delay Performance */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <span className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mr-3 animate-pulse"></span>
                            Deadline Compliance
                        </h3>
                        <div className="h-64">
                            {files.length > 0 ? (
                                <DelayedPieChart files={files} />
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-gray-400 text-lg">No data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
