import { useState, useEffect, useCallback } from 'react'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { SelectChangeEvent } from '@mui/material/Select'
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import CustomChip from 'src/@core/components/mui/chip'
import CustomTextField from 'src/@core/components/mui/text-field'
import toast from 'react-hot-toast'
import { RootState, AppDispatch } from 'src/store'
import { ThemeColor } from 'src/@core/layouts/types'
import { UsersType } from 'src/types/apps/userTypes'
import TableHeader from 'src/pages/ms/anggota/daftar/TableHeader'
import { useRouter } from 'next/router'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import axiosConfig from '../../../../configs/axiosConfig'
import CircularProgress from '@mui/material/CircularProgress'
import { Box } from '@mui/system'
import { format } from 'date-fns'
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography
} from '@mui/material'
import { fetchDataVerification } from 'src/store/apps/anggota/daftar'
const MySwal = withReactContent(Swal)

interface UserStatusType {
  [key: string]: ThemeColor
}

interface CellType {
  row: UsersType
}

const userStatusObj: UserStatusType = {
  Active: 'success',
  Online: 'success',
  pending: 'warning',
  inactive: 'secondary',
  Verification: 'warning',
  Offline: 'warning',
  Blocked: 'error'
}
const userStatus: UserStatusType = {
  Anggota: 'success',
  Online: 'success',
  pending: 'warning',
  inactive: 'secondary',
  Verification: 'warning',
  Offline: 'warning',
  Blocked: 'error'
}

