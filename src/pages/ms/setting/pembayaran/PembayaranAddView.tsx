import { useState, useEffect } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Backdrop from '@mui/material/Backdrop'
import { Box } from '@mui/system'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Custom Imports
import axiosConfig from '../../../../configs/axiosConfig'
import { useRouter } from 'next/navigation'

// ** Interface for form data
interface PaymentForm {
  sp_name: string
  sp_desc: string
  year: string
  sp_type: string
  sp_status: 'ON' | 'OFF'
}

// ** Validation schema using Yup
const schema = yup.object().shape({
  sp_name: yup.string().required('Nama Pembayaran wajib diisi'),
  sp_desc: yup.string().required('Deskripsi Pembayaran wajib diisi'),
  year: yup.string().required('Tahun wajib diisi'),
  sp_type: yup.string().required('Tipe Pembayaran wajib diisi'),
  sp_status: yup.string().oneOf(['ON', 'OFF'], 'Status tidak valid').required('Status wajib diisi')
})

const SettingAddPembayaran = () => {
  const router = useRouter()
  const [years, setYears] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false) // State for overlay loading

  const defaultValues: PaymentForm = {
    sp_name: '',
    sp_desc: '',
    year: '',
    sp_type: '',
    sp_status: 'ON'
  }

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<PaymentForm>({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const schoolId = getDataLocal?.school_id

  useEffect(() => {
    const currentYear = new Date().getFullYear()
    const generatedYears = []

    for (let i = currentYear - 2; i <= currentYear + 2; i++) {
      generatedYears.push(`${i}/${i + 1}`)
    }
    setYears(generatedYears)
  }, [])

  const onSubmit = (formData: PaymentForm) => {
    const data = new FormData()
    data.append('school_id', schoolId)
    data.append('sp_name', formData.sp_name.toUpperCase())
    data.append('sp_desc', formData.sp_desc.toUpperCase())
    data.append('years', formData.year)
    data.append('sp_type', formData.sp_type)
    data.append('sp_status', formData.sp_status)

    const storedToken = window.localStorage.getItem('token')

    setIsLoading(true) // Show loading overlay
    axiosConfig
      .post('/create-setting-pembayaran', data, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${storedToken}`
        }
      })
      .then(() => {
        toast.success('Pembayaran berhasil ditambahkan!')
        router.push('/ms/setting/pembayaran')
      })
      .catch(() => {
        toast.error('Gagal menambahkan pembayaran')
      })
      .finally(() => {
        setIsLoading(false) // Hide loading overlay
      })
  }

  return (
    <>
      <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={isLoading}>
        <CircularProgress color='inherit' />
      </Backdrop>

      <Card>
        <CardHeader title='Tambah Pembayaran' />
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={5}>
              <Grid item xs={6}>
                <Controller
                  name='sp_name'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      value={value}
                      label='Nama Pembayaran'
                      onChange={onChange}
                      placeholder='Contoh: SP A'
                      error={Boolean(errors.sp_name)}
                      helperText={errors.sp_name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name='year'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      select
                      fullWidth
                      value={value}
                      label='Tahun'
                      onChange={onChange}
                      error={Boolean(errors.year)}
                      helperText={errors.year?.message}
                    >
                      {years.map(year => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>

              <Grid item xs={6}>
                <Controller
                  name='sp_type'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      select
                      fullWidth
                      value={value}
                      label='Tipe Pembayaran'
                      onChange={onChange}
                      error={Boolean(errors.sp_type)}
                      helperText={errors.sp_type?.message}
                    >
                      <MenuItem value='BULANAN'>BULANAN</MenuItem>
                      <MenuItem value='BEBAS'>BEBAS</MenuItem>
                    </CustomTextField>
                  )}
                />
              </Grid>

              <Grid item xs={6}>
                <Controller
                  name='sp_status'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      select
                      fullWidth
                      value={value}
                      label='Status'
                      onChange={onChange}
                      error={Boolean(errors.sp_status)}
                      helperText={errors.sp_status?.message}
                    >
                      <MenuItem value='ON'>ON</MenuItem>
                      <MenuItem value='OFF'>OFF</MenuItem>
                    </CustomTextField>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name='sp_desc'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      value={value}
                      label='Deskripsi'
                      onChange={onChange}
                      placeholder='Contoh: Deskripsi SP A'
                      error={Boolean(errors.sp_desc)}
                      helperText={errors.sp_desc?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Button type='submit' variant='contained' disabled={isLoading}>
                  {isLoading ? <CircularProgress size={24} /> : 'Submit'}
                </Button>

                <Box m={1} display='inline' />
                <Button
                  type='button'
                  variant='contained'
                  color='secondary'
                  onClick={() => router.push('/ms/setting/pembayaran')}
                >
                  Back
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </>
  )
}

export default SettingAddPembayaran
