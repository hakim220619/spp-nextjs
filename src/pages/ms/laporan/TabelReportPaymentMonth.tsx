import { useState, useEffect, useCallback } from 'react'
import { Card, Grid, CircularProgress, IconButton } from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useDispatch, useSelector } from 'react-redux'
import CustomChip from 'src/@core/components/mui/chip'
import { ListPaymentReportAdmin } from 'src/store/apps/laporan/index'
import { RootState, AppDispatch } from 'src/store'
import TableHeader from 'src/pages/ms/laporan/TableHeader'
import toast from 'react-hot-toast'
import Icon from 'src/@core/components/icon'

const statusObj: any = {
  Pending: { title: 'Proses Pembayaran', color: 'error' },
  Verified: { title: 'Belum Lunas', color: 'warning' },
  Paid: { title: 'Lunas', color: 'success' }
}
const typeObj: any = {
  BULANAN: { title: 'BULANAN', color: 'info' },
  BEBAS: { title: 'BEBAS', color: 'warning' }
}

const RowOptions = () => {
  return (
    <>
      <IconButton size='small' color='error'>
        <Icon icon='tabler:file-type-pdf' />
      </IconButton>
    </>
  )
}

const columns: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 70 },
  { field: 'unit_name', headerName: 'Unit', flex: 0.175, minWidth: 140 },
  { field: 'full_name', headerName: 'Nama Siswa', flex: 0.175, minWidth: 140 },
  { field: 'sp_name', headerName: 'Pembayaran', flex: 0.175, minWidth: 140 },
  {
    field: 'amount',
    headerName: 'Jumlah',
    flex: 0.175,
    minWidth: 140,
    renderCell: params => {
      const formattedAmount = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(params.value)

      return <span>{formattedAmount}</span> // Render the formatted amount
    }
  },
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
  { field: 'years', headerName: 'Tahun', flex: 0.175, maxWidth: 120 },
  {
    field: 'status',
    headerName: 'Status',
    flex: 0.175,
    maxWidth: 240,
    renderCell: (params: GridRenderCellParams) => {
      const status = statusObj[params.row.status]

      return (
        <CustomChip
          rounded
          size='small'
          skin='light'
          color={status?.color}
          label={status?.title}
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
    renderCell: () => <RowOptions />
  }
]

interface TabelReportPaymentMonthProps {
  school_id: any
  unit_id: any
  user_id: any
  setting_payment_uid: any
  year: any
  type: string
  refresh: any
}

const TabelReportPaymentMonth = ({
  school_id,
  unit_id,
  user_id,
  year,
  type,
  setting_payment_uid,
  refresh
}: TabelReportPaymentMonthProps) => {
  const [value, setValue] = useState<string>('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 50 })
  const [loading, setLoading] = useState<boolean>(true)
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.ListPaymentReportAdmin)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        await dispatch(
          ListPaymentReportAdmin({ school_id, unit_id, user_id, year, type, setting_payment_uid, q: value })
        )
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to fetch data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dispatch,setting_payment_uid, type, year, school_id, unit_id, user_id, value, refresh])

  const handleFilter = useCallback((val: string) => setValue(val), [])

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

export default TabelReportPaymentMonth
