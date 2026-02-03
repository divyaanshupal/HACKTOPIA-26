import { Link } from 'react-router-dom';

export default function FileTable({
  files,
  showSender = true,
  showForward = true,
  showCurrentLocation = false,
  detailPath = '/fileDetail',
  isAdmin = true,
  onSendClick = null,
}) {
  const getStatusBadge = (status) => {
    const colors = {
      'Pending': 'bg-yellow-500',
      'Approved': 'bg-green-500',
      'Rejected': 'bg-red-500',
      'Closed': 'bg-gray-500',
    };
    return colors[status] || 'bg-gray-400';
  };

  const getPriorityBadge = (priority) => {
    const config = {
      'HIGH_PRIORITY': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', label: 'H' },
      'NORMAL': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', label: 'N' },
      'LOW_PRIORITY': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', label: 'L' },
    };
    return config[priority] || null;
  };

  // Format sender info nicely
  const getSenderInfo = (file) => {
    if (file.previousDesk) {
      const desk = file.previousDesk;
      return (
        <div className="text-sm">
          <div className="font-medium">{desk.designation || 'N/A'}</div>
          <div className="text-gray-500 text-xs">{desk.office || ''} • {desk.branch || ''}</div>
        </div>
      );
    }
    return file.applicantDetails?.name || 'Applicant';
  };

  // Format current location info
  const getCurrentLocation = (file) => {
    return (
      <div className="text-sm">
        <div className="font-medium">{file.currentUserName || 'N/A'}</div>
        <div className="text-gray-500 text-xs">{file.currentOffice || ''} • {file.currentBranch || ''}</div>
      </div>
    );
  };

  return (
    <div className="px-0 pb-2">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                Subject
              </th>

              {showSender && (
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                  From
                </th>
              )}

              {showCurrentLocation && (
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                  Current Location
                </th>
              )}

              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                Date
              </th>

              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                Priority
              </th>

              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                Status
              </th>

              <th className="px-4 py-3 text-center text-xs font-bold uppercase text-gray-500">
                Details
              </th>

              {showForward && (
                <th className="px-4 py-3 text-center text-xs font-bold uppercase text-gray-500">
                  Action
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {files &&
              files.map((file) => (
                <tr
                  key={file._id || file.id}
                  className="hover:bg-gray-50 text-gray-800"
                >
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center">
                      {file.subject}
                      {file.summary && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                          AI
                        </span>
                      )}
                    </div>
                  </td>

                  {showSender && (
                    <td className="px-4 py-3">
                      {getSenderInfo(file)}
                    </td>
                  )}

                  {showCurrentLocation && (
                    <td className="px-4 py-3">
                      {getCurrentLocation(file)}
                    </td>
                  )}

                  <td className="px-4 py-3">
                    {new Date(
                      file.dateOfLastForward || file.creationDate
                    ).toLocaleString('en-US')}
                  </td>

                  <td className="px-4 py-3">
                    {file.priority ? (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityBadge(file.priority)?.bg} ${getPriorityBadge(file.priority)?.text} ${getPriorityBadge(file.priority)?.border}`}>
                        {getPriorityBadge(file.priority)?.label}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getStatusBadge(file.status)}`}>
                      {file.status || 'Pending'}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <Link to={`${detailPath}/${file._id || file.id}`}>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-lg border border-gray-700 px-3 py-1 text-gray-700 hover:bg-gray-100 transition"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
                        </svg>
                      </button>
                    </Link>
                  </td>

                  {showForward && (
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => onSendClick && onSendClick(file)}
                        className="rounded-lg bg-blue-600 px-4 py-1.5 text-white font-medium hover:bg-blue-700 transition"
                      >
                        Send
                      </button>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
