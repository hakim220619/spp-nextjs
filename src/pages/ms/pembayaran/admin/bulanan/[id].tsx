import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  Grid,
  Divider,
  IconButton,
  CardHeader,
  CircularProgress,
  Button,
  InputLabel,
  TextField,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
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
import Typography from '@mui/material/Typography'
import axiosConfig from '../../../../../configs/axiosConfig'
import { Box } from '@mui/system'
import toast from 'react-hot-toast'

interface CellType {
  row: UsersType
}

const statusObj: any = {
  Pending: { title: 'Pending', color: 'error' },
  Paid: { title: 'Paid', color: 'success' },
  Verified: { title: 'Verified', color: 'warning' }
}

const RowOptions = ({ data }: { uid: any; data: any }) => {
  const handleRowRedirectClick = () => window.open(data.redirect_url)

  // Kondisi untuk menampilkan RowOptions jika status adalah 'verified' dan redirect_url tidak null
  if (data.status !== 'Verified' || data.redirect_url === null) {
    return null
  }

  return (
    <>
      <IconButton size='small' color='success' onClick={handleRowRedirectClick}>
        <Icon icon='tabler:link' />
      </IconButton>
    </>
  )
}

const columns: GridColDef[] = [
  { field: 'month_number', headerName: 'No', width: 70 },
  { field: 'month', headerName: 'Bulan', flex: 0.175, minWidth: 140 },
  {
    field: 'total_payment',
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
    renderCell: ({ row }: CellType) => <RowOptions uid={row.id} data={row} />
  }
]

