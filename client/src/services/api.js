const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('marketsphere_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      const errorMsg =
        data.message ||
        (data.errors && data.errors.map((e) => e.message).join(', ')) ||
        `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`[API Request Error] ${endpoint}:`, error.message);
    throw error;
  }
};
