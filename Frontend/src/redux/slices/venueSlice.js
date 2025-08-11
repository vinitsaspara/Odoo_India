import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { handleApiError } from '../../utils/api.js';
import { API_ENDPOINTS } from '../../config/api.js';

// Initial state
const initialState = {
    venues: [],
    allVenues: [], // For admin dashboard
    pendingVenues: [], // For admin dashboard
    isLoading: false,
    error: null,
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalVenues: 0,
        limit: 100
    }
};

// Async thunks for API calls
export const fetchOwnerVenues = createAsyncThunk(
    'venue/fetchOwnerVenues',
    async ({ page = 1, limit = 100 } = {}, { rejectWithValue }) => {
        try {
            const response = await api.get(`${API_ENDPOINTS.OWNER.VENUES}?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Fetch owner venues error:', error);
            const errorMessage = handleApiError(error);
            return rejectWithValue(errorMessage);
        }
    }
);

export const fetchAllVenues = createAsyncThunk(
    'venue/fetchAllVenues',
    async ({ page = 1, limit = 100 } = {}, { rejectWithValue }) => {
        try {
            const response = await api.get(`${API_ENDPOINTS.ADMIN.VENUES}?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Fetch all venues error:', error);
            const errorMessage = handleApiError(error);
            return rejectWithValue(errorMessage);
        }
    }
);

export const updateVenueStatus = createAsyncThunk(
    'venue/updateVenueStatus',
    async ({ venueId, status }, { rejectWithValue }) => {
        try {
            const response = await api.patch(API_ENDPOINTS.ADMIN.UPDATE_VENUE_STATUS(venueId), { status });
            return { venueId, status, updatedVenue: response.data.venue };
        } catch (error) {
            console.error('Update venue status error:', error);
            const errorMessage = handleApiError(error);
            return rejectWithValue(errorMessage);
        }
    }
);

export const approveVenue = createAsyncThunk(
    'venue/approveVenue',
    async (venueId, { rejectWithValue }) => {
        try {
            const response = await api.patch(API_ENDPOINTS.ADMIN.APPROVE_VENUE(venueId));
            return { venueId, updatedVenue: response.data.venue };
        } catch (error) {
            console.error('Approve venue error:', error);
            const errorMessage = handleApiError(error);
            return rejectWithValue(errorMessage);
        }
    }
);

export const rejectVenue = createAsyncThunk(
    'venue/rejectVenue',
    async ({ venueId, reason }, { rejectWithValue }) => {
        try {
            const response = await api.patch(API_ENDPOINTS.ADMIN.REJECT_VENUE(venueId), { reason });
            return { venueId, updatedVenue: response.data.venue };
        } catch (error) {
            console.error('Reject venue error:', error);
            const errorMessage = handleApiError(error);
            return rejectWithValue(errorMessage);
        }
    }
);

export const deleteVenue = createAsyncThunk(
    'venue/deleteVenue',
    async (venueId, { rejectWithValue }) => {
        try {
            await api.delete(`${API_ENDPOINTS.VENUES.DELETE}/${venueId}`);
            return venueId;
        } catch (error) {
            console.error('Delete venue error:', error);
            const errorMessage = handleApiError(error);
            return rejectWithValue(errorMessage);
        }
    }
);

// Venue slice
const venueSlice = createSlice({
    name: 'venue',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearVenues: (state) => {
            state.venues = [];
            state.allVenues = [];
            state.pendingVenues = [];
        },
        setPagination: (state, action) => {
            state.pagination = { ...state.pagination, ...action.payload };
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Owner Venues
            .addCase(fetchOwnerVenues.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchOwnerVenues.fulfilled, (state, action) => {
                state.isLoading = false;
                state.venues = action.payload.venues || [];
                state.pagination = {
                    currentPage: action.payload.currentPage || 1,
                    totalPages: action.payload.totalPages || 1,
                    totalVenues: action.payload.totalVenues || 0,
                    limit: action.payload.limit || 100
                };
                state.error = null;
            })
            .addCase(fetchOwnerVenues.rejected, (state, action) => {
                state.isLoading = false;
                state.venues = [];
                state.error = action.payload;
            })

            // Fetch All Venues (Admin)
            .addCase(fetchAllVenues.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllVenues.fulfilled, (state, action) => {
                state.isLoading = false;
                state.allVenues = action.payload.venues || [];
                state.pendingVenues = (action.payload.venues || []).filter(venue => venue.status === 'Pending Approval');
                state.pagination = {
                    currentPage: action.payload.currentPage || 1,
                    totalPages: action.payload.totalPages || 1,
                    totalVenues: action.payload.totalVenues || 0,
                    limit: action.payload.limit || 100
                };
                state.error = null;
            })
            .addCase(fetchAllVenues.rejected, (state, action) => {
                state.isLoading = false;
                state.allVenues = [];
                state.pendingVenues = [];
                state.error = action.payload;
            })

            // Update Venue Status
            .addCase(updateVenueStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateVenueStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                const { venueId, status } = action.payload;

                // Update in allVenues
                const allVenueIndex = state.allVenues.findIndex(venue => venue._id === venueId);
                if (allVenueIndex !== -1) {
                    state.allVenues[allVenueIndex].status = status;
                }

                // Also update in venues array (for owner dashboard)
                const venueIndex = state.venues.findIndex(venue => venue._id === venueId);
                if (venueIndex !== -1) {
                    state.venues[venueIndex].status = status;
                }

                // Update pendingVenues (remove if no longer pending)
                if (status !== 'Pending Approval') {
                    state.pendingVenues = state.pendingVenues.filter(venue => venue._id !== venueId);
                }

                state.error = null;
            })
            .addCase(updateVenueStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Approve Venue
            .addCase(approveVenue.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(approveVenue.fulfilled, (state, action) => {
                state.isLoading = false;
                const { venueId, updatedVenue } = action.payload;

                // Update in allVenues with the updated venue data
                const allVenueIndex = state.allVenues.findIndex(venue => venue._id === venueId);
                if (allVenueIndex !== -1) {
                    state.allVenues[allVenueIndex] = updatedVenue;
                }

                // Also update in venues array (for owner dashboard)
                const venueIndex = state.venues.findIndex(venue => venue._id === venueId);
                if (venueIndex !== -1) {
                    state.venues[venueIndex] = updatedVenue;
                }

                // Remove from pendingVenues
                state.pendingVenues = state.pendingVenues.filter(venue => venue._id !== venueId);

                state.error = null;
            })
            .addCase(approveVenue.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Reject Venue
            .addCase(rejectVenue.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(rejectVenue.fulfilled, (state, action) => {
                state.isLoading = false;
                const { venueId, updatedVenue } = action.payload;

                // Update in allVenues with the updated venue data
                const allVenueIndex = state.allVenues.findIndex(venue => venue._id === venueId);
                if (allVenueIndex !== -1) {
                    state.allVenues[allVenueIndex] = updatedVenue;
                }

                // Also update in venues array (for owner dashboard)
                const venueIndex = state.venues.findIndex(venue => venue._id === venueId);
                if (venueIndex !== -1) {
                    state.venues[venueIndex] = updatedVenue;
                }

                // Remove from pendingVenues
                state.pendingVenues = state.pendingVenues.filter(venue => venue._id !== venueId);

                state.error = null;
            })
            .addCase(rejectVenue.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Delete Venue
            .addCase(deleteVenue.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteVenue.fulfilled, (state, action) => {
                state.isLoading = false;
                const venueId = action.payload;

                // Remove from all arrays
                state.venues = state.venues.filter(venue => venue._id !== venueId);
                state.allVenues = state.allVenues.filter(venue => venue._id !== venueId);
                state.pendingVenues = state.pendingVenues.filter(venue => venue._id !== venueId);

                state.error = null;
            })
            .addCase(deleteVenue.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, clearVenues, setPagination } = venueSlice.actions;
export default venueSlice.reducer;
