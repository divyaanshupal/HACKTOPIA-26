import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFileById } from '../services/api';

export default function TrackFileDetail() {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFile();
  }, [id]);

  const fetchFile = async () => {
    try {
      const res = await getFileById(id);
      // Backend returns file data directly in res.data.data
      setFile(res.data.data || null);
    } catch (err) {
      console.error('Error fetching file:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-200 min-h-screen">
        <main className="relative max-h-screen h-full rounded-lg">
          <div className="w-full px-4 py-4">
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="bg-gray-200 min-h-screen">
        <main className="relative max-h-screen h-full rounded-lg">
          <div className="w-full px-4 py-4">
            <p className="text-gray-600">File not found</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-gray-200 min-h-screen">
      <main className="relative max-h-screen h-full rounded-lg">
        <div className="w-full px-4 py-4">
          <div className="flex flex-wrap">
            <div className="w-full">
              <div className="bg-white rounded-xl shadow-md">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-800">Track File: {file.subject}</h4>
                </div>
                <div className="p-6">
                  {file.file && (
                    <div className="mb-6">
                      <a
                        href={`http://localhost:4000/assets/files/${file.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="mr-2 -ml-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Attached Document
                      </a>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <strong className="text-gray-700">File ID:</strong> <span className="text-gray-600">{file._id || file.id}</span>
                    </div>
                    <div>
                      <strong className="text-gray-700">Current Office:</strong> <span className="text-gray-600">{file.currentOffice}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <strong className="text-gray-700">Status:</strong> <span className="text-gray-600">{file.status}</span>
                    </div>
                    <div>
                      <strong className="text-gray-700">Creation Date:</strong> <span className="text-gray-600">{new Date(file.creationDate).toLocaleString('en-US')}</span>
                    </div>
                  </div>

                  {file.summary && (
                    <div className="mt-6 mb-8 bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-xl shadow-sm">
                      <div className="flex items-center mb-3">
                        <span className="flex items-center justify-center p-2 bg-blue-100 rounded-lg mr-3">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </span>
                        <h5 className="text-lg font-bold text-blue-800">AI Document Summary</h5>
                      </div>
                      <p className="text-blue-900 leading-relaxed italic text-base">
                        "{file.summary}"
                      </p>
                    </div>
                  )}

                  {file.timeline && file.timeline.length > 0 && (
                    <>
                      <hr className="my-4 border-gray-200" />
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">File Journey Timeline</h5>
                      <div className="space-y-3">
                        {file.timeline.map((entry, index) => (
                          <div key={entry._id || index} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                              <span className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-full">
                                {entry.dateOfReceiving ? new Date(entry.dateOfReceiving).toLocaleDateString('en-US') : 'N/A'}
                              </span>
                              <span className={`px-3 py-1 text-xs font-medium text-white rounded-full ${entry.status === 'Approved' || entry.status === 'Closed' ? 'bg-green-500' :
                                entry.status === 'Rejected' ? 'bg-red-500' : 'bg-yellow-500'
                                }`}>
                                {entry.status}
                              </span>
                            </div>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-gray-700"><strong>Desk:</strong> {entry.desk?.designation || 'N/A'}</p>
                              <p className="text-sm text-gray-700"><strong>Office:</strong> {entry.desk?.office || 'N/A'}</p>
                              {entry.remarks && <p className="text-sm text-gray-700"><strong>Remarks:</strong> {entry.remarks}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
