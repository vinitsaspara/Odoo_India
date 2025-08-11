import { useAppSelector, useAppDispatch } from './redux';
import {
    loginUser,
    registerUser,
    logout,
    clearError,
    getUserProfile
} from '../redux/slices/authSlice';

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { user, token, isLoading, isAuthenticated, error } = useAppSelector(
        (state) => state.auth
    );

    const login = async (credentials) => {
        try {
            const result = await dispatch(loginUser(credentials)).unwrap();
            return result;
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const result = await dispatch(registerUser(userData)).unwrap();
            return result;
        } catch (error) {
            throw error;
        }
    };

    const getProfile = async () => {
        try {
            const result = await dispatch(getUserProfile()).unwrap();
            return result;
        } catch (error) {
            throw error;
        }
    };

    const logoutUser = () => {
        dispatch(logout());
    };

    const clearAuthError = () => {
        dispatch(clearError());
    };

    return {
        user,
        token,
        isLoading,
        isAuthenticated,
        error,
        login,
        register,
        logout: logoutUser,
        clearError: clearAuthError,
        getProfile,
    };
};
