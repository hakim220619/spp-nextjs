import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosConfig from 'src/configs/axiosConfig'

interface DataParams {
  company: string
  q: string
}
export const fetchData = createAsyncThunk('appAnggota/fetchData', async (params: DataParams) => {
  const storedToken = window.localStorage.getItem('token')
  const customConfig = {
    params,
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + storedToken
    }
  }
  const response = await axiosConfig.get('/list-anggota', customConfig)

  return response.data
})

export const deleteUser = createAsyncThunk('appAnggota/deleteUser', async (uid: number | string) => {
  const storedToken = window.localStorage.getItem('token')
  const dataAll = {
    data: uid
  }
  const customConfig = {
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + storedToken
    }
  }
  const response = await axiosConfig.post('/delete-anggota', dataAll, customConfig)

  return response.data
})
export const appAnggotaSlice = createSlice({
  name: 'appAnggota',
  initialState: {
    data: [],
    total: 1,
    params: {},
    allData: []
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchData.fulfilled, (state, action) => {
      state.data = action.payload
      state.total = action.payload.total
      state.params = action.payload.params
      state.allData = action.payload.allData
    })
  }
})

export default appAnggotaSlice.reducer
