import backendConfig from '../../backend.config.json';

export const API_BASE_URL = `http://localhost:${backendConfig.BACKEND_PORT}`;
interface ApiCallOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const apiCall = async (endpoint: string, options: ApiCallOptions = {}): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const { headers, ...restOptions } = options;

  // auto attach token if exists
  const token = localStorage.getItem('token');

  const config: RequestInit = {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }), // add Authorization header if token exists
      ...headers,
    },
  };

  const response = await fetch(url, config);
  
  // 401 authorization handling
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    const statusText = response.statusText;
    const status = response.status;
    console.error('Non-JSON response:', {
      status,
      statusText,
      contentType,
      url,
      text: text.substring(0, 500),
    });
    throw new Error(`Server returned non-JSON response (${status} ${statusText}): ${text.substring(0, 200)}`);
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An error occurred');
  }

  return data;
};

