// ** Toolkit imports
import { configureStore } from '@reduxjs/toolkit'

// ** Reducers
import admin from 'src/store/apps/admin/index'
import siswa from 'src/store/apps/siswa/index'
import kelas from 'src/store/apps/kelas/index'
import Jurusan from 'src/store/apps/jurusan/index'
import Bulan from 'src/store/apps/bulan/index'
import SettingPembayaran from 'src/store/apps/setting/pembayaran/index'

export const store = configureStore({
  reducer: {
    admin,
    siswa,
    kelas,
    Jurusan,
    Bulan,
    SettingPembayaran
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
