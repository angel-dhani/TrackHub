import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../app/api";

export const fetchTickets = createAsyncThunk(
  "tickets/fetchAll",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const res = await api.get("/tickets", { params: filters });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load tickets");
    }
  }
);

export const createTicket = createAsyncThunk(
  "tickets/create",
  async (ticketData, { rejectWithValue }) => {
    try {
      const res = await api.post("/tickets", ticketData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create ticket");
    }
  }
);

export const updateTicket = createAsyncThunk(
  "tickets/update",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/tickets/${id}`, updates);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update ticket");
    }
  }
);

export const deleteTicket = createAsyncThunk(
  "tickets/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/tickets/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete ticket");
    }
  }
);

const ticketSlice = createSlice({
  name: "tickets",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = action.payload;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateTicket.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteTicket.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t._id !== action.payload);
      });
  },
});

export default ticketSlice.reducer;
