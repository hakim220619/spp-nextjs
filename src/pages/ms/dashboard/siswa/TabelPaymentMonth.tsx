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
import { ListPaymentDashboardByMonth } from 'src/store/apps/dashboard/listPayment/month/index'
import { RootState, AppDispatch } from 'src/store'
import { UsersType } from 'src/types/apps/userTypes'
import TableHeader from 'src/pages/ms/setting/pembayaran/TabelHeaderDetail'
import { useRouter } from 'next/router'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import toast from 'react-hot-toast'
import axiosConfig from '../../../../configs/axiosConfig'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Box } from '@mui/system'
import Link from 'next/link'

const MySwal = withReactContent(Swal)

interface CellType {
  row: UsersType
}

const statusObj: any = {
  Pending: { title: 'Lunas', color: 'success' },
  Paid: { title: 'Belum Lunas', color: 'error' }
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
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  const { uuid } = router.query

  const handleClickOpenDelete = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleRowEditedClick = () => {
    router.push(`/ms/setting/pembayaran/bebas/edit/${uid}`)
  }

  return (
    <>
      <Link href={`/ms/pembayaran/bulanan/${uid}`} passHref>
        <Button variant='contained' sx={{ '& svg': { mr: 2 } }}>
          <Icon fontSize='1.125rem' icon='' />
          BAYAR
        </Button>
      </Link>
    </>
  )
}

const columns: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 70 },
  { field: 'full_name', headerName: 'Nama Siswa', flex: 0.175, minWidth: 140 },
  { field: 'sp_name', headerName: 'Nama Pembayaran', flex: 0.175, minWidth: 140 },
  {
    field: 'pending',
    headerName: 'Tunggakan',
    flex: 0.175,
    minWidth: 140,
    valueFormatter: ({ value }) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0 // Menghilangkan bagian desimal
      }).format(value)
    }
  },
  {
    field: 'paid',
    headerName: 'Sudah Dibayar',
    flex: 0.175,
    minWidth: 140,
    valueFormatter: ({ value }) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0 // Menghilangkan bagian desimal
      }).format(value)
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
    field: 'status_lunas',
    headerName: 'Status',
    flex: 0.175,
    minWidth: 80,
    renderCell: (params: GridRenderCellParams) => {
      const status = statusObj[params.row.status_lunas]
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
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [loading, setLoading] = useState<boolean>(true)
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.ListPaymentDashboardByMonth)
  const userData = JSON.parse(localStorage.getItem('userData') as string)
  const storedToken = window.localStorage.getItem('token')
  const schoolId = userData.school_id
  const user_id = userData.id
  console.log(store)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        await dispatch(ListPaymentDashboardByMonth({ school_id: schoolId, user_id: user_id, q: value }))
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to fetch data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dispatch, value])

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
    <Card>
      <Grid item xl={12}>
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
      </Grid>
    </Card>
  )
}

export default SettingPembayaran
