import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import FileTable from '../components/FileTable';
import { getFiles, getUsers, createFile, sendFile, uploadFile } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminDigitalDesk() {
  const [files, setFiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // The file record being acted upon
  const [createFileObj, setCreateFileObj] = useState(null); // File to upload during creation
  const [sendFileObj, setSendFileObj] = useState(null); // File to upload during sending
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    expectedDate: '',
    applicantName: '',
    applicantMobileNumber: '',
    applicantEmailId: '',
  });
  const [sendFormData, setSendFormData] = useState({
    fileId: '',
    nextUserId: '',
    status: 'Pending',
    remarks: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [filesRes, usersRes] = await Promise.all([getFiles(), getUsers()]);
      // Backend returns 'docs' array, not 'files' or 'users'
      setFiles(filesRes.data.data?.docs || []);
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
      // Backend expects these exact field names
      const res = await createFile({
        subject: formData.subject,
        expectedDate: formData.expectedDate,
        applicantName: formData.applicantName,
        applicantMobileNumber: formData.applicantMobileNumber,
        applicantEmailId: formData.applicantEmailId,
        mode: 'Digital', // Default to Digital mode
      });
      if (res.data.status === 'new File created') {

        // Upload file if selected
        if (createFileObj) {
          const newFileId = res.data.data.newFile._id;
          const formDataObj = new FormData();
          formDataObj.append('file', createFileObj);
          formDataObj.append('fileId', newFileId);

          await uploadFile(newFileId, formDataObj);
        }

        toast.success('File created successfully', { id: toastId });
        setShowModal(false);
        fetchData();
        setFormData({
          subject: '',
          expectedDate: '',
          applicantName: '',
          applicantMobileNumber: '',
          applicantEmailId: '',
        });
        setCreateFileObj(null);
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
      // Validate: Remarks required for Approved/Rejected
      if ((sendFormData.status === 'Approved' || sendFormData.status === 'Rejected') && !sendFormData.remarks.trim()) {
        toast.error('Remarks are required when approving or rejecting a file.', { id: toastId });
        setLoading(false);
        return;
      }

      // Upload file if selected
      if (sendFileObj) {
        const formDataObj = new FormData();
        formDataObj.append('file', sendFileObj);
        formDataObj.append('fileId', sendFormData.fileId);

        const uploadRes = await uploadFile(sendFormData.fileId, formDataObj);
        if (uploadRes.data.status !== 'Success') {
          throw new Error('File upload failed');
        }
      }

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
        setSendFileObj(null);
      }
    } catch (err) {
      console.error('Error sending file:', err);
      toast.error('Error sending file: ' + (err.response?.data?.message || err.message), { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const openSendModal = (file) => {
    setSelectedFile(file);
    setSendFormData({ ...sendFormData, fileId: file._id || file.id });
    setShowSendModal(true);
  };

  return (
    <Layout isAdmin={true}>
      <div className="w-full px-4 py-4">
        <div className="flex flex-wrap">
          <div className="w-full xl:w-1/4 sm:w-1/2 mb-4">
            <div className="bg-white/80 rounded-xl shadow-md">
              <div className="relative p-3 pt-2">
                <div className="absolute rounded-xl w-14 h-14 flex items-center justify-center bg-slate-500 shadow-lg">
                  <svg className="w-7 h-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM8.5 7v1.5H10a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V9.5H6a.5.5 0 0 1 0-1h1.5V7a.5.5 0 0 1 1 0z" />
                  </svg>
                </div>
                <div className="text-right pt-1" style={{ height: '50px' }}>
                  <button className="text-gray-800 font-medium capitalize" type="button" onClick={() => setShowModal(true)}>
                    <h4 className="text-xl font-semibold">Add a New File</h4>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create File Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="w-full max-w-3xl mx-4">
              <div className="bg-white rounded-xl shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800">Create A New File</h4>
                  <button type="button" className="text-gray-400 hover:text-gray-600" onClick={() => setShowModal(false)}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-6">
                  <form onSubmit={handleCreateFile}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Enter the Subject of File</label>
                        <input
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          type="text"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Enter the expected date of Completion</label>
                        <input
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          type="text"
                          value={formData.expectedDate}
                          onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Enter the applicant's name</label>
                        <input
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          type="text"
                          value={formData.applicantName}
                          onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Enter the applicant's mobile number</label>
                        <input
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          type="text"
                          value={formData.applicantMobileNumber}
                          onChange={(e) => setFormData({ ...formData, applicantMobileNumber: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Enter the applicant's email id</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text"
                        value={formData.applicantEmailId}
                        onChange={(e) => setFormData({ ...formData, applicantEmailId: e.target.value })}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Attach File</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="file"
                        onChange={(e) => setCreateFileObj(e.target.files[0])}
                      />
                    </div>
                    <div className="pt-2">
                      <button className="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-lg font-medium hover:shadow-lg transition" type="submit">Create</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Send File Modal */}
        {showSendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="w-full max-w-2xl mx-4">
              <div className="bg-white rounded-xl shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h5 className="text-xl font-semibold text-gray-800">Send this File</h5>
                  <button type="button" className="text-gray-400 hover:text-gray-600" onClick={() => setShowSendModal(false)}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-6">
                  <form onSubmit={handleSendFile}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">File Id:-</label>
                        <input
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none"
                          type="text"
                          value={sendFormData.fileId}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select the User (Optional if Approving/Rejecting)</label>
                        <select
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={sendFormData.nextUserId}
                          onChange={(e) => setSendFormData({ ...sendFormData, nextUserId: e.target.value })}
                        >
                          <option value="">Select a user...</option>
                          {users.map((user) => (
                            <option key={user._id} value={user._id}>
                              {user.name} ({user.currentDesk?.designation || 'No Desk'})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select the Status</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={sendFormData.status}
                        onChange={(e) => setSendFormData({ ...sendFormData, status: e.target.value })}
                      >
                        <option value="Pending">Forward (Pending)</option>
                        <option value="Approved">Approve & Close</option>
                        <option value="Rejected">Reject</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Enter the details/remarks</label>
                      <textarea
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        value={sendFormData.remarks}
                        onChange={(e) => setSendFormData({ ...sendFormData, remarks: e.target.value })}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Attach File</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="file"
                        onChange={(e) => setSendFileObj(e.target.files[0])}
                      />
                    </div>
                    <div className="pt-2">
                      <button className="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-lg font-medium hover:shadow-lg transition" type="submit">Done</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* File List */}
        <div className="mt-4"></div>
        <div className="mb-4">
          <div className="bg-white/90 rounded-xl shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-wrap">
                <div className="w-full lg:w-1/2">
                  <h6 className="text-lg font-semibold text-gray-700">List of files currently on your Digital Desk</h6>
                </div>
              </div>
            </div>
            <FileTable
              files={files}
              showSender={true}
              showCurrentLocation={true}
              showForward={true}
              detailPath="/fileDetail"
              isAdmin={true}
              onSendClick={openSendModal}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
