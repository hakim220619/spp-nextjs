import { useState, useEffect, useCallback } from 'react'
import { Card, Grid, CircularProgress, IconButton } from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useDispatch, useSelector } from 'react-redux'
import CustomChip from 'src/@core/components/mui/chip'
import { ListPaymentTunggakan } from 'src/store/apps/tunggakan/index'
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
    field: 'pending',
    headerName: 'Tunggakan',
    flex: 0.175,
    minWidth: 140,
    valueGetter: params => {
      const { row } = params

      return row.pending - (row.detail_verified + row.detail_paid)
    },
    valueFormatter: ({ value }) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      }).format(value)
    }
  },
  {
    field: 'verified',
    headerName: 'Proses Pembayaran',
    flex: 0.175,
    minWidth: 140,
    valueGetter: params => {
      // Check if the type is BULANAN or BEBAS
      return params.row.type === 'BULANAN' ? params.row.verified : params.row.detail_verified
    },
    valueFormatter: ({ value }) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0 // Menghilangkan bagian desimal
      }).format(value)
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
    minWidth: 190,
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
  clas: any
  major: any
  refresh: any
}

const TabelReportPaymentMonth = ({
  school_id,
  unit_id,
  user_id,
  clas,
  major,
  refresh
}: TabelReportPaymentMonthProps) => {
  const [value, setValue] = useState<string>('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 50 })
  const [loading, setLoading] = useState<boolean>(true)
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.ListPaymentTunggakan)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        await dispatch(ListPaymentTunggakan({ school_id, unit_id, user_id, clas: clas.id, major: major.id, q: value }))
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to fetch data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dispatch, school_id, unit_id, clas, major, user_id, value, refresh])

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
