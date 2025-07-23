import api from './axios';

export const login             = (data)        => api.post('/auth/login', data);
export const login2FA          = (payload)     => api.post('/auth/2fa/login', payload);
export const register          = (data)        => api.post('/auth/register', data);
export const logout            = ()            => api.post('/auth/logout');
export const me                = ()            => api.get('/auth/me');
export const updateMe          = (data)        => api.put('/auth/me', data);
export const changePassword    = (data)        => api.put('/auth/me/password', data);

export const forgotPassword    = (email)       => api.post('/auth/forgot-password', { email });
export const resetPassword     = (token, pass) => api.post(`/auth/reset-password/${token}`, { password: pass });

export const verifyEmail       = (token)       => api.get(`/auth/verify-email/${token}`);
export const resendConfirmation= (email)       => api.post('/auth/resend-confirmation', { email });

export const setup2FA          = ()            => api.post('/auth/2fa/setup');
export const verify2FA         = (payload)     => api.post('/auth/2fa/verify', payload);
export const disable2FA        = ()            => api.delete('/auth/2fa');

export const uploadAvatar      = (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return api.post('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const googleUrl         = () => `${process.env.REACT_APP_API_URL}/auth/google`;
