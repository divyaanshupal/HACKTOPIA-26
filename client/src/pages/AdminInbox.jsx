import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import FileTable from '../components/FileTable';
import { getFiles, sendFile, getUsers, uploadFile, bulkAction } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function AdminInbox() {
    const [files, setFiles] = useState([]);
    const [users, setUsers] = useState([]);
    const [showSendModal, setShowSendModal] = useState(false);
    const [sendFileObj, setSendFileObj] = useState(null);
    const { user, loading } = useAuth();
    const [actionLoading, setActionLoading] = useState(false);
    const [sendFormData, setSendFormData] = useState({
        fileId: '',
        nextUserId: '',
        status: 'Approved',
        remarks: '',
    });

    // Bulk selection state
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkStatus, setBulkStatus] = useState('Approved');
    const [bulkRemarks, setBulkRemarks] = useState('');
    const [bulkLoading, setBulkLoading] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            fetchData();
        }
    }, [user, loading]);

    const fetchData = async () => {
        try {
            const [filesRes, usersRes] = await Promise.all([getFiles(), getUsers()]);
            const allFiles = filesRes.data.data?.docs || [];

            // Filter to show only files currently on THIS admin's desk (pending approval)
            const inboxFiles = allFiles.filter(f =>
                String(f.currentUserId) === String(user._id) &&
                f.status === 'Pending'
            );

            // Sort by priority: HIGH > MEDIUM > LOW > null
            const priorityOrder = { 'HIGH_PRIORITY': 0, 'NORMAL': 1, 'LOW_PRIORITY': 2 };
            const sortedFiles = inboxFiles.sort((a, b) => {
                const aPriority = priorityOrder[a.priority] ?? 3;
                const bPriority = priorityOrder[b.priority] ?? 3;
                return aPriority - bPriority;
            });

            setFiles(sortedFiles);
            setUsers(usersRes.data.data?.docs || []);
            setSelectedFiles([]); // Reset selection on refresh
        } catch (err) {
            console.error('Error fetching data:', err);
            toast.error('Failed to fetch inbox data');
        }
    };

    const handleSendFile = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        const toastId = toast.loading('Processing file...');
        try {
            // Validate: Remarks required for Approved/Rejected
            if ((sendFormData.status === 'Approved' || sendFormData.status === 'Rejected') && !sendFormData.remarks.trim()) {
                toast.error('Remarks are required when approving or rejecting a file.', { id: toastId });
                return;
            }

            // Upload file if selected
            if (sendFileObj) {
                const formDataObj = new FormData();
                formDataObj.append('file', sendFileObj);
                formDataObj.append('fileId', sendFormData.fileId);
                await uploadFile(sendFormData.fileId, formDataObj);
            }

            const res = await sendFile(
                sendFormData.fileId,
                sendFormData.nextUserId,
                sendFormData.status,
                sendFormData.remarks
            );
            if (res.data.status === 'Success') {
                toast.success(sendFormData.status === 'Approved' ? 'File approved and closed!' :
                    sendFormData.status === 'Rejected' ? 'File rejected!' : 'File forwarded!', { id: toastId });
                setShowSendModal(false);
                fetchData();
                setSendFileObj(null);
                setSendFormData({ ...sendFormData, remarks: '', nextUserId: '' });
            }
        } catch (err) {
            console.error('Error processing file:', err);
            toast.error('Error: ' + (err.response?.data?.message || err.message), { id: toastId });
        } finally {
            setActionLoading(false);
        }
    };

    const openSendModal = (file) => {
        setSendFormData({ ...sendFormData, fileId: file._id || file.id });
        setShowSendModal(true);
    };

    // Bulk selection handlers
    const toggleFileSelection = (fileId) => {
        setSelectedFiles(prev =>
            prev.includes(fileId)
                ? prev.filter(id => id !== fileId)
                : [...prev, fileId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedFiles.length === files.length) {
            setSelectedFiles([]);
        } else {
            setSelectedFiles(files.map(f => f._id));
        }
    };

    const handleBulkAction = async () => {
        if (!bulkRemarks.trim()) {
            toast.error('Remarks are required for bulk actions');
            return;
        }

        setBulkLoading(true);
        const toastId = toast.loading(`Bulk ${bulkStatus.toLowerCase()}ing...`);
        try {
            const res = await bulkAction(selectedFiles, bulkStatus, bulkRemarks);
            console.log(res.data)
            if (res.data.status === 'Success') {
                toast.success(`Bulk ${bulkStatus.toLowerCase()} completed! ${res.data.results.success} files processed.`, { id: toastId });
                setShowBulkModal(false);
                setBulkRemarks('');
                setSelectedFiles([]);
                fetchData();
                console.log(res.data.results.success);
            }
        } catch (err) {
            console.error('Bulk action error:', err);
            toast.error('Error: ' + (err.response?.data?.message || err.message), { id: toastId });
        } finally {
            setBulkLoading(false);
        }
    };

    const canBulkAction = ['Admin', 'DEPT_HEAD'].includes(user?.role);

    // Debug log - check in browser console
    console.log('User role:', user?.role, '| canBulkAction:', canBulkAction);

    return (
        <Layout isAdmin={true}>
            <div className="w-full px-4 py-4">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white"> Inbox - Files Awaiting Your Action</h1>
                    <p className="text-white mt-1">Files that have been sent to you for review, approval, or forwarding.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <div className="text-3xl font-bold text-yellow-600">{files.length}</div>
                        <div className="text-yellow-700">Pending Review</div>
                    </div>
                    {canBulkAction && selectedFiles.length > 0 && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                            <div className="text-3xl font-bold text-indigo-600">{selectedFiles.length}</div>
                            <div className="text-indigo-700">Selected for Bulk Action</div>
                        </div>
                    )}
                </div>

                {/* Bulk Action Buttons */}
                {canBulkAction && files.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-3 items-center bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <button
                            onClick={toggleSelectAll}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                        >
                            {selectedFiles.length === files.length ? '☑️ Deselect All' : '☐ Select All'}
                        </button>

                        {selectedFiles.length > 0 && (
                            <>
                                <div className="h-6 w-px bg-gray-300"></div>
                                <button
                                    onClick={() => { setBulkStatus('Approved'); setShowBulkModal(true); }}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-2"
                                >
                                    ✅ Bulk Approve ({selectedFiles.length})
                                </button>
                                <button
                                    onClick={() => { setBulkStatus('Rejected'); setShowBulkModal(true); }}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2"
                                >
                                    ❌ Bulk Reject ({selectedFiles.length})
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Bulk Action Modal */}
                {showBulkModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="w-full max-w-md mx-4">
                            <div className="bg-white rounded-xl shadow-xl">
                                <div className={`flex items-center justify-between px-6 py-4 border-b ${bulkStatus === 'Approved' ? 'bg-green-50' : 'bg-red-50'}`}>
                                    <h5 className="text-xl font-semibold text-gray-800">
                                        {bulkStatus === 'Approved' ? '✅ Bulk Approve' : '❌ Bulk Reject'} Files
                                    </h5>
                                    <button type="button" className="text-gray-400 hover:text-gray-600" onClick={() => setShowBulkModal(false)}>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="p-6">
                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">
                                            You are about to <strong>{bulkStatus.toLowerCase()}</strong> <strong>{selectedFiles.length}</strong> file(s).
                                        </p>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Remarks <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows="3"
                                            placeholder={`Enter reason for bulk ${bulkStatus.toLowerCase()}...`}
                                            value={bulkRemarks}
                                            onChange={(e) => setBulkRemarks(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowBulkModal(false)}
                                            className="flex-1 py-2 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition"
                                            disabled={bulkLoading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleBulkAction}
                                            disabled={bulkLoading || !bulkRemarks.trim()}
                                            className={`flex-1 py-2 rounded-lg font-medium text-white transition ${bulkStatus === 'Approved'
                                                ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-300'
                                                : 'bg-red-600 hover:bg-red-700 disabled:bg-red-300'
                                                }`}
                                        >
                                            {bulkLoading ? 'Processing...' : `${bulkStatus === 'Approved' ? '✅ Approve' : '❌ Reject'} All`}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Process Modal */}
                {showSendModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="w-full max-w-2xl mx-4">
                            <div className="bg-white rounded-xl shadow-xl">
                                <div className="flex items-center justify-between px-6 py-4 border-b">
                                    <h5 className="text-xl font-semibold text-gray-800">Process This File</h5>
                                    <button type="button" className="text-gray-400 hover:text-gray-600" onClick={() => setShowSendModal(false)}>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="p-6">
                                    <form onSubmit={handleSendFile}>
                                        {/* Action Selection */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">What would you like to do?</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                <button
                                                    type="button"
                                                    className={`p-3 rounded-lg border-2 text-center transition ${sendFormData.status === 'Approved'
                                                        ? 'border-green-500 bg-green-50 text-green-700'
                                                        : 'border-gray-200 hover:border-green-300'
                                                        }`}
                                                    onClick={() => setSendFormData({ ...sendFormData, status: 'Approved', nextUserId: '' })}
                                                >
                                                    ✅ Approve & Close
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`p-3 rounded-lg border-2 text-center transition ${sendFormData.status === 'Rejected'
                                                        ? 'border-red-500 bg-red-50 text-red-700'
                                                        : 'border-gray-200 hover:border-red-300'
                                                        }`}
                                                    onClick={() => setSendFormData({ ...sendFormData, status: 'Rejected', nextUserId: '' })}
                                                >
                                                    ❌ Reject
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`p-3 rounded-lg border-2 text-center transition ${sendFormData.status === 'Pending'
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-gray-200 hover:border-blue-300'
                                                        }`}
                                                    onClick={() => setSendFormData({ ...sendFormData, status: 'Pending' })}
                                                >
                                                    ➡️ Forward
                                                </button>
                                            </div>
                                        </div>

                                        {/* Forward To (only if forwarding) */}
                                        {sendFormData.status === 'Pending' && (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Forward To</label>
                                                <select
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    value={sendFormData.nextUserId}
                                                    onChange={(e) => setSendFormData({ ...sendFormData, nextUserId: e.target.value })}
                                                    required
                                                >
                                                    <option value="">Select recipient...</option>
                                                    {users.map((u) => (
                                                        <option key={u._id} value={u._id}>
                                                            {u.name} ({u.currentDesk?.designation || 'No Desk'} - {u.currentDesk?.office || ''})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {/* Remarks */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Remarks {(sendFormData.status === 'Approved' || sendFormData.status === 'Rejected') && <span className="text-red-500">*</span>}
                                            </label>
                                            <textarea
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                rows="3"
                                                placeholder="Enter your remarks or notes..."
                                                value={sendFormData.remarks}
                                                onChange={(e) => setSendFormData({ ...sendFormData, remarks: e.target.value })}
                                                required={sendFormData.status === 'Approved' || sendFormData.status === 'Rejected'}
                                            />
                                        </div>

                                        {/* Attachment */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Attach Document (Optional)</label>
                                            <input
                                                type="file"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                onChange={(e) => setSendFileObj(e.target.files[0])}
                                            />
                                        </div>

                                        {/* Submit */}
                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                className={`w-full py-2 rounded-lg font-medium text-white transition ${sendFormData.status === 'Approved' ? 'bg-green-600 hover:bg-green-700' :
                                                    sendFormData.status === 'Rejected' ? 'bg-red-600 hover:bg-red-700' :
                                                        'bg-blue-600 hover:bg-blue-700'
                                                    }`}
                                            >
                                                {sendFormData.status === 'Approved' ? '✅ Approve & Close File' :
                                                    sendFormData.status === 'Rejected' ? '❌ Reject File' :
                                                        '➡️ Forward File'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* File List with Checkboxes */}
                <div className="bg-white rounded-xl shadow-md">
                    <div className="px-6 py-4 border-b">
                        <h6 className="text-lg font-semibold text-gray-700">Files Pending Your Action</h6>
                    </div>
                    {files.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <div className="text-4xl mb-2">📭</div>
                            <div>No files pending your review</div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50">
                                        {canBulkAction && (
                                            <th className="px-4 py-3 text-left">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFiles.length === files.length && files.length > 0}
                                                    onChange={toggleSelectAll}
                                                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                            </th>
                                        )}
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Subject</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">From</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Priority</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {files.map((file) => (
                                        <tr key={file._id} className={`hover:bg-gray-50 ${selectedFiles.includes(file._id) ? 'bg-indigo-50' : ''}`}>
                                            {canBulkAction && (
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedFiles.includes(file._id)}
                                                        onChange={() => toggleFileSelection(file._id)}
                                                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                </td>
                                            )}
                                            <td className="px-4 py-3 font-medium text-gray-800">
                                                {file.subject}
                                                {file.summary && (
                                                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                                        AI
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {file.previousDesk?.designation || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {file.dateOfLastForward ? new Date(file.dateOfLastForward).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {file.priority === 'HIGH_PRIORITY' && (
                                                    <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-700 border border-red-300 rounded-full">
                                                        H
                                                    </span>
                                                )}
                                                {file.priority === 'NORMAL' && (
                                                    <span className="px-2 py-1 text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-full">
                                                        N
                                                    </span>
                                                )}
                                                {file.priority === 'LOW_PRIORITY' && (
                                                    <span className="px-2 py-1 text-xs font-bold bg-blue-100 text-blue-700 border border-blue-300 rounded-full">
                                                        L
                                                    </span>
                                                )}
                                                {!file.priority && (
                                                    <span className="text-gray-400 text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                                                    {file.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <a
                                                        href={`/fileDetail/${file._id}`}
                                                        className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                                                    >
                                                        View
                                                    </a>
                                                    <button
                                                        onClick={() => openSendModal(file)}
                                                        className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition"
                                                    >
                                                        Process
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