const RowOptions = ({ uid, dataUser }: { uid: any; dataUser: any }) => {
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const [value, setValue] = useState<string>('')
  const [company, setCompany] = useState<any>(`${getDataLocal.company_id}`)
  const [userData, setUserData] = useState<any>(dataUser)
  const [openDel, setOpenDel] = useState(false)
  const [openDetail, setOpenDetail] = useState(false)
  const [loadingAccept, setLoadingAccept] = useState(false)
  const [loadingReject, setLoadingReject] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const storedToken = localStorage.getItem('token')
  const handleRejectClick = async () => {
    setLoadingReject(true) // Menampilkan loading untuk tombol Reject
    try {
      const response = await axiosConfig.post(
        '/update-anggota-rejected',
        { uid },
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        }
      )

      if (response.status === 200) {
        await dispatch(fetchDataVerification({ company, q: value }))
        setOpenDetail(false)
        toast.success('Successfully Rejected!')
      } else {
        toast.error('Failed to reject member')
      }
    } catch (error) {
      console.error('Error rejecting member:', error)
      toast.error('Error rejecting member')
    } finally {
      setLoadingReject(false) // Sembunyikan loading setelah selesai
    }
  }

  const handleAcceptClick = async () => {
    setLoadingAccept(true) // Menampilkan loading untuk tombol Accept
    try {
      const response = await axiosConfig.post(
        '/update-anggota-accept',
        { uid },
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        }
      )

      if (response.status === 200) {
        await dispatch(fetchDataVerification({ company, q: value }))
        setOpenDetail(false)
        toast.success('Successfully Accepted!')
      } else {
        toast.error('Failed to accept member')
      }
    } catch (error) {
      console.error('Error accepting member:', error)
      toast.error('Error accepting member')
    } finally {
      setLoadingAccept(false) // Sembunyikan loading setelah selesai
    }
  }

  const handleDialogOpen = () => {
    setOpenDel(true)
  }

  const handleDialogCloseDel = () => {
    setOpenDel(false)
  }
  const handleDialogCloseDetail = () => {
    setOpenDetail(false)
  }

  const handleDetailOpenClick = async () => {
    setOpenDetail(true)
  }
  const formattedDateOfBirth = userData.date_of_birth
    ? format(new Date(userData.date_of_birth), 'dd-MM-yyyy')
    : 'Tanggal Lahir Tidak Tersedia'
  const formattedCreatedOfBirth = userData.date_of_birth
    ? format(new Date(userData.created_at), 'dd-MM-yyyy')
    : 'Tanggal Lahir Tidak Tersedia'

  return (
    <>
      <IconButton size='medium' color='info' onClick={handleDetailOpenClick}>
        <Icon icon='tabler:eye' />
      </IconButton>
      <Dialog
        open={openDel}
        onClose={handleDialogCloseDel}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>{'Are you sure you want to delete this member?'}</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            This action will permanently delete the member!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogCloseDel} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleRejectClick} color='error' autoFocus>
            Yes, delete!
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDetail}
        onClose={handleDialogCloseDetail}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        maxWidth='md' // Membuat dialog lebih besar
        fullWidth
      >
        <Card sx={{ p: 4 }}>
          <DialogTitle id='alert-dialog-title'>{'Informasi Anggota'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              {/* Kolom Kiri */}
              <Grid item xs={6} md={6}>
                <Box display='flex' mb={2}>
                  <Typography variant='body2' sx={{ width: '120px' }}>
                    ID:
                  </Typography>
                  <Typography variant='body2'>{userData.member_id}</Typography>
                </Box>
                <Box display='flex' mb={2}>
                  <Typography variant='body2' sx={{ width: '120px' }}>
                    Nama:
                  </Typography>
                  <Typography variant='body2'>{userData.fullName}</Typography>
                </Box>
                <Box display='flex' mb={2}>
                  <Typography variant='body2' sx={{ width: '120px' }}>
                    Tempat Lahir:
                  </Typography>
                  <Typography variant='body2'>{userData.place_of_birth}</Typography>
                </Box>
                <Box display='flex' mb={2}>
                  <Typography variant='body2' sx={{ width: '120px' }}>
                    Tanggal Lahir:
                  </Typography>
                  <Typography variant='body2'>{formattedDateOfBirth}</Typography>
                </Box>
                <Box display='flex' mb={2}>
                  <Typography variant='body2' sx={{ width: '120px' }}>
                    Jenis Kelamin:
                  </Typography>
                  <Typography variant='body2'>{userData.gender}</Typography>
                </Box>
                <Box display='flex' mb={2}>
                  <Typography variant='body2' sx={{ width: '120px' }}>
                    Alamat:
                  </Typography>
                  <Typography variant='body2'>Banyuasin</Typography>
                </Box>
                <Box display='flex' mb={2}>
                  <Typography variant='body2' sx={{ width: '120px' }}>
                    Tanggal Daftar:
                  </Typography>
                  <Typography variant='body2'>{formattedCreatedOfBirth}</Typography>
                </Box>
                <Box display='flex' mb={2}>
                  <Typography variant='body2' sx={{ width: '120px' }}>
                    Status Verifikasi KTP:
                  </Typography>
                  <Chip label='Belum Terverifikasi' color='error' sx={{ fontSize: '12px' }} />
                </Box>
              </Grid>

              {/* Kolom Kanan */}
              <Grid item xs={6} md={6}>
                <Box display='flex' mb={2}>
                  <Typography variant='body2' sx={{ width: '120px' }}>
                    Agama:
                  </Typography>
                  <Typography variant='body2'>{userData.religion}</Typography>
                </Box>
                <Box display='flex' mb={2}>
                  <Typography variant='body2' sx={{ width: '120px' }}>
                    Profesi:
                  </Typography>
                  <Typography variant='body2'>{userData.work}</Typography>
                </Box>
                <Box display='flex' mb={2}>
                  <Typography variant='body2' sx={{ width: '120px' }}>
                    Status Pernikahan:
                  </Typography>
                  <Typography variant='body2'>{userData.marital_status}</Typography>
                </Box>
                <Box display='flex' mb={2}>
                  <Typography variant='body2' sx={{ width: '120px' }}>
                    Jenis Identitas:
                  </Typography>
                  <Typography variant='body2'>{userData.identity_type}</Typography>
                </Box>
                <Box display='flex' mb={2}>
                  <Typography variant='body2' sx={{ width: '120px' }}>
                    No. Identitas:
                  </Typography>
                  <Typography variant='body2'>{userData.no_identity}</Typography>
                </Box>
                <Box display='flex' mb={2}>
                  <Typography variant='body2' sx={{ width: '120px' }}>
                    No. Wa/Handphone:
                  </Typography>
                  <Typography variant='body2'>{userData.no_wa}</Typography>
                </Box>
                <Box display='flex' mb={2}>
                  <Typography variant='body2' sx={{ width: '120px' }}>
                    Status:
                  </Typography>
                  <Chip label={dataUser.status} color='warning' sx={{ fontSize: '12px' }} />
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogCloseDetail} color='secondary'>
              Cancel
            </Button>
            <Button
              onClick={handleAcceptClick}
              color='primary'
              autoFocus
              disabled={loadingAccept} // Disabled saat loading
            >
              {loadingAccept ? (
                <CircularProgress size={24} />
              ) : (
                <>
                  <Icon icon='tabler:check' />
                  Yes, accept!
                </>
              )}
            </Button>
            <Button
              onClick={handleRejectClick}
              color='error'
              autoFocus
              disabled={loadingReject} // Disabled saat loading
            >
              {loadingReject ? (
                <CircularProgress size={24} />
              ) : (
                <>
                  <Icon icon='tabler:x' />
                  Yes, reject!
                </>
              )}
            </Button>
          </DialogActions>
        </Card>
      </Dialog>
    </>
  )
}

