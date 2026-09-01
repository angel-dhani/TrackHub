import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../app/api";

export const fetchSummary = createAsyncThunk(
  "dashboard/fetchSummary",
  async (range, { rejectWithValue }) => {
    try {
      const res = await api.get("/dashboard/summary", { params: { range } });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load dashboard");
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    summary: null,
    status: "idle",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSummary.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.status = "idle";
        state.summary = action.payload;
      })
      .addCase(fetchSummary.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export default dashboardSlice.reducer;
