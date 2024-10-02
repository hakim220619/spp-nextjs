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
  DialogActions,
  DialogContentText
} from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import CustomChip from 'src/@core/components/mui/chip'
import { fetchDataPaymentPayByFree } from 'src/store/apps/pembayaran/bebas/index'
import { RootState, AppDispatch } from 'src/store'
import { UsersType } from 'src/types/apps/userTypes'
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
  Paid: { title: 'Lunas', color: 'success' },
  Verified: { title: 'Proses Pembayaran', color: 'warning' }
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
  {
    field: 'no',
    headerName: 'No',
    width: 70,
    renderCell: (params: GridRenderCellParams) => {
      return params.api.getRowIndexRelativeToVisibleRows(params.id) + 1 // Menghasilkan nomor urut otomatis dimulai dari 1
    },
    sortable: false // Menonaktifkan sorting untuk kolom ini
  },
  {
    field: 'full_name',
    headerName: 'Pembayaran ke',
    flex: 0.175,
    minWidth: 140,
    renderCell: (params: GridRenderCellParams) => {
      const sortedRowIds = params.api.getSortedRowIds() // Mendapatkan urutan ID setelah sorting
      const rowIndex = sortedRowIds.indexOf(params.id) + 1 // Mencari index dari ID dan increment

      return `Pembayaran ke ${rowIndex}`
    },
    sortable: false // Menonaktifkan sorting untuk kolom ini
  },
  {
    field: 'amount',
    headerName: 'Jumlah',
    flex: 0.175,
    minWidth: 140,
    valueGetter: ({ row }) => row.amount + row.affiliate, // Summing amount and affiliate
    valueFormatter: ({ value }) =>
      new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      }).format(value)
  },
  { field: 'metode_pembayaran', headerName: 'Metode Pembayaran', flex: 0.175, minWidth: 140 },
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
    field: 'created_at',
    headerName: 'Dibuat',
    flex: 0.175,
    minWidth: 140,
    valueFormatter: params => {
      const date = new Date(params.value)

      // Format date
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0') // Month is 0-based, so add 1
      const year = date.getFullYear()

      // Format time
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')

      return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`
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
  const [value] = useState<string>('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 15 })
  const [loading, setLoading] = useState<boolean>(true)
  const [dataPayment, setDataPayment] = useState<any>('')
  const [jumlah, setJumlah] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false) // State for overlay loading

  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.PembayaranByFree)
  const router = useRouter()
  const { id, school_id, user_id } = router.query
  const storedToken = window.localStorage.getItem('token')
  const fetchPaymentDetails = useCallback(
    async (id: string) => {
      try {
        const storedToken = window.localStorage.getItem('token')

        // Get additional data from local storage or another function as necessary

        // Send all parameters as query parameters
        const response = await axiosConfig.get('/list-payment-pay-byFree', {
          params: {
            uid: id,
            id_payment: id,
            school_id,
            user_id
          },
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })

        setDataPayment(response.data)
      } catch (error) {
        console.error('Error fetching payment details:', error)
      }
    },
    [school_id, user_id] // You should include these dependencies instead of `id`
  )

  useEffect(() => {
    setLoading(true)
    dispatch(
      fetchDataPaymentPayByFree({
        id_payment: id,
        school_id: school_id as any,
        user_id: user_id as any,
        q: value
      })
    ).finally(() => {
      setLoading(false)
    })

    fetchPaymentDetails(id as any)
  }, [dispatch, value, id, school_id, user_id, fetchPaymentDetails])
  const onsubmit = async () => {
    setIsLoading(true)
    if (dataPayment && jumlah) {
      try {
        const totalAmount = parseInt(jumlah.replace(/[^\d]/g, ''), 10) || 0
        const response = await axiosConfig.post(
          '/create-payment-pending-byAdmin-free',
          {
            dataPayment: dataPayment,
            total_amount: totalAmount,
            user_id: dataPayment.user_id,
            total_affiliate: dataPayment.affiliate
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${storedToken}` // Add the token here
            }
          }
        )

        if (response.status == 200) {
          setLoading(true)
          dispatch(
            fetchDataPaymentPayByFree({
              id_payment: id,
              school_id: school_id as any,
              user_id: user_id as any,
              q: value
            })
          ).finally(() => {
            setLoading(false)
            setJumlah('0')
            setOpenDialog(false)
            setIsLoading(false)
          })
        }
        toast.success('Pembayaran Berhasil!')
      } catch (error) {
        setIsLoading(false)
        toast.error('Terjadi kesalahan saat memproses pembayaran.')
      }
    } else {
      setIsLoading(false)
      toast.error('Data tidak lengkap. Pastikan semua informasi sudah diisi.')
    }
  }
  const formatRupiah = (value: any) => {
    if (!value) return ''

    return 'Rp ' + Number(value).toLocaleString('id-ID', { minimumFractionDigits: 0 })
  }
  const handleChange = (e: any) => {
    const value = e.target.value.replace(/[^0-9]/g, '') // Hanya angka
    setJumlah(value)
  }

  const [openDialog, setOpenDialog] = useState(false)

  const handleDialogOpen = () => {
    setOpenDialog(true)
  }

  const handleDialogClose = () => {
    setOpenDialog(false)
  }
  
  return (
    <Grid container spacing={6.5}>
      <Grid item xs={9}>
        <Card>
          <CardHeader title='Data Pembayaran' />
          <Divider sx={{ m: '0 !important' }} />
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
            />
          )}
        </Card>
      </Grid>
      <Grid item xs={3}>
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
                value={dataPayment ? dataPayment.sp_name : ''} // Menampilkan nama pembayaran
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
                value={dataPayment ? dataPayment.type : ''} // Menampilkan tipe pembayaran
                InputProps={{
                  readOnly: true
                }}
              />
            </Grid>
            <Box m={1} display='inline' />
            <Grid item xs={12} sm={12}>
              <InputLabel id='form-layouts-separator-select-label'>Total Pembayaran</InputLabel>
              <TextField
                fullWidth
                value={formatRupiah(
                  dataPayment.amount - store.data.reduce((acc: number, curr: any) => acc + curr.amount, 0)
                )}
              />
            </Grid>

            <Grid item xs={12} sm={12}>
              <InputLabel id='form-layouts-separator-select-label'>Jumlah</InputLabel>
              <TextField fullWidth value={formatRupiah(jumlah)} onChange={handleChange} />
            </Grid>
            <Box m={2} display='inline' />
            {/* Tombol Bayar dan Kembali */}
            <Grid container justifyContent='left'>
              <Button
                variant='contained'
                color='primary'
                onClick={handleDialogOpen} // Open dialog instead of submitting
                disabled={
                  !jumlah || // Disable if jumlah is null or empty
                  parseInt(jumlah.replace(/[^\d]/g, ''), 10) === 0 || // Disable if jumlah is 0
                  parseInt(jumlah.replace(/[^\d]/g, ''), 10) >
                    dataPayment.amount - store.data.reduce((acc: number, curr: any) => acc + curr.amount, 0)
                } // Disable if amount exceeds total payment
              >
                Bayar
              </Button>

              <Box m={1} display='inline' />
              <Button
                variant='outlined'
                color='secondary'
                onClick={() => {
                  // Logic untuk tombol Kembali, misalnya kembali ke halaman sebelumnya
                  window.history.back() // Kembali ke halaman sebelumnya
                }}
              >
                Kembali
              </Button>
            </Grid>
          </CardContent>
        </Card>
        {/* Dialog Confirmation */}
        <Dialog open={openDialog} onClose={handleDialogClose}>
          <DialogTitle textAlign={'center'}>Konfirmasi Pembayaran</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>Apakah Anda yakin ingin melanjutkan pembayaran ini?</DialogContentText>
            <Box mt={2}>
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
                  <strong>Nama Pembayaran:</strong>
                </span>
                <span>{dataPayment.sp_name}</span> {/* Assuming full_name is part of dataPayment */}
              </Typography>
              <Typography
                sx={{
                  mt: 1,
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
                  <strong>Sekolah :</strong>
                </span>
                <span>{dataPayment.school_name}</span> {/* Assuming kelas_jurusan is part of dataPayment */}
              </Typography>
              <Typography
                sx={{
                  mt: 1,
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
                  <strong>Nama Lengkap :</strong>
                </span>
                <span>{dataPayment.full_name}</span> {/* Assuming kelas_jurusan is part of dataPayment */}
              </Typography>
              <Typography
                sx={{
                  mt: 1,
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
                  <strong>Kelas :</strong>
                </span>
                <span>{dataPayment.class_name}</span> {/* Assuming kelas_jurusan is part of dataPayment */}
              </Typography>
              <Typography
                sx={{
                  mt: 1,
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
                  <strong>Jurusan :</strong>
                </span>
                <span>{dataPayment.major_name}</span> {/* Assuming kelas_jurusan is part of dataPayment */}
              </Typography>
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
                <span>{formatRupiah(Number(jumlah) + Number(dataPayment.affiliate || 0))}</span>
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => handleDialogClose()}
              variant='contained'
              color='error'
              sx={{ '&:hover': { backgroundColor: 'rgba(255, 0, 0, 0.1)' } }}
            >
              Batal
            </Button>
            <Button
              onClick={() => {
                setIsLoading(true) // Start loading
                onsubmit()
              }}
              variant='contained'
              color='primary'
              disabled={isLoading} // Disable button if loading
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
