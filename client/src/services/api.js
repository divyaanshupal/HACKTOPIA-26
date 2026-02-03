import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true,
});

const blockchainApi = axios.create({
  baseURL: 'http://localhost:4000',  // no /api — blockchain routes are at /blockchain
  withCredentials: true,
});

// ================= AUTH APIs =================
export const login = (email, password) =>
  api.post('/users/login', { email, password });

export const logout = () =>
  api.get('/users/logout');

export const getCurrentUser = () =>
  api.get('/users/me');

// ================= FILE APIs =================git 
export const getFiles = () =>
  api.get('/files/getAllFiles');

export const getFileById = (id) =>
  api.get(`/files/getAFile/${id}`);

export const createFile = (fileData) =>
  api.post('/files/addNewFile', fileData);

export const sendFile = (fileId, nextUserId, status, remarks) =>
  api.post('/files/sendFile', { fileId, nextUserId, status, remarks });

export const uploadFile = (fileId, formData) =>
  api.post('/files/uploadfile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const searchFilesByApplicant = (mobileNumber) =>
  api.get(`/files/fileFilter?applicantMobileNumber=${mobileNumber}`);

export const filterFiles = (filters) =>
  api.get('/files/fileFilter', { params: filters });

export const bulkAction = (fileIds, status, remarks) =>
  api.post('/files/bulkAction', { fileIds, status, remarks });

// ================= DESK APIs =================
export const getDesks = () =>
  api.get('/desks/getDesks');

export const createDesk = (deskData) =>
  api.post('/desks/createnewDesk', deskData);

export const handleTransfer = (currentUserId, newUserId, deskId) =>
  api.patch('/desks/HandleTransfer', { currentUserId, newUserId, deskId });

export const assignUserToDesk = (designation, userName) =>
  api.patch(`/desks/assignUserToDesk/${designation}`, { user: userName });

// ================= USER APIs =================
export const getUsers = () =>
  api.get('/users/getUsers');

export const createUser = (userData) =>
  api.post('/users/createUser', userData);

export const promoteUser = (userId, newRole) =>
  api.patch(`/users/promote/${userId}`, { newRole });

export const verifyUser = (userId) =>
  api.patch(`/users/verify/${userId}`);

export const assignDesk = (userId, deskId) =>
  api.patch('/users/assignDesk', { userId, deskId });

export const getMyLogs = (month, userId) =>
  api.get('/users/myLogs', { params: { month, userId } });


// ================= BLOCKCHAIN APIs =================
export const saveLogOnBlockchain = (logData) =>
  blockchainApi.post('/blockchain/log', logData);

export const verifyLogOnBlockchain = (hash) =>
  blockchainApi.post('/blockchain/verify', { hash });

export default api;
