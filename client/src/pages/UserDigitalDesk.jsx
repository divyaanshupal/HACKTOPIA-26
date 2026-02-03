import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import FileTable from '../components/FileTable';
import { getFiles, sendFile, getUsers, uploadFile, createFile, saveLogOnBlockchain } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { v4 as uuidv4 } from 'uuid';
import SHA256 from 'crypto-js/sha256';
import toast from 'react-hot-toast';

export default function UserDigitalDesk() {
  const [files, setFiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedUploadFile, setSelectedUploadFile] = useState(null);
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  const [sendFormData, setSendFormData] = useState({
    fileId: '',
    nextUserId: '',
    status: 'Pending',
    remarks: '',
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedCreateFile, setSelectedCreateFile] = useState(null);

  const [formData, setFormData] = useState({
    subject: '',
    expectedDate: '',
    applicantName: '',
    applicantMobileNumber: '',
    applicantEmailId: '',
    submitToUser: '', // New field for direct sending
  });

  useEffect(() => {
    // Only fetch data once auth is loaded and user is available
    if (!authLoading && user) {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      const [filesRes, usersRes] = await Promise.all([getFiles(), getUsers()]);
      const allFiles = filesRes.data.data?.docs || [];

      // Filter files to show those where user is either:
      // 1. The original creator (createdBy)
      // 2. The current handler (currentUserId)
      const myFiles = user
        ? allFiles.filter(f =>
          String(f.currentUserId) === String(user._id) ||
          String(f.createdBy) === String(user._id)
        )
        : allFiles;

      setFiles(myFiles);
      setUsers(usersRes.data.data?.docs || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to fetch data');
    }
  };

  const handleCreateFile = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Creating file...');
    try {
      // 1. Create File
      const res = await createFile({
        subject: formData.subject,
        expectedDate: formData.expectedDate,
        applicantName: formData.applicantName,
        applicantMobileNumber: formData.applicantMobileNumber,
        applicantEmailId: formData.applicantEmailId,
        mode: 'Digital',
      });

      if (res.data.status === 'new File created') {
        const newFileId = res.data.data.newFile._id;

        // 2. Upload File
        if (selectedCreateFile) {
          const formDataObj = new FormData();
          formDataObj.append('file', selectedCreateFile);
          formDataObj.append('fileId', newFileId);
          await uploadFile(newFileId, formDataObj);
        }

        // 3. Auto-Send if a recipient was selected
        if (formData.submitToUser) {
          await sendFile(
            newFileId,
            formData.submitToUser,
            'Pending',
            'Initial Submission'
          );
        }

        toast.success('File created and submitted successfully', { id: toastId });
        setShowModal(false);
        fetchData();
        // Reset form
        setFormData({
          subject: '',
          expectedDate: '',
          applicantName: '',
          applicantMobileNumber: '',
          applicantEmailId: '',
          submitToUser: '',
        });
        setSelectedCreateFile(null);
      }
    } catch (err) {
      console.error('Error creating file:', err);
      toast.error('Error creating file: ' + (err.response?.data?.erroe || err.message), { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleSendFile = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Sending file...');
    try {
      if (selectedUploadFile) {
        const formData = new FormData();
        formData.append('file', selectedUploadFile);
        formData.append('fileId', sendFormData.fileId);

        const uploadRes = await uploadFile(sendFormData.fileId, formData);
        if (uploadRes.data.status !== 'Success') {
          throw new Error('File upload failed');
        }
      }

      // --- Blockchain Logging Start ---
      try {
        const currentFile = files.find(f => f._id === sendFormData.fileId || f.id === sendFormData.fileId);
        const nextUser = users.find(u => u._id === sendFormData.nextUserId);

        // Ensure we have current user details (from 'user' context) and target user details
        const fromRole = user.currentDesk?.designation || user.role || 'STAFF';
        const fromDept = user.currentDesk?.office || 'ACADEMICS'; // fallback or adjust if dept is stored differently

        const toRole = nextUser?.currentDesk?.designation || nextUser?.role || 'HOD';
        const toDept = nextUser?.currentDesk?.office || 'FINANCE';

        const performByHash = SHA256(user._id).toString();

        // Calculate offChainDataHash
        // We can stringify the essential details
        const detailsObj = {
          fileId: sendFormData.fileId,
          subject: currentFile?.subject || 'No Subject',
          from: user._id,
          to: sendFormData.nextUserId,
          remarks: sendFormData.remarks
        };
        const offChainHash = SHA256(JSON.stringify(detailsObj)).toString();

        const logBody = {
          eventId: uuidv4(),
          fileId: sendFormData.fileId, // assuming "FILE-2026-00123" format or just the ID
          eventType: "FORWARDED",
          fromRole: fromRole,
          toRole: toRole,
          fromDept: fromDept,
          toDept: toDept,
          performedByHash: performByHash,
          timestamp: Math.floor(Date.now() / 1000),
          offChainDataHash: offChainHash,
          prevEventHash: SHA256("previous_event_placeholder").toString()
        };

        console.log("Saving log to blockchain:", logBody);
        await saveLogOnBlockchain(logBody);

      } catch (bcError) {
        console.error("Blockchain logging failed:", bcError);
        // We might choose not to block the actual send if logging fails,
        // or alert the user. For now, just logging error.
        toast.error('Blockchain logging failed, but proceeding with transfer');
      }
      // --- Blockchain Logging End ---

      const res = await sendFile(
        sendFormData.fileId,
        sendFormData.nextUserId,
        sendFormData.status,
        sendFormData.remarks
      );
      if (res.data.status === 'Success') {
        toast.success('File sent successfully', { id: toastId });
        setShowSendModal(false);
        fetchData();
        setSelectedUploadFile(null); // Reset file selection
      }
    } catch (err) {
      console.error('Error sending file:', err);
      toast.error('Error sending file: ' + (err.response?.data?.message || err.message), { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const openSendModal = (file) => {
    setSendFormData({ ...sendFormData, fileId: file._id || file.id });
    setShowSendModal(true);
  };

  return (
    <Layout isAdmin={false}>
      <div className="w-full px-4 py-4 space-y-6">

        {/* Add File Card */}
        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 xl:w-1/4">
            <div className="bg-white rounded-xl shadow-md">
              <div className="relative p-3 pt-2">
                <div className="absolute -top-4 left-4 h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
                  <svg
                    className="h-7 w-7 text-white"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0z" />
                  </svg>
                </div>

                <div className="text-right h-12 flex items-center justify-end">
                  <button type="button" className="text-gray-800" onClick={() => setShowModal(true)}>
                    <h4 className="text-xl font-semibold">Add a New File</h4>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create File Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-3xl px-4">
              <div className="bg-white rounded-xl shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <h4 className="text-xl font-semibold text-gray-800">Create A New File</h4>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setShowModal(false)}
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="p-6">
                  <form onSubmit={handleCreateFile}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Enter the Subject of File
                        </label>
                        <input
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          type="text"
                          value={formData.subject}
                          onChange={(e) =>
                            setFormData({ ...formData, subject: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Enter the expected date of Completion
                        </label>
                        <input
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          type="date"
                          value={formData.expectedDate}
                          onChange={(e) =>
                            setFormData({ ...formData, expectedDate: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Enter the applicant's name
                        </label>
                        <input
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          type="text"
                          value={formData.applicantName}
                          onChange={(e) =>
                            setFormData({ ...formData, applicantName: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Enter the applicant's mobile number
                        </label>
                        <input
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          type="text"
                          value={formData.applicantMobileNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              applicantMobileNumber: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Enter the applicant's email id
                      </label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text"
                        value={formData.applicantEmailId}
                        onChange={(e) =>
                          setFormData({ ...formData, applicantEmailId: e.target.value })
                        }
                      />
                    </div>

                    {/* Submit To Dropdown */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Submit To (Optional - Send immediately)
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.submitToUser}
                        onChange={(e) =>
                          setFormData({ ...formData, submitToUser: e.target.value })
                        }
                      >
                        <option value="">Select Recipient...</option>
                        {users.map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.name} ({u.currentDesk?.designation || 'No Desk'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Attach File
                      </label>
                      <input
                        type="file"
                        onChange={(e) => setSelectedCreateFile(e.target.files[0])}
                        className="w-full rounded-lg border px-4 py-2"
                      />
                    </div>
                    <div className="pt-2">
                      <button
                        className="rounded-lg bg-gradient-to-r from-gray-500 to-gray-700 px-6 py-2 text-white font-medium hover:shadow-lg transition"
                        type="submit"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Send File Modal */}
        {showSendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-2xl px-4">
              <div className="bg-white rounded-xl shadow-xl">

                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <h5 className="text-xl font-semibold text-gray-800">
                    Send this File
                  </h5>
                  <button
                    type="button"
                    onClick={() => setShowSendModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                  <form onSubmit={handleSendFile} className="space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          File Id
                        </label>
                        <input
                          type="text"
                          value={sendFormData.fileId}
                          onChange={(e) =>
                            setSendFormData({ ...sendFormData, fileId: e.target.value })
                          }
                          className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select User (Optional if Approving/Rejecting)
                        </label>
                        <select
                          value={sendFormData.nextUserId}
                          onChange={(e) =>
                            setSendFormData({ ...sendFormData, nextUserId: e.target.value })
                          }
                          className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select a user...</option>
                          {users.map((u) => (
                            <option key={u._id} value={u._id}>
                              {u.name} ({u.currentDesk?.designation || 'No Desk'})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>

                      <select
                        value={sendFormData.status}
                        onChange={(e) =>
                          setSendFormData({ ...sendFormData, status: e.target.value })
                        }
                        className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Pending">Forward (Pending)</option>
                        <option value="Approved">Approve & Close</option>
                        <option value="Rejected">Reject</option>
                      </select>
                    </div>

                    {/* Attach File */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Attach File
                      </label>

                      <input
                        type="file"
                        onChange={(e) => setSelectedUploadFile(e.target.files[0])}
                        className="w-full rounded-lg border px-4 py-2"
                      />
                    </div>



                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Remarks
                      </label>
                      <textarea
                        rows="3"
                        value={sendFormData.remarks}
                        onChange={(e) =>
                          setSendFormData({ ...sendFormData, remarks: e.target.value })
                        }
                        className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="rounded-lg bg-gradient-to-r from-gray-500 to-gray-700 px-6 py-2 text-white font-medium hover:shadow-lg transition"
                      >
                        Done
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* File List */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="px-6 py-4 border-b">
            <h6 className="text-lg font-semibold text-gray-700">
              List of files currently on your Digital Desk
            </h6>
          </div>

          <FileTable
            files={files}
            showSender={true}
            showCurrentLocation={true}
            showForward={true}
            detailPath="/fileDetail"
            isAdmin={false}
            onSendClick={openSendModal}
          />
        </div>

      </div>
    </Layout>
  );
}
