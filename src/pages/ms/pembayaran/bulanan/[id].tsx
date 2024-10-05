import { useState, useEffect } from 'react'
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
import { fetchDataPaymentPayByMonth } from 'src/store/apps/pembayaran/bulanan/index'
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
  const [value] = useState<string>('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 15 })
  const [loading, setLoading] = useState<boolean>(true)
  const [rowSelectionModel, setRowSelectionModel] = useState<number[]>([])
  const [selectedRows, setSelectedRows] = useState<any[]>([])
  const [spName, setSpName] = useState<any>('')
  const [jumlah, setJumlah] = useState<string>('')
  const [clientKey, setClientKey] = useState('')
  const [snapUrl, setSnapUrl] = useState('')
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.PembayaranByMonth)
  const router = useRouter()
  const { id } = router.query
  const storedToken = window.localStorage.getItem('token')

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

  useEffect(() => {
    if (store.data && store.data.length > 0) {
      const firstItem = store.data[0]
      setSpName(firstItem)
    }
  }, [store.data])

  const [toastShown, setToastShown] = useState(false)
  const onsubmit = async () => {
    if (spName && jumlah) {
      try {
        const totalAmount = jumlah.replace(/[^\d]/g, '') // Hanya angka
        const filteredRows = selectedRows.filter(row => row.status !== 'Verified')

        const response = await fetch('/api/createMidtransTransaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            dataUsers: spName,
            dataPayment: filteredRows,
            total_amount: totalAmount,
            user_id: getDataLocal.id,
            school_id: getDataLocal.school_id
          })
        })

        const { transactionToken, orderId, transactionUrl } = await response.json() // Hapus transactionUrl

        if (transactionToken) {
          ;(window as any).snap.pay(transactionToken, {
            // autoRedirect: false, // Disable auto redirect for all statuses
            onSuccess: function () {
              if (!toastShown) {
                toast.success('Data pembayaran pending berhasil dikirim.')
                setToastShown(true)
              }
              try {
                // Mengirim data pending payment ke API /create-payment-pending menggunakan Axios
                axiosConfig
                  .post(
                    '/create-payment-pending',
                    {
                      dataUsers: spName,
                      dataPayment: filteredRows,
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
                      setJumlah('')
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
            },
            onPending: function () {
              if (!toastShown) {
                toast.success('Data pembayaran pending berhasil dikirim.')
                setToastShown(true)
              }
              try {
                // Mengirim data pending payment ke API /create-payment-pending menggunakan Axios
                axiosConfig
                  .post(
                    '/create-payment-pending',
                    {
                      dataUsers: spName,
                      dataPayment: filteredRows,
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
                      setJumlah('')
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

              // Logika lain untuk status pending
            },
            onError: function () {
              // Hapus event listener ketika terjadi error

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

  useEffect(() => {
    async function fetchClientKey() {
      try {
        const response = await fetch(`/api/getsettingapk?school_id=${getDataLocal.school_id}`)
        const data = await response.json()
        if (response.ok) {
          setClientKey(data.data.claientKey)
          setSnapUrl(data.data.snapUrl)
        } else {
          console.error(data.message)
        }
      } catch (error) {
        console.error('Error fetching client key:', error)
      }
    }
    fetchClientKey()
  }, [getDataLocal.school_id])
  useEffect(() => {
    if (clientKey && snapUrl) {
      const script = document.createElement('script')
      script.src = snapUrl // Use dynamic snap URL from API
      script.setAttribute('data-client-key', clientKey)
      document.body.appendChild(script)

      return () => {
        document.body.removeChild(script)
      }
    }
  }, [clientKey, snapUrl])

  const cekTransaksiById = () => {
    setJumlah('')
    
    // Mengambil token yang disimpan (misalnya, dari local storage)
    const token = localStorage.getItem('token')

    // Memanggil API menggunakan axios dengan query parameter user_id
    axiosConfig
      .get('/cekTransaksiSuccesMidtransByUserIdByMonth', {
        headers: {
          Authorization: `Bearer ${token}` // Menambahkan token di header
        },
        params: {
          user_id: getDataLocal.id // Menambahkan user_id sebagai query parameter
        }
      })
      .then(response => {
        console.log(response)

        if (response.data.success == true) {
          setLoading(true)
          setJumlah('')
          dispatch(
            fetchDataPaymentPayByMonth({
              id_payment: id,
              school_id: getDataLocal.school_id,
              user_id: getDataLocal.id,
              q: value
            })
          ).finally(() => {
            setLoading(false)
            setJumlah('')
          })
        }
      })
      .catch(error => {
        // Menangani error jika terjadi
        console.error('Error fetching transaction:', error)
      })
  }
  const backtodashboard = () => {
    router.push('/ms/dashboard/siswa/')
  }

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12} md={9}>
        <Card>
          <CardHeader title='Data Pembayaran' />
          <Divider sx={{ m: '0 !important' }} />
          <Box
            sx={{
              py: { xs: 2, md: 4 },
              px: { xs: 3, md: 6 },
              rowGap: 2,
              columnGap: 4,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <i></i>
            <Box sx={{ rowGap: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
              <Button
                variant='contained'
                color='warning'
                onClick={() => {
                  cekTransaksiById()
                }}
              >
                Cek Transaksi
              </Button>
            </Box>
          </Box>
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
              isRowSelectable={params => params.row.status !== 'Verified' && params.row.status !== 'Paid'}
              onRowSelectionModelChange={(newSelectionModel: any) => {
                setRowSelectionModel(newSelectionModel)

                // Only include rows where status is not 'Verified' or 'Paid'
                const filteredData = newSelectionModel
                  .map((id: any) => store.data.find((row: any) => row.id === id))
                  .filter((selectedRow: any) => selectedRow.status !== 'Verified' && selectedRow.status !== 'Paid')
                  .map((selectedRow: any) => ({
                    id: selectedRow.id,
                    total_payment: selectedRow.total_payment,
                    month: selectedRow.month,
                    years: selectedRow.years,
                    status: selectedRow.status
                  }))

                setSelectedRows(filteredData)

                const totalAmount = filteredData.reduce((sum: any, row: any) => sum + row.total_payment, 0)

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
              <TextField fullWidth value={spName ? spName.sp_name : ''} InputProps={{ readOnly: true }} />
            </Grid>
            <Box m={1} display='inline' />
            <Grid item xs={12} sm={12}>
              <InputLabel id='form-layouts-separator-select-label'>Tipe</InputLabel>
              <TextField fullWidth value={spName ? spName.type : ''} InputProps={{ readOnly: true }} />
            </Grid>
            <Box m={1} display='inline' />
            <Grid item xs={12} sm={12}>
              <InputLabel id='form-layouts-separator-select-label'>Jumlah</InputLabel>
              <TextField fullWidth value={jumlah} InputProps={{ readOnly: true }} />
            </Grid>
            <Box m={2} display='inline' />

            <Grid container justifyContent={{ xs: 'center', md: 'left' }}>
              <Button
                variant='contained'
                color='primary'
                onClick={() => {
                  onsubmit()
                }}
              >
                Bayar
              </Button>
              <Box m={1} display='inline' />
              <Button
                variant='outlined'
                color='secondary'
                onClick={() => {
                  backtodashboard()
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