const columns: GridColDef[] = [
  { flex: 0.25, minWidth: 70, field: 'no', headerName: 'NO' },
  { flex: 0.25, minWidth: 200, field: 'nik', headerName: 'NIK' },
  { flex: 0.25, minWidth: 280, field: 'fullName', headerName: 'FULL NAME' },
  { flex: 0.15, field: 'email', minWidth: 260, headerName: 'EMAIL' },
  { flex: 0.15, field: 'phone_number', minWidth: 170, headerName: 'PHONE' },
  {
    flex: 0.1,
    minWidth: 180,
    field: 'role',
    headerName: 'ROLE',
    renderCell: ({ row }: CellType) => {
      return (
        <CustomChip
          rounded
          skin='light'
          size='small'
          label={row.role}
          color={userStatus[row.role]}
          sx={{ textTransform: 'capitalize' }}
        />
      )
    }
  },
  {
    flex: 0.1,
    minWidth: 180,
    field: 'status',
    headerName: 'STATUS',
    renderCell: ({ row }: CellType) => {
      return (
        <CustomChip
          rounded
          skin='light'
          size='small'
          label={row.status}
          color={userStatusObj[row.status]}
          sx={{ textTransform: 'capitalize' }}
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
    renderCell: ({ row }: CellType) => {
      // Jika status adalah 'Rejected', jangan tampilkan opsi
      if (row.status === 'Rejected') {
        return null // atau bisa menggunakan <></> untuk merender elemen kosong
      }

      // Jika status tidak 'Rejected', tampilkan opsi
      return <RowOptions uid={row.uid} dataUser={row} />
    }
  }
]

const UserList = () => {
  const [role, setRole] = useState<string>('')
  const [value, setValue] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [addUserOpen, setAddUserOpen] = useState<boolean>(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 })
  const [loading, setLoading] = useState<boolean>(true)
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const [company, setCompany] = useState<any>(`${getDataLocal.company_id}`)

  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.anggotaVerification)

  useEffect(() => {
    setLoading(true)
    dispatch(
      fetchDataVerification({
        company,
        q: value
      })
    ).finally(() => {
      setLoading(false)
    })
  }, [dispatch, role, status, value])
  const handleFilter = useCallback((val: string) => {
    setValue(val)
  }, [])
  const toggleAddUserDrawer = () => setAddUserOpen(!addUserOpen)

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}></Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Anggota' />
          <Divider sx={{ m: '0 !important' }} />
          <TableHeader value={value} handleFilter={handleFilter} toggle={toggleAddUserDrawer} />
          {loading ? (
            <div>
              {Array.from(new Array(1)).map((_, index) => (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                  <CircularProgress color='secondary' />
                </div>
              ))}
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
                  fontSize: '0.75rem' // Mengatur ukuran font untuk sel
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontSize: '0.75rem' // Mengatur ukuran font untuk judul kolom
                }
              }}
            />
          )}
        </Card>
      </Grid>
    </Grid>
  )
}

export default UserList
