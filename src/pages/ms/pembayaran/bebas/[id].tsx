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
  CardContent
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
import axiosConfig from '../../../../configs/axiosConfig'
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
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const [value] = useState<string>('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 15 })
  const [loading, setLoading] = useState<boolean>(true)
  const [dataPayment, setDataPayment] = useState<any>('')
  const [jumlah, setJumlah] = useState<string>('')
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.PembayaranByFree)
  const router = useRouter()
  const { id } = router.query
  const storedToken = window.localStorage.getItem('token')
  const fetchPaymentDetails = useCallback(
    async (id: string) => {
      try {
        const storedToken = window.localStorage.getItem('token')

        // Get additional data from local storage or another function as necessary
        const school_id = getDataLocal.school_id
        const user_id = getDataLocal.id

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
    [getDataLocal.school_id, getDataLocal.id] // You should include these dependencies instead of `id`
  )

  useEffect(() => {
    setLoading(true)
    dispatch(
      fetchDataPaymentPayByFree({
        id_payment: id,
        school_id: getDataLocal.school_id,
        user_id: getDataLocal.id,
        q: value
      })
    ).finally(() => {
      setLoading(false)
    })

    fetchPaymentDetails(id as any)
  }, [dispatch, value, id, getDataLocal.school_id, getDataLocal.id, fetchPaymentDetails])

  const [toastShown, setToastShown] = useState(false)
  const onsubmit = async () => {
    if (dataPayment && jumlah) {
      try {
        const totalAmount = jumlah.replace(/[^\d]/g, '') // Hanya angka
        const response = await fetch('/api/createMidtransTransactionFree', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            dataPayment: dataPayment,
            total_amount: jumlah,
            user_id: dataPayment.user_id
          })
        })
        const { transactionToken, orderId, transactionUrl } = await response.json()

        if (transactionToken) {
          ;(window as any).snap.pay(transactionToken, {
            // autoRedirect: false, // Disable auto redirect for all statuses
            onSuccess: function () {
              toast.success('Pembayaran berhasil!')
              try {
                // Mengirim data pending payment ke API /create-payment-pending menggunakan Axios
                axiosConfig
                  .post(
                    '/create-payment-success-Free',
                    {
                      dataPayment: dataPayment,
                      order_id: orderId,
                      redirect_url: transactionUrl,
                      total_amount: totalAmount
                    },
                    {
                      headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${storedToken}`
                      }
                    }
                  )
                  .then(response => {
                    if (response.status === 200) {
                      setLoading(true)
                      dispatch(
                        fetchDataPaymentPayByFree({
                          id_payment: id,
                          school_id: getDataLocal.school_id,
                          user_id: getDataLocal.id,
                          q: value
                        })
                      ).finally(() => {
                        setLoading(false)
                        setJumlah('0')
                      })
                    } else {
                      toast.error('Gagal mengirim data pembayaran pending.')
                    }
                  })
                  .catch(error => {
                    console.error('Error sending pending payment data:', error)
                    toast.error('Terjadi kesalahan saat mengirim data pembayaran pending.')
                  })
              } catch (error) {
                console.error('Error:', error)

                // toast.error('Terjadi kesalahan saat mengirim data pembayaran pending.')
              }
              window.removeEventListener('beforeunload', handleBeforeUnload)
            },
            onPending: function () {
              if (!toastShown) {
                toast.success('Data pembayaran pending berhasil dikirim.')
                setToastShown(true) // Set state to true to prevent multiple toasts
              }

              try {
                // Mengirim data pending payment ke API /create-payment-pending menggunakan Axios
                axiosConfig
                  .post(
                    '/create-payment-pending-Free',
                    {
                      dataPayment: dataPayment,
                      order_id: orderId,
                      redirect_url: transactionUrl,
                      total_amount: totalAmount
                    },
                    {
                      headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${storedToken}`
                      }
                    }
                  )
                  .then(response => {
                    if (response.status === 200) {
                      setLoading(true)
                      dispatch(
                        fetchDataPaymentPayByFree({
                          id_payment: id,
                          school_id: getDataLocal.school_id,
                          user_id: getDataLocal.id,
                          q: value
                        })
                      ).finally(() => {
                        setLoading(false)
                        setJumlah('0')
                      })
                    } else {
                      toast.error('Gagal mengirim data pembayaran pending.')
                    }
                  })
                  .catch(error => {
                    console.error('Error sending pending payment data:', error)
                    toast.error('Terjadi kesalahan saat mengirim data pembayaran pending.')
                  })
              } catch (error) {
                console.error('Error:', error)

                // toast.error('Terjadi kesalahan saat mengirim data pembayaran pending.')
              }
              window.removeEventListener('beforeunload', handleBeforeUnload)
            },
            onError: function () {
              window.removeEventListener('beforeunload', handleBeforeUnload)
              toast.error('Pembayaran gagal!')
            }
          })
        } else {
          toast.error('Gagal mendapatkan token pembayaran dari Midtrans.')
        }
      } catch (error) {
        toast.error('Terjadi kesalahan saat memproses pembayaran.')
      }
    } else {
      toast.error('Data tidak lengkap. Pastikan semua informasi sudah diisi.')
    }
  }
  const handleBeforeUnload = function (e: any) {
    e.preventDefault()
    e.returnValue = '' // Mencegah default behavior redirect
  }

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!)
    document.body.appendChild(script)
  }, [])
  const formatRupiah = (value: any) => {
    if (!value) return ''

    return 'Rp ' + Number(value).toLocaleString('id-ID', { minimumFractionDigits: 0 })
  }
  const handleChange = (e: any) => {
    const value = e.target.value.replace(/[^0-9]/g, '') // Hanya angka
    setJumlah(value)
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
                onClick={() => {
                  onsubmit()
                }}
                disabled={
                  parseInt(jumlah.replace(/[^\d]/g, ''), 10) >
                  dataPayment.amount - store.data.reduce((acc: number, curr: any) => acc + curr.amount, 0)
                } // Disable jika jumlah melebihi total pembayaran
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
      </Grid>
    </Grid>
  )
}

export default UserList
