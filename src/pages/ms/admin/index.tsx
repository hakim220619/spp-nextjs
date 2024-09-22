import { useState, useEffect, useCallback } from 'react'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { SelectChangeEvent } from '@mui/material/Select'
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import CustomChip from 'src/@core/components/mui/chip'
import CustomTextField from 'src/@core/components/mui/text-field'
import { fetchData, deleteUser } from 'src/store/apps/admin'
import { RootState, AppDispatch } from 'src/store'
import { ThemeColor } from 'src/@core/layouts/types'
import { UsersType } from 'src/types/apps/userTypes'
import TableHeader from 'src/pages/ms/admin/TableHeader'
import { useRouter } from 'next/router'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import axiosConfig from '../../../configs/axiosConfig'
import CircularProgress from '@mui/material/CircularProgress'
import toast from 'react-hot-toast'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
const MySwal = withReactContent(Swal)

interface UserStatusType {
  [key: string]: ThemeColor
}

interface CellType {
  row: UsersType
}
const statusObj: any = {
  ON: { title: 'ON', color: 'primary' },
  OFF: { title: 'OFF', color: 'error' }
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
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<string>('')
  const [value, setValue] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [school, setSchool] = useState<string>('')
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  const handleRowOptionsClick = () => {}
  const handleRowEditedClick = () => {
    router.push('/ms/admin/' + uid)
  }
  const handleDelete = async () => {
    try {
      await dispatch(deleteUser(uid)).unwrap() // Wait for deleteUser to complete
      await dispatch(fetchData({ role, status, school, q: value })) // Refresh data
      toast.success('Successfully deleted!') // Show success toast
      setOpen(false) // Close the modal if everything is successful
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error('Failed to delete user. Please try again.') // Show error toast
    }
  }

  const handleClickOpenDelete = () => setOpen(true)

  const handleClose = () => setOpen(false)

  return (
    <>
      <IconButton size='small' color='info' onClick={handleRowOptionsClick}>
        <Icon icon='tabler:eye' />
      </IconButton>
      <IconButton size='small' color='success' onClick={handleRowEditedClick}>
        <Icon icon='tabler:edit' />
      </IconButton>
      <IconButton size='small' color='error' onClick={handleClickOpenDelete}>
        <Icon icon='tabler:trash' />
      </IconButton>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>{'Are you sure you want to delete this user?'}</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>You won't be able to revert this action!</DialogContentText>
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
  { field: 'full_name', headerName: 'Nama Lengkap', flex: 0.25, minWidth: 180 },
  { field: 'email', headerName: 'Email', flex: 0.25, minWidth: 290 },
  { field: 'phone', headerName: 'No. Wa', flex: 0.175, minWidth: 90 },
  { field: 'school_name', headerName: 'Sekolah', flex: 0.175, minWidth: 80 },
  {
    field: 'date_of_birth',
    headerName: 'Tanggal Lahir',
    flex: 0.175,
    minWidth: 120,
    valueFormatter: params => {
      if (!params.value) return '' // Handle if the date is null or undefined
      const date = new Date(params.value)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0') // Month is 0-based
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    }
  },
  { field: 'role_name', headerName: 'Role Name', flex: 0.175, minWidth: 260 },
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
    renderCell: ({ row }: CellType) => <RowOptions uid={row.uid} />
  }
]
interface Role {
  id: any // or number, depending on your API's response type
  role_name: string
}
interface Schools {
  id: any // or number, depending on your API's response type
  school_name: string
}
const UserList = () => {
  const [roles, setRoles] = useState<Role[]>([])
  const [role, setRole] = useState<string>('')
  const [schools, setSchools] = useState<Schools[]>([])
  const [school, setSchool] = useState<string>('')
  const [value, setValue] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [addUserOpen, setAddUserOpen] = useState<boolean>(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [loading, setLoading] = useState<boolean>(true)
  const [statuses, setStatuses] = useState<any[]>([])
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.admin)

  useEffect(() => {
    const storedToken = window.localStorage.getItem('token')

    setLoading(true)
    dispatch(
      fetchData({
        role,
        status,
        school,
        q: value
      })
    ).finally(() => {
      setLoading(false)
    })

    const fetchRoles = async () => {
      try {
        const response = await axiosConfig.get('/getRole', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        setRoles(response.data)
      } catch (error) {
        console.error('Error fetching roles:', error)
      }
    }
    const fetchSchools = async () => {
      try {
        const response = await axiosConfig.get('/getSchool', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        setSchools(response.data)
      } catch (error) {
        console.error('Error fetching schools:', error)
      }
    }

    setStatuses(['ON', 'OFF'])
    fetchRoles()
    fetchSchools()
  }, [dispatch, role, status, school, value])
  const handleFilter = useCallback((val: string) => {
    setValue(val)
  }, [])
  const handleRoleChange = useCallback((e: SelectChangeEvent<unknown>) => {
    setRole(e.target.value as string)
  }, [])
  const handleSchoolChange = useCallback((e: SelectChangeEvent<unknown>) => {
    setSchool(e.target.value as string)
  }, [])
  const handleStatusChange = useCallback((e: SelectChangeEvent<unknown>) => {
    setStatus(e.target.value as string)
  }, [])
  const toggleAddUserDrawer = () => setAddUserOpen(!addUserOpen)

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}></Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Search Filters' />

          <CardContent>
            <Grid container spacing={12}>
              <Grid item sm={4} xs={12}>
                <CustomTextField
                  select
                  fullWidth
                  defaultValue='Select Role'
                  SelectProps={{
                    value: role,
                    displayEmpty: true,
                    onChange: e => handleRoleChange(e)
                  }}
                >
                  <MenuItem value=''>Select Role</MenuItem>
                  {roles
                    .filter(role => role.id !== 160)
                    .map(data => (
                      <MenuItem key={data.id} value={data.role_name}>
                        {data.role_name}
                      </MenuItem>
                    ))}
                </CustomTextField>
              </Grid>
              <Grid item sm={4} xs={12}>
                <CustomTextField
                  select
                  fullWidth
                  defaultValue='Select Status'
                  SelectProps={{
                    value: status,
                    displayEmpty: true,
                    onChange: e => handleStatusChange(e)
                  }}
                >
                  <MenuItem value=''>Select Status</MenuItem>
                  {statuses.map(data => (
                    <MenuItem key={data} value={data}>
                      {data}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>
              <Grid item sm={4} xs={12}>
                <CustomTextField
                  select
                  fullWidth
                  defaultValue='Select Sekolah'
                  SelectProps={{
                    value: school,
                    displayEmpty: true,
                    onChange: e => handleSchoolChange(e)
                  }}
                >
                  <MenuItem value=''>Select Sekolah</MenuItem>
                  {schools.map(school => (
                    <MenuItem key={school.id} value={school.school_name}>
                      {school.school_name}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>
            </Grid>
          </CardContent>

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
