import { useState, useEffect, useCallback, ChangeEvent } from 'react'
import {
  Card,
  Grid,
  Divider,
  IconButton,
  CardHeader,
  CircularProgress,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CardContent,
  MenuItem,
  SelectChangeEvent
} from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import CustomChip from 'src/@core/components/mui/chip'
import {
  fetchDataSettingPembayaranDetail,
  deleteSettingPembayaranDetail
} from 'src/store/apps/setting/pembayaran/detail/index'
import { RootState, AppDispatch } from 'src/store'
import { UsersType } from 'src/types/apps/userTypes'
import TableHeader from 'src/pages/ms/setting/pembayaran/TabelHeaderDetail'
import { useRouter } from 'next/router'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import toast from 'react-hot-toast'
import axiosConfig from '../../../../../configs/axiosConfig'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Box } from '@mui/system'
import { Link } from 'react-router-dom'

const MySwal = withReactContent(Swal)

interface CellType {
  row: UsersType
}

const statusObj: any = {
  Pending: { title: 'Pending', color: 'info' }
}
const typeObj: any = {
  BULANAN: { title: 'BULANAN', color: 'success' },
  BEBAS: { title: 'BEBAS', color: 'warning' }
}

const RowOptions = ({ uid, setting_payment_id, user_id }: { uid: any; setting_payment_id: any; user_id: any }) => {
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const [open, setOpen] = useState(false)
  const [school_id] = useState<number>(getDataLocal.school_id)
  const [value, setValue] = useState<string>('')
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  const { uuid } = router.query
  const handleDelete = async () => {
    try {
      // Memanggil action untuk menghapus detail pembayaran dengan argumen yang benar
      await dispatch(
        deleteSettingPembayaranDetail({
          uid,
          setting_payment_id,
          user_id
        })
      ).unwrap()

      // Mengambil ulang data setelah penghapusan berhasil
      await dispatch(
        fetchDataSettingPembayaranDetail({
          school_id,
          clas: '',
          major: '',
          setting_payment_uid: setting_payment_id,
          q: value
        })
      )

      // Menampilkan notifikasi kesuksesan
      toast.success('Successfully deleted!')

      // Menutup modal atau dialog setelah penghapusan berhasil
      setOpen(false)
    } catch (error: any) {
      // Menangani dan menampilkan kesalahan jika penghapusan gagal
      console.error('Failed to delete payment setting:', error)

      // Jika error memiliki pesan, tampilkan di notifikasi
      const errorMessage = error?.message || 'Failed to delete. Please try again.'
      toast.error(errorMessage)

      // Menutup modal atau dialog meskipun ada error
      setOpen(false)
    }
  }

  const handleClickOpenDelete = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleRowEditedClick = () => {
    router.push(`/ms/setting/pembayaran/bebas/edit/${uid}`)
  }

  return (
    <>
      <IconButton size='large' color='success' onClick={handleRowEditedClick}>
        <Icon icon='tabler:edit' />
      </IconButton>

      <IconButton size='small' color='error' onClick={handleClickOpenDelete}>
        <Icon icon='tabler:trash' />
      </IconButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{'Are you sure you want to delete this user?'}</DialogTitle>
        <DialogContent>
          <DialogContentText>You won't be able to revert this action!</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='primary'>
            Cancel
          </Button>
          <Button onClick={handleDelete} color='error'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

const columns: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 70 },
  { field: 'full_name', headerName: 'Nama Siswa', flex: 0.175, minWidth: 140 },
  { field: 'class_name', headerName: 'Kelas', flex: 0.175, minWidth: 140 },
  { field: 'major_name', headerName: 'Jurusan', flex: 0.175, minWidth: 140 },
  {
    field: 'jumlah',
    headerName: 'Jumlah',
    flex: 0.175,
    minWidth: 140,
    valueFormatter: params => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(params.value)
    }
  },
  { field: 'years', headerName: 'Tahun', flex: 0.175, minWidth: 140 },
  {
    field: 'type',
    headerName: 'Tipe Pembayaran',
    flex: 0.175,
    minWidth: 80,
    renderCell: (params: GridRenderCellParams) => {
      const type = typeObj[params.row.type]
      return (
        <CustomChip
          rounded
          size='small'
          skin='light'
          color={type.color}
          label={type.title}
          sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
        />
      )
    }
  },
  {
    field: 'status',
    headerName: 'Status',
    flex: 0.175,
    minWidth: 80,
    renderCell: (params: GridRenderCellParams) => {
      const status = statusObj[params.row.status]
      return (
        <CustomChip
          rounded
          size='small'
          skin='light'
          color={status.color}
          label={status.title}
          sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
        />
      )
    }
  },
  {
    flex: 0,
    minWidth: 200,
    sortable: false,
    field: 'actions',
    headerName: 'Actions',
    renderCell: ({ row }: any) => (
      <RowOptions uid={row.uid} setting_payment_id={row.setting_payment_uid} user_id={row.user_id} />
    )
  }
]

