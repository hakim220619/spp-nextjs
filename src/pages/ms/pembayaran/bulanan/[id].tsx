import { useState, useEffect, useCallback } from 'react'
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
  DialogTitle
} from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import CustomChip from 'src/@core/components/mui/chip'
import { fetchDataPaymentPayByMonth } from 'src/store/apps/pembayaran/bulanan/index'
import { RootState, AppDispatch } from 'src/store'
import { UsersType } from 'src/types/apps/userTypes'
import TableHeader from 'src/pages/ms/pembayaran/bulanan/TableHeader'
import { useRouter } from 'next/router'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

interface CellType {
  row: UsersType
}

const statusObj: any = {
  Pending: { title: 'Pending', color: 'error' },
  Paid: { title: 'Paid', color: 'success' }
}

const RowOptions = ({ uid }: { uid: any }) => {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const handleRowEditedClick = () => router.push('/ms/kelas/' + uid)

  const handleClickOpenDelete = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <>
      <IconButton size='small' color='success' onClick={handleRowEditedClick}>
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
        </DialogActions>
      </Dialog>
    </>
  )
}

const columns: GridColDef[] = [
  { field: 'month_number', headerName: 'No', width: 70 },
  { field: 'month', headerName: 'Bulan', flex: 0.175, minWidth: 140 },
  {
    field: 'amount',
    headerName: 'Jumlah',
    flex: 0.175,
    minWidth: 140,
    valueFormatter: ({ value }) =>
      new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      }).format(value)
  },
  { field: 'years', headerName: 'Tahun', flex: 0.175, minWidth: 140 },
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
    renderCell: ({ row }: CellType) => <RowOptions uid={row.id} />
  }
]

const UserList = () => {
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const [value, setValue] = useState<string>('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 15 })
  const [loading, setLoading] = useState<boolean>(true)
  const [selectionModel, setSelectionModel] = useState<any[]>([])
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.PembayaranByMonth)
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    setLoading(true)
    dispatch(
      fetchDataPaymentPayByMonth({
        id_payment: id,
        school_id: getDataLocal.school_id,
        user_id: getDataLocal.id,
        q: value
      })
    ).finally(() => {
      setLoading(false)
    })
  }, [dispatch, value, id, getDataLocal.school_id, getDataLocal.id])

  const handleFilter = useCallback((val: string) => setValue(val), [])

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={9}>
        <Card>
          <CardHeader title='Data Pembayaran' />
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
              checkboxSelection // Enable checkbox selection
              selectionModel={selectionModel} // Manage selected rows
              onSelectionModelChange={setSelectionModel} // Update selection model on change
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
      <Grid item xs={3}>
        <Card></Card>
      </Grid>
    </Grid>
  )
}

export default UserList
