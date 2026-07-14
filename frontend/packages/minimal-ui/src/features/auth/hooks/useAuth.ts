'use client';

import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { setCredentials, setUser, logout, setLoading } from '../store/authSlice';
import { LoginRequest, LoginResponse, User } from '../types';
import { apiClient } from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/api/endpoints';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth
  );

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      dispatch(setLoading(true));
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      dispatch(setCredentials(response.data));
    } catch (error) {
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getProfile = async (): Promise<void> => {
    try {
      dispatch(setLoading(true));
      const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.PROFILE);
      dispatch(setUser(response.data));
    } catch (error) {
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    getProfile,
    logout: handleLogout,
  };
};

