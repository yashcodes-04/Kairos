const API_BASE = 'http://localhost:5000/api';

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
}

export const api = {
  // Auth
  login: async (credentials) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  // Student Endpoints
  getActiveJobs: async () => {
    const res = await fetch(`${API_BASE}/jobs`);
    return handleResponse(res);
  },

  getSavedJobIds: async (studentId) => {
    const res = await fetch(`${API_BASE}/students/${studentId}/saved-jobs`);
    return handleResponse(res);
  },

  saveJob: async (studentId, jobId) => {
    const res = await fetch(`${API_BASE}/students/${studentId}/saved-jobs/${jobId}`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  removeSavedJob: async (studentId, jobId) => {
    const res = await fetch(`${API_BASE}/students/${studentId}/saved-jobs/${jobId}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  getAppliedJobIds: async (studentId) => {
    const res = await fetch(`${API_BASE}/students/${studentId}/applications`);
    return handleResponse(res);
  },

  applyForJob: async (jobId, studentId) => {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId }),
    });
    return handleResponse(res);
  },

  withdrawApplication: async (jobId, studentId) => {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/apply?studentId=${studentId}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Recruiter Endpoints
  getRecruiterJobs: async (recruiterId) => {
    const res = await fetch(`${API_BASE}/recruiters/${recruiterId}/jobs`);
    return handleResponse(res);
  },

  getRecruiterApplications: async (recruiterId) => {
    const res = await fetch(`${API_BASE}/recruiters/${recruiterId}/applications`);
    return handleResponse(res);
  },

  postJob: async (jobData) => {
    const res = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData),
    });
    return handleResponse(res);
  },

  updateJobStatus: async (jobId, recruiterId, status) => {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recruiterId, status }),
    });
    return handleResponse(res);
  },

  deleteJob: async (jobId, recruiterId) => {
    const res = await fetch(`${API_BASE}/jobs/${jobId}?recruiterId=${recruiterId}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },
};
