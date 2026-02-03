import { useState } from 'react';
import { Link } from 'react-router-dom';
import { searchFilesByApplicant } from '../services/api';

export default function ApplicantDashboard() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [files, setFiles] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!mobileNumber) return;

    try {
      const res = await searchFilesByApplicant(mobileNumber);
      // Backend returns { message, results, files } from fileFilter
      setFiles(res.data.files || []);
      setSearched(true);
    } catch (err) {
      console.error('Error searching files:', err);
      setFiles([]);
      setSearched(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 p-4">
      <main className="max-w-6xl mx-auto space-y-6">

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-md p-6 relative">
          <div className="absolute -top-5 left-5 h-12 w-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-lg">
            <svg
              className="h-6 w-6 text-white"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8A.5.5 0 0 1 6 12.5z" />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 text-right mb-4">
            Get your file here
          </h2>

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter your mobile number
              </label>
              <input
                type="text"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-2 text-white font-medium hover:shadow-lg transition"
            >
              Get
            </button>
          </form>
        </div>

        {/* Files Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="border-b px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-700">
              List of files currently on your Digital Desk
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Subject</th>
                  <th className="px-4 py-3 text-left">Date Of Creation</th>
                  <th className="px-4 py-3 text-left">File ID</th>
                  <th className="px-4 py-3 text-center">Details</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {files.length > 0 ? (
                  files.map((file) => (
                    <tr
                      key={file._id || file.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {file.subject}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {new Date(file.creationDate).toLocaleString('en-US')}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {file._id || file.id}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link to={`/myFile/${file._id || file.id}`}>
                          <button className="rounded-lg border border-gray-700 px-3 py-1 text-gray-700 hover:bg-gray-100 transition">
                            View
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : searched ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-6 text-center text-gray-500"
                    >
                      No files found
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
