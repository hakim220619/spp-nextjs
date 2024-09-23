import { useState, ChangeEvent, useEffect } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
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

interface ClassForm {
  sp_name: string
  sp_desc: string
  year: string
  sp_type: string
  sp_status: 'ON' | 'OFF'
}

// Updated schema to use 'years' instead of 'year'
const schema = yup.object().shape({
  sp_name: yup.string().required('SP Name is required'),
  sp_desc: yup.string().required('SP Description is required'),
  year: yup.string().required('Year is required'), // Add year as a required string field
  sp_type: yup.string().required('SP Type is required'), // Add sp_type as a required string field
  sp_status: yup.string().oneOf(['ON', 'OFF'], 'Invalid status').required('Status is required')
})

const SettingAddPemabayaran = () => {
  const router = useRouter()
  const [years, setYears] = useState<string[]>([])
  const [sp_types, setSpTypes] = useState<any[]>(['BULANAN', 'BEBAS'])

  const defaultValues: ClassForm = {
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
  } = useForm<ClassForm>({
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

  const onSubmit = (data: ClassForm) => {
    console.log(data)

    const formData = new FormData()
    formData.append('school_id', schoolId)
    formData.append('sp_name', data.sp_name)
    formData.append('sp_desc', data.sp_desc)
    formData.append('years', data.year) // Use the selected year state
    formData.append('sp_type', data.sp_type) // Use the selected type state
    formData.append('sp_status', data.sp_status)

    const storedToken = window.localStorage.getItem('token')
    axiosConfig
      .post('/create-setting-pembayaran', formData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${storedToken}`
        }
      })
      .then(response => {
        toast.success('Successfully Added Class!')
        router.push('/ms/setting/pembayaran')
      })
      .catch(() => {
        toast.error('Failed to add class')
      })
  }

  return (
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
                    placeholder='e.g. SP A'
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
                    {years.map(data => (
                      <MenuItem key={data} value={data}>
                        {data}
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
                    label='Tipe'
                    onChange={onChange}
                    error={Boolean(errors.sp_type)}
                    helperText={errors.sp_type?.message}
                  >
                    {sp_types.map(data => (
                      <MenuItem key={data} value={data}>
                        {data}
                      </MenuItem>
                    ))}
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
                    placeholder='e.g. Description of SP A'
                    error={Boolean(errors.sp_desc)}
                    helperText={errors.sp_desc?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Button type='submit' variant='contained'>
                Submit
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
  )
}

export default SettingAddPemabayaran
