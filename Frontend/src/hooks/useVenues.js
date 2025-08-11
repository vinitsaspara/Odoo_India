import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
    fetchOwnerVenues,
    fetchAllVenues,
    updateVenueStatus,
    approveVenue,
    rejectVenue,
    deleteVenue,
    clearError,
    clearVenues,
    setPagination
} from '../redux/slices/venueSlice';

export const useVenues = () => {
    const dispatch = useDispatch();
    const {
        venues,
        allVenues,
        pendingVenues,
        isLoading,
        error,
        pagination
    } = useSelector(state => state.venue);

    const { user } = useSelector(state => state.auth);

    // Fetch owner venues
    const getOwnerVenues = useCallback(async (options = {}) => {
        const { page = 1, limit = 100 } = options;
        try {
            await dispatch(fetchOwnerVenues({ page, limit })).unwrap();
        } catch (error) {
            console.error('Error fetching owner venues:', error);
            throw error;
        }
    }, [dispatch]);

    // Fetch all venues (for admin)
    const getAllVenues = useCallback(async (options = {}) => {
        const { page = 1, limit = 100 } = options;
        try {
            await dispatch(fetchAllVenues({ page, limit })).unwrap();
        } catch (error) {
            console.error('Error fetching all venues:', error);
            throw error;
        }
    }, [dispatch]);

    // Update venue status (for admin)
    const updateStatus = useCallback(async (venueId, status) => {
        try {
            await dispatch(updateVenueStatus({ venueId, status })).unwrap();
        } catch (error) {
            console.error('Error updating venue status:', error);
            throw error;
        }
    }, [dispatch]);

    // Approve venue (for admin)
    const approveVenueById = useCallback(async (venueId) => {
        try {
            await dispatch(approveVenue(venueId)).unwrap();
        } catch (error) {
            console.error('Error approving venue:', error);
            throw error;
        }
    }, [dispatch]);

    // Reject venue (for admin)
    const rejectVenueById = useCallback(async (venueId, reason) => {
        try {
            await dispatch(rejectVenue({ venueId, reason })).unwrap();
        } catch (error) {
            console.error('Error rejecting venue:', error);
            throw error;
        }
    }, [dispatch]);

    // Delete venue
    const removeVenue = useCallback(async (venueId) => {
        try {
            await dispatch(deleteVenue(venueId)).unwrap();
        } catch (error) {
            console.error('Error deleting venue:', error);
            throw error;
        }
    }, [dispatch]);

    // Clear error
    const clearVenueError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    // Clear venues
    const clearAllVenues = useCallback(() => {
        dispatch(clearVenues());
    }, [dispatch]);

    // Set pagination
    const updatePagination = useCallback((paginationData) => {
        dispatch(setPagination(paginationData));
    }, [dispatch]);

    // Get venues based on user role
    const getUserVenues = useCallback(async (options = {}) => {
        if (user?.role === 'admin') {
            return getAllVenues(options);
        } else if (user?.role === 'owner') {
            return getOwnerVenues(options);
        }
    }, [user?.role, getAllVenues, getOwnerVenues]);

    return {
        // State
        venues,
        allVenues,
        pendingVenues,
        isLoading,
        error,
        pagination,

        // Actions
        getOwnerVenues,
        getAllVenues,
        getUserVenues,
        updateStatus,
        approveVenueById,
        rejectVenueById,
        removeVenue,
        clearVenueError,
        clearAllVenues,
        updatePagination
    };
};

export default useVenues;
