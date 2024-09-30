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
import { fetchDataPaymentPayByMonth } from 'src/store/apps/pembayaran/bulanan/index'
import { RootState, AppDispatch } from 'src/store'
import { UsersType } from 'src/types/apps/userTypes'
import TableHeader from 'src/pages/ms/pembayaran/bulanan/TableHeader'
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
  const [value, setValue] = useState<string>('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 15 })
  const [loading, setLoading] = useState<boolean>(true)
  const [rowSelectionModel, setRowSelectionModel] = useState<number[]>([])
  const [selectedRows, setSelectedRows] = useState<any[]>([])
  const [spName, setSpName] = useState<any>('')
  const [jumlah, setJumlah] = useState<string>('')
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

  const handleFilter = useCallback((val: string) => setValue(val), [])
  const [toastShown, setToastShown] = useState(false)
  const onsubmit = async () => {
    if (spName && jumlah) {
      try {
        const totalAmount = jumlah.replace(/[^\d]/g, '') // Hanya angka
        console.log(totalAmount)

        const filteredRows = selectedRows.filter(row => row.status !== 'Verified')
        console.log(filteredRows)
        console.log(spName)

        const response = await fetch('/api/createMidtransTransaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            dataUsers: spName,
            dataPayment: filteredRows,
            total_amount: totalAmount,
            user_id: getDataLocal.id
          })
        })

        const { transactionToken, orderId, transactionUrl } = await response.json() // Hapus transactionUrl

        if (transactionToken) {
          var snap: any
          snap.pay(transactionToken, {
            // autoRedirect: false, // Disable auto redirect for all statuses
            onSuccess: function () {
              if (!toastShown) {
                window.removeEventListener('beforeunload', handleBeforeUnload)
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
                        setJumlah('0')
                      })
                    } else {
                      window.removeEventListener('beforeunload', handleBeforeUnload)

                      toast.error('Gagal mengirim data pembayaran pending.')
                    }
                  })
                  .catch(error => {
                    window.removeEventListener('beforeunload', handleBeforeUnload)

                    console.error('Error sending pending payment data:', error)
                    toast.error('Terjadi kesalahan saat mengirim data pembayaran pending.')
                  })
              } catch (error) {
                window.removeEventListener('beforeunload', handleBeforeUnload)

                console.error('Error:', error)

                // toast.error('Terjadi kesalahan saat mengirim data pembayaran pending.')
              }
              window.addEventListener('beforeunload', handleBeforeUnload)
            },
            onPending: function () {
              if (!toastShown) {
                window.removeEventListener('beforeunload', handleBeforeUnload)
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
                        setJumlah('0')
                      })
                    } else {
                      window.removeEventListener('beforeunload', handleBeforeUnload)

                      toast.error('Gagal mengirim data pembayaran pending.')
                    }
                  })
                  .catch(error => {
                    window.removeEventListener('beforeunload', handleBeforeUnload)

                    console.error('Error sending pending payment data:', error)
                    toast.error('Terjadi kesalahan saat mengirim data pembayaran pending.')
                  })
              } catch (error) {
                window.removeEventListener('beforeunload', handleBeforeUnload)

                console.error('Error:', error)

                // toast.error('Terjadi kesalahan saat mengirim data pembayaran pending.')
              }
              window.addEventListener('beforeunload', handleBeforeUnload)

              // Logika lain untuk status pending
            },
            onError: function () {
              // Hapus event listener ketika terjadi error
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

  // Fungsi event handler untuk mencegah redirect atau unload
  const handleBeforeUnload = function (e: any) {
    e.preventDefault()
    e.returnValue = '' // Mencegah default behavior redirect
  }

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
    script.setAttribute('data-client-key', 'SB-Mid-client-a3XBeF6t11TJ5LWQ')
    document.body.appendChild(script)
  }, [])

  const cekTransaksiById = () => {
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
        }
      })
      .catch(error => {
        // Menangani error jika terjadi
        console.error('Error fetching transaction:', error)
      })
  }

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={9}>
        <Card>
          <CardHeader title='Data Pembayaran' />
          <Divider sx={{ m: '0 !important' }} />
          <Box
            sx={{
              py: 4,
              px: 6,
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
              isRowSelectable={params => params.row.status !== 'Verified' && params.row.status !== 'Paid'} // Disable selection for rows with "Verified" status
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
                  .filter(row => row.status !== 'Verified') // Filter rows where status is not "Verified"
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
                  ml: 0 // Align checkbox to the left
                },
                '& .Mui-checked.Mui-disabled': {
                  color: 'rgba(0, 0, 0, 0.6)' // Keep checkbox with a "checked" and "disabled" state
                }
              }}
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
                value={spName ? spName.sp_name : ''} // Menampilkan nama pembayaran
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
                value={spName ? spName.type : ''} // Menampilkan tipe pembayaran
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
            {/* Tombol Bayar dan Kembali */}
            <Grid container justifyContent='left'>
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
