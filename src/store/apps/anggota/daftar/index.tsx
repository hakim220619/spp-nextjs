import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Dispatch } from 'redux'
// ** Axios Imports
import axiosConfig from 'src/configs/axiosConfig'

interface DataParams {
  company: string
  q: string
}
interface Redux {
  getState: any
  dispatch: Dispatch<any>
}

// ** Fetch Anggota
export const fetchDataVerification = createAsyncThunk(
  'appAnggotaVerification/fetchDataVerification',
  async (params: DataParams) => {
    const storedToken = window.localStorage.getItem('token')
    const customConfig = {
      params,
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + storedToken
      }
    }
    const response = await axiosConfig.get('/list-anggota-verification', customConfig)
    return response.data
  }
)

export const deleteUser = createAsyncThunk(
  'appAnggotaVerification/deleteUser',
  async (uid: number | string, { getState, dispatch }: Redux) => {
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
  }
)
export const appAnggotaVerificationSlice = createSlice({
  name: 'appAnggotaVerification',
  initialState: {
    data: [],
    total: 1,
    params: {},
    allData: []
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchDataVerification.fulfilled, (state, action) => {
      state.data = action.payload
      state.total = action.payload.total
      state.params = action.payload.params
      state.allData = action.payload.allData
    })
  }
})

export default appAnggotaVerificationSlice.reducer
