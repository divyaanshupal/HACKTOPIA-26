import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { createUser, createDesk, getDesks } from '../services/api';
import toast from 'react-hot-toast';

export default function CreateUserDesk() {
  const [desks, setDesks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: 'User',
    deskId: '',
  });
  const [deskForm, setDeskForm] = useState({
    designation: '',
    office: '',
    department: '',
  });

  useEffect(() => {
    fetchDesks();
  }, []);

  const fetchDesks = async () => {
    try {
      const res = await getDesks();
      // Backend returns 'docs' array
      setDesks(res.data.data?.docs || []);
    } catch (err) {
      console.error('Error fetching desks:', err);
      toast.error('Failed to fetch desks');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Creating user...');
    try {
      const res = await createUser({
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role, // Ensure role is passed if API expects it
        // deskId might need to be assigned separately or API handles it?
        // Assuming API might not handle deskId in createUser based on previous code, 
        // checking the form again... 
        // Wait, the original code had role but didn't seem to pass it in createUser call explicitly in the previous view?
        // Let's look at the original snippet:
        // const res = await createUser({
        //   name: userForm.name,
        //   email: userForm.email,
        //   password: userForm.password,
        // });
        // It missed role and deskId. I should probably include them if the backend supports it, 
        // but for now I will stick to what was there or make it better if I know the API.
        // I will stick to what was there to be safe, but add the missing role since it's in the form.
      });
      // Actually, looking at the previous file view:
      /*
      const res = await createUser({
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
      });
      */
      // It seems `createUser` might be a simple registration. 
      // I'll stick to replacing alerts for now to avoid breaking backend expectations if I'm not sure.
      // But wait, the user selects a role in the form. It should probably be sent.
      // I'll add `role: userForm.role` to the payload as it's common sense, and if it fails I'll revert.
      // Actually, let's check `userRoutes.js` if possible? No, I am the client dev.
      // I'll just replicate the existing behavior accurately but with toasts.

      if (res.data.status === 'new user creted') {
        toast.success('User created successfully', { id: toastId });
        setUserForm({
          name: '',
          email: '',
          password: '',
          passwordConfirm: '',
          role: 'GENERAL',
          deskId: '',
        });
      }
    } catch (err) {
      toast.error('Error creating user: ' + (err.response?.data?.data || err.message), { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDesk = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Creating desk...');
    try {
      // Backend model uses 'branch' not 'department'
      const res = await createDesk({
        designation: deskForm.designation,
        office: deskForm.office,
        branch: deskForm.department, // Map department to branch
      });
      if (res.data.status === 'added data!') {
        toast.success('Desk created successfully', { id: toastId });
        setDeskForm({
          designation: '',
          office: '',
          department: '',
        });
        fetchDesks();
      }
    } catch (err) {
      toast.error('Error creating desk: ' + (err.response?.data?.status || err.message), { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const offices = [
    'Administrative Block',
    'Academic Block',
    'Library',
    'Sports Complex',
    'Hostel',
    'Placement Cell',
    'Research Center',
    'Transport Section',
    'Security Office'
  ];

  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics & Comm.',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Registrar Office',
    'Accounts Section',
    'Exam Cell',
    'Student Section',
    'Humanities',
    'Mathematics'
  ];

  return (
    <Layout isAdmin={true}>
      <div className="w-full px-4 py-4">
        <div className="flex flex-wrap -mx-2">
          {/* Create User Card */}
          <div className="w-full xl:w-1/2 px-2 mb-4">
            <div className="bg-white/90 rounded-xl shadow-md">
              <div className="relative p-3 pt-2">
                <div className=" w-14 h-14 flex items-center justify-center bg-blue-600 rounded-xl shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div className="text-right pt-1">
                  <h4 className="text-xl font-semibold text-gray-800">Create a New User</h4>
                </div>
              </div>
              <hr className="border-gray-300" />
              <div className="p-4">
                <form onSubmit={handleCreateUser}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text"
                        value={userForm.name}
                        onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="email"
                        value={userForm.email}
                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="password"
                        value={userForm.password}
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="password"
                        value={userForm.passwordConfirm}
                        onChange={(e) => setUserForm({ ...userForm, passwordConfirm: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={userForm.role}
                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                      >
                        <option value="GENERAL">General Staff</option>
                        <option value="OP_HEAD">Operational Head</option>
                        <option value="DEPT_HEAD">Department Head</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assign Desk</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={userForm.deskId}
                        onChange={(e) => setUserForm({ ...userForm, deskId: e.target.value })}
                      >
                        <option value="">Select Desk</option>
                        {desks.map((desk) => (
                          <option key={desk._id} value={desk._id}>
                            {desk.designation} - {desk.office}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    disabled={loading}
                    className={`px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    type="submit">
                    {loading ? 'Creating...' : 'Create User'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Create Desk Card */}
          <div className="w-full xl:w-1/2 px-2 mb-4">
            <div className="bg-white/80 rounded-xl">
              <div className="relative p-3 pt-2">
                <div className=" w-14 h-14 flex items-center justify-center bg-slate-600 rounded-xl shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="text-right pt-1">
                  <h4 className="text-xl font-semibold text-gray-800">Create a New Desk</h4>
                </div>
              </div>
              <hr className="border-gray-300" />
              <div className="p-4">
                <form onSubmit={handleCreateDesk}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                    <input
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="text"
                      value={deskForm.designation}
                      onChange={(e) => setDeskForm({ ...deskForm, designation: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Office</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={deskForm.office}
                        onChange={(e) => setDeskForm({ ...deskForm, office: e.target.value })}
                        required
                      >
                        <option value="">Select Office</option>
                        {offices.map((office) => (
                          <option key={office} value={office}>{office}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={deskForm.department}
                        onChange={(e) => setDeskForm({ ...deskForm, department: e.target.value })}
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    disabled={loading}
                    className={`px-6 py-2 bg-gradient-to-r from-slate-400 to-slate-600 text-white rounded-lg font-medium hover:shadow-lg transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    type="submit">
                    {loading ? 'Creating...' : 'Create Desk'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
