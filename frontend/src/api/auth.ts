import { apiCall } from './config';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  name: string;
}

interface AuthResponse {
  token: string;
}

export const loginUser = async ({ email, password }: LoginCredentials): Promise<AuthResponse> => {
  return apiCall('/user/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const registerUser = async ({ email, password, name }: RegisterCredentials): Promise<AuthResponse> => {
  return apiCall('/user/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
};

export const logoutUser = async (): Promise<void> => {
  return apiCall('/user/auth/logout', {
    method: 'POST',
  });
};
