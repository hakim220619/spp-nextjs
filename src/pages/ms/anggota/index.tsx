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
import { fetchData, deleteUser } from 'src/store/apps/anggota'
import { RootState, AppDispatch } from 'src/store'
import { ThemeColor } from 'src/@core/layouts/types'
import { UsersType } from 'src/types/apps/userTypes'
import TableHeader from 'src/pages/ms/anggota/TableHeader'
import { useRouter } from 'next/router'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import axiosConfig from '../../../configs/axiosConfig'
import CircularProgress from '@mui/material/CircularProgress'
import { Box } from '@mui/system'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
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

const RowOptions = ({ uid }: { uid: any }) => {
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const [value, setValue] = useState<string>('')
  const [company, setCompany] = useState<any>(`${getDataLocal.company_id}`)

  const [open, setOpen] = useState(false)
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  const handleRowOptionsClick = () => {
    router.push('/ms/anggota/detail/' + uid)
  }
  const handleRowEditedClick = () => {
    router.push('/ms/anggota/' + uid)
  }
  const handleDialogOpen = () => {
    setOpen(true)
  }

  const handleDialogClose = () => {
    setOpen(false)
  }

  const handleDelete = async () => {
    dispatch(deleteUser(uid))
    await dispatch(fetchData({ company, q: value })) // Refresh data
    handleDialogClose()
  }

  return (
    <>
      <IconButton size='small' color='info' onClick={handleRowOptionsClick}>
        <Icon icon='tabler:eye' />
      </IconButton>
      <IconButton size='small' color='success' onClick={handleRowEditedClick}>
        <Icon icon='tabler:edit' />
      </IconButton>
      <IconButton size='small' color='error' onClick={handleDialogOpen}>
        <Icon icon='tabler:trash' />
      </IconButton>
      <Dialog
        open={open}
        onClose={handleDialogClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>{'Are you sure you want to delete this user?'}</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>You won't be able to revert this action!</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleDelete} color='error' autoFocus>
            Yes, delete it!
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

const columns: GridColDef[] = [
  { flex: 0.25, minWidth: 70, field: 'no', headerName: 'NO' },
  { flex: 0.25, minWidth: 200, field: 'nik', headerName: 'NIK' },
  { flex: 0.25, minWidth: 280, field: 'fullName', headerName: 'FULL NAME' },
  { flex: 0.15, field: 'email', minWidth: 260, headerName: 'EMAIL' },
  { flex: 0.15, field: 'role', minWidth: 170, headerName: 'ROLE' },
  { flex: 0.15, field: 'phone_number', minWidth: 170, headerName: 'PHONE' },
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
    renderCell: ({ row }: CellType) => <RowOptions uid={row.uid} />
  }
]

const UserList = () => {
  const [role, setRole] = useState<string>('')
  const [value, setValue] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [addUserOpen, setAddUserOpen] = useState<boolean>(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [loading, setLoading] = useState<boolean>(true)
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const [company, setCompany] = useState<any>(`${getDataLocal.company_id}`)

  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.anggota)

  useEffect(() => {
    setLoading(true)
    dispatch(
      fetchData({
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
              pageSizeOptions={[10, 25, 50, 100]}
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