const SettingPembayaran = () => {
  const router = useRouter()
  const { uid } = router.query
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const [school_id] = useState<number>(getDataLocal.school_id)
  const [value, setValue] = useState<string>('')
  const [clas, setClas] = useState<string>('')
  const [classes, setClases] = useState<any[]>([])
  const [major, setMajor] = useState<string>('')
  const [majors, setMajors] = useState<any[]>([])
  const [setting_payment_uid, setSettingPembayaranId] = useState<any>(uid)
  const [status, setSpStatus] = useState<string>('')
  const [statuses, setSpStatuses] = useState<any[]>(['Pending', 'Paid'])
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [loading, setLoading] = useState<boolean>(true)
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.SettingPembayaranDetail)
  const userData = JSON.parse(localStorage.getItem('userData') as string)
  const storedToken = window.localStorage.getItem('token')
  const schoolId = userData.school_id
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        await dispatch(fetchDataSettingPembayaranDetail({ school_id, clas, major, setting_payment_uid, q: value }))
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to fetch data. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    const fetchClases = async () => {
      try {
        const response = await axiosConfig.get(`/getClass/?schoolId=${schoolId}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        setClases(response.data)
      } catch (error) {
        console.error('Error fetching classes:', error)
      }
    }
    const fetchMajors = async () => {
      try {
        const response = await axiosConfig.get(`/getMajors/?schoolId=${schoolId}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        setMajors(response.data)
      } catch (error) {
        console.error('Error fetching majors:', error)
      }
    }
    fetchClases()
    fetchMajors()
    fetchData()
  }, [dispatch, school_id, clas, major, setting_payment_uid, value])

  const handleFilter = useCallback((val: string) => setValue(val), [])
  const handleClassChange = useCallback((e: ChangeEvent<{ value: unknown }>) => {
    setClas(e.target.value as any)
  }, [])
  const handleMajorChange = useCallback((e: ChangeEvent<{ value: unknown }>) => {
    setMajor(e.target.value as any)
  }, [])
  const handleNavigate = () => {
    router.push(`/ms/setting/pembayaran/bebas/kelas/${uid}`)
  }
  const handleNavigateSiswa = () => {
    router.push(`/ms/setting/pembayaran/bebas/siswa/${uid}`)
  }
  const handleNavigateBack = () => {
    router.push(`/ms/setting/pembayaran`)
  }

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Pengaturan Pembayaran' />
          <CardContent>
            <Grid container spacing={12}>
              <Grid item xs={4}>
                <Button
                  variant='contained'
                  color='primary'
                  sx={{ '& svg': { mr: 2 }, width: '100%' }}
                  onClick={handleNavigate}
                >
                  <Icon fontSize='1.125rem' icon='tabler:plus' />
                  Pembayaran Baru Kelas
                </Button>
              </Grid>

              <Grid item xs={4}>
                <Button
                  variant='contained'
                  color='success'
                  sx={{ '& svg': { mr: 2 }, width: '100%' }}
                  onClick={handleNavigateSiswa}
                >
                  <Icon fontSize='1.125rem' icon='tabler:plus' />
                  Buat Pembayaran Siswa
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant='contained'
                  color='secondary'
                  sx={{ '& svg': { mr: 2 }, width: '100%' }}
                  onClick={handleNavigateBack}
                >
                  <Icon fontSize='1.125rem' icon='tabler:reload' />
                  Kembali
                </Button>
              </Grid>
              <Grid item sm={6} xs={12}>
                <CustomTextField
                  select
                  fullWidth
                  value={major} // Bind the selected value to the state
                  onChange={handleMajorChange} // Attach the event handler
                  defaultValue=''
                  SelectProps={{
                    displayEmpty: true
                  }}
                >
                  <MenuItem value=''>Pilih Jurusan</MenuItem>
                  {majors.map(data => (
                    <MenuItem key={data.id} value={data.id}>
                      {data.major_name}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>
              <Grid item sm={6} xs={12}>
                <CustomTextField
                  select
                  fullWidth
                  value={clas} // Bind the selected value to the state
                  onChange={handleClassChange} // Attach the event handler
                  defaultValue=''
                  SelectProps={{
                    displayEmpty: true
                  }}
                >
                  <MenuItem value=''>Pilih Kelas</MenuItem>
                  {classes.map(data => (
                    <MenuItem key={data.id} value={data.id}>
                      {data.class_name}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>
            </Grid>
          </CardContent>
          <Divider sx={{ m: '0 !important' }} />
          <TableHeader value={value} handleFilter={handleFilter} />
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <CircularProgress color='secondary' />
            </div>
          ) : (
            <DataGrid
              autoHeight
              rowHeight={50}
              rows={store.data}
              columns={columns}
              disableRowSelectionOnClick
              pageSizeOptions={[20, 40, 60, 100]}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              sx={{
                '& .MuiDataGrid-cell': {
                  fontSize: '0.75rem'
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontSize: '0.75rem'
                }
              }}
            />
          )}
        </Card>
      </Grid>
    </Grid>
  )
}

export default SettingPembayaran
