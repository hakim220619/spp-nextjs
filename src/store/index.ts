// ** Toolkit imports
import { configureStore } from '@reduxjs/toolkit'

// ** Reducers
import admin from 'src/store/apps/admin/index'
import siswa from 'src/store/apps/siswa/index'
import kelas from 'src/store/apps/kelas/index'

export const store = configureStore({
  reducer: {
    admin,
    siswa,
    kelas
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