const UserList: React.FC = () => {
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const [value, setValue] = useState<string>('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 15 })
  const [loading, setLoading] = useState<boolean>(true)
  const [rowSelectionModel, setRowSelectionModel] = useState<number[]>([])
  const [selectedRows, setSelectedRows] = useState<any[]>([])
  const [spName, setSpName] = useState<any>('')
  const [jumlah, setJumlah] = useState<string>('')
  const [open, setOpen] = useState(false)
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState<any[]>([]) // New state for payment details
  const [isLoading, setIsLoading] = useState(false) // State for overlay loading
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.PembayaranByMonth)
  const router = useRouter()
  const { id, school_id, user_id } = router.query
  useEffect(() => {
    setLoading(true)
    dispatch(
      fetchDataPaymentPayByMonth({
        id_payment: id,
        school_id: school_id as any,
        user_id: user_id as any,
        q: value
      })
    ).finally(() => {
      setLoading(false)
    })
  }, [dispatch, value, id, school_id, user_id])

  useEffect(() => {
    if (store.data && store.data.length > 0) {
      const firstItem = store.data[0]
      setSpName(firstItem)
    }
  }, [store.data])

  const handleFilter = useCallback((val: string) => setValue(val), [])

  const onsubmit = async () => {
    setIsLoading(true)
    if (spName && jumlah) {
      try {
        const filteredRows = selectedRows.filter(row => row.status !== 'Verified' && row.status !== 'Paid')
        const token = localStorage.getItem('token')

        const response = await axiosConfig.post(
          '/create-payment-pending-byAdmin',
          {
            dataUsers: spName,
            dataPayment: filteredRows,
            admin_id: getDataLocal.id,
            total_affiliate: spName.affiliate * filteredRows.length
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` // Add the token here
            }
          }
        )

        if (response.status == 200) {
          dispatch(
            fetchDataPaymentPayByMonth({
              id_payment: id,
              school_id: school_id as any,
              user_id: user_id as any,
              q: value
            })
          ).finally(() => {
            setLoading(false)
            handleClose(false)
            setJumlah('0')
            setIsLoading(false)
            setRowSelectionModel([])
          })
        }
        toast.success('Pembayaran Berhasil!')
      } catch (error) {
        setIsLoading(false)
        toast.error('Terjadi kesalahan saat memproses pembayaran.')
        console.error(error) // Log the error for debugging
      }
    } else {
      setIsLoading(false)
      toast.error('Data tidak lengkap. Pastikan semua informasi sudah diisi.')
    }
  }

  const handleClickOpen = () => {
    const filteredRows = selectedRows.filter(row => row.status !== 'Verified' && row.status !== 'Paid')
    setSelectedPaymentDetails(filteredRows)
    setOpen(true)
  }

  const handleClose = (confirm: any) => {
    setOpen(false)
    if (confirm) {
      onsubmit() // Call the payment submission function here
    }
  }

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12} md={9}>
        {' '}
        {/* Full width on mobile, 9/12 on medium screens and up */}
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
              checkboxSelection
              rowSelectionModel={rowSelectionModel}
              isRowSelectable={params => params.row.status === 'Pending'}
              onRowSelectionModelChange={newSelectionModel => {
                setRowSelectionModel(newSelectionModel as any)

                const filteredData = newSelectionModel.map(id => {
                  const selectedRow: any = store.data.find((row: any) => row.id === id)
                  
                  return {
                    id: selectedRow.id,
                    total_payment: selectedRow.total_payment,
                    month: selectedRow.month,
                    years: selectedRow.years,
                    status: selectedRow.status
                  }
                })

                setSelectedRows(filteredData)

                const totalAmount = filteredData
                  .filter(row => row.status !== 'Verified' && row.status !== 'Paid')
                  .reduce((sum, row) => sum + row.total_payment, 0)

                const formattedTotalAmount = new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0
                }).format(totalAmount)

                setJumlah(formattedTotalAmount)
              }}
              sx={{
                '& .MuiDataGrid-checkboxInput': {
                  ml: 0
                },
                '& .Mui-checked.Mui-disabled': {
                  color: 'rgba(0, 0, 0, 0.6)'
                }
              }}
            />
          )}
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        {' '}
        {/* Full width on mobile, 3/12 on medium screens and up */}
        <Card>
          <CardContent>
            <Grid item xs={12}>
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                Pembayaran Details
              </Typography>
            </Grid>
            <Box m={1} display='inline' />
            <Grid item xs={12} sm={12}>
              <InputLabel id='form-layouts-separator-select-label'>Nama Pembayaran</InputLabel>
              <TextField
                fullWidth
                value={spName ? spName.sp_name : ''}
                InputProps={{
                  readOnly: true
                }}
              />
            </Grid>
            <Box m={1} display='inline' />
            <Grid item xs={12} sm={12}>
              <InputLabel id='form-layouts-separator-select-label'>Tipe</InputLabel>
              <TextField
                fullWidth
                value={spName ? spName.type : ''}
                InputProps={{
                  readOnly: true
                }}
              />
            </Grid>
            <Box m={1} display='inline' />
            <Grid item xs={12} sm={12}>
              <InputLabel id='form-layouts-separator-select-label'>Jumlah</InputLabel>
              <TextField
                fullWidth
                value={jumlah}
                InputProps={{
                  readOnly: true
                }}
              />
            </Grid>
            <Box m={2} display='inline' />
            <Grid container justifyContent='flex-start'>
              <Button
                variant='contained'
                color='primary'
                onClick={handleClickOpen}
                disabled={rowSelectionModel.length === 0}
              >
                Bayar
              </Button>

              <Box m={1} display='inline' />

              <Button
                variant='outlined'
                color='secondary'
                onClick={() => {
                  window.history.back()
                }}
              >
                Kembali
              </Button>
            </Grid>
          </CardContent>
        </Card>
        {/* Dialog Konfirmasi Pembayaran */}
        <Dialog open={open} onClose={() => handleClose(false)} maxWidth='sm' fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant='h6' sx={{ ml: 1 }}>
                Konfirmasi Pembayaran
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>Apakah Anda yakin ingin melanjutkan pembayaran ini?</DialogContentText>
            <Box mt={2}>
              {selectedPaymentDetails
                .filter(payment => payment.status === 'Pending')
                .map(payment => (
                  <Typography
                    key={payment.id}
                    sx={{
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px',
                      borderRadius: '4px',
                      backgroundColor: theme => (theme.palette.mode === 'dark' ? '#424242' : '#f9f9f9'),
                      color: theme => (theme.palette.mode === 'dark' ? '#fff' : '#000'),
                      boxShadow: 1,
                      transition: 'background-color 0.3s, color 0.3s',
                      '&:hover': {
                        backgroundColor: theme => (theme.palette.mode === 'dark' ? '#616161' : '#e0e0e0')
                      }
                    }}
                  >
                    <span>
                      <strong>Bulan:</strong> {payment.month}
                    </span>
                    <span>
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 0
                      }).format(payment.total_payment)}
                    </span>
                  </Typography>
                ))}

              <Typography
                sx={{
                  mt: 2,
                  fontWeight: 'bold',
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px',
                  borderRadius: '4px',
                  backgroundColor: theme => (theme.palette.mode === 'dark' ? '#424242' : '#f9f9f9'),
                  color: theme => (theme.palette.mode === 'dark' ? '#fff' : '#000'),
                  boxShadow: 1
                }}
              >
                <span>
                  <strong>Total Pembayaran:</strong>
                </span>
                <span>
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 0
                  }).format(
                    selectedPaymentDetails
                      .filter(payment => payment.status === 'Pending')
                      .reduce((total, payment) => total + payment.total_payment, 0)
                  )}
                </span>
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleClose(false)} variant='contained' color='error'>
              Batal
            </Button>
            <Button
              onClick={() => {
                setIsLoading(true)
                onsubmit()
              }}
              variant='contained'
              color='primary'
              disabled={isLoading}
            >
              {isLoading ? (
                <Box display='flex' alignItems='center'>
                  <CircularProgress size={24} sx={{ marginRight: 1 }} />
                  <Typography variant='body2'>Loading...</Typography>
                </Box>
              ) : (
                'Ya, Lanjutkan'
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Grid>
  )
}

export default UserList
