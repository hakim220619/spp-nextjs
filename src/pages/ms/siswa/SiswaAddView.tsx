// ** React Imports
import { useState, useEffect, ChangeEvent, forwardRef } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import { Box } from '@mui/system'
import Link from 'next/link'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Custom Imports
import axiosConfig from '../../../configs/axiosConfig'
import { useRouter } from 'next/navigation'
import DatePicker from 'react-datepicker'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import { CircularProgress, IconButton, InputAdornment } from '@mui/material'
import { GridVisibilityOffIcon } from '@mui/x-data-grid'

interface User {
  nisn: string
  full_name: string
  email: string
  phone: string
  password: string
  major: string
  status: 'ON' | 'OFF'
  class: string
  address: string
  image: File | null
  date_of_birth: '' // Add default value for date_of_birth
  school_id: ''
}

interface Major {
  id: string
  major_name: string
}

interface Class {
  id: any
  class_name: string
}
interface CustomInputProps {
  value: DateType
  label: string
  error: boolean
  onChange: (event: ChangeEvent) => void
}
const CustomInput = forwardRef(({ ...props }: CustomInputProps, ref) => {
  return <CustomTextField fullWidth inputRef={ref} {...props} sx={{ width: '100%' }} />
})
const schema = yup.object().shape({
  nisn: yup.string().required('Full name is required').min(3),
  full_name: yup.string().required('Full name is required').min(3),
  email: yup.string().email().required('Email is required'),
  phone: yup.string().required('Phone is required').min(10, 'Phone must be at least 10 digits'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  major: yup.string().required('Jurusan is required'),
  status: yup.string().oneOf(['ON', 'OFF'], 'Invalid status').required('Status is required'),
  class: yup.string().required('Class is required'),
  address: yup.string().required('Address is required')
})

const FormValidationSchema = () => {
  const router = useRouter()
  const [majors, setMajorses] = useState<Major[]>([])
  const [clas, setClas] = useState<Class[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false) // Add loading state
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const schoolId = getDataLocal?.school_id
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }
  const defaultValues: any = {
    nisn: '1242324534',
    full_name: 'asdasd',
    email: 'sdasd@gmail.com',
    phone: '6285797887711',
    password: '12345678',
    major: '',
    status: 'ON',
    class: '',
    address: 'asdasd',
    image: null,
    date_of_birth: ''
  }

  // Fetch Schools and Roles using useEffect
  useEffect(() => {
    const storedToken = window.localStorage.getItem('token')
    const fetchMajors = async () => {
      try {
        const response = await axiosConfig.get(`/getMajors/?schoolId=${schoolId}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        setMajorses(response.data)
      } catch (error) {
        console.error('Error fetching majors:', error)
      }
    }

    const fetchClases = async () => {
      try {
        const response = await axiosConfig.get(`/getClass/?schoolId=${schoolId}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        setClas(response.data)
      } catch (error) {
        console.error('Error fetching roles:', error)
      }
    }

    fetchMajors()
    fetchClases()
  }, [schoolId])

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<User>({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  const onSubmit = async (data: User) => {
    setLoading(true) // Start loading
    const localDate = new Date(data.date_of_birth).toLocaleDateString('en-CA') //
    const formData = new FormData()
    formData.append('nisn', data.nisn)
    formData.append('full_name', data.full_name)
    formData.append('email', data.email)
    formData.append('phone', data.phone)
    formData.append('password', data.password)
    formData.append('major_id', data.major)
    formData.append('status', data.status)
    formData.append('class_id', data.class)
    formData.append('address', data.address)
    formData.append('school_id', schoolId)
    formData.append('date_of_birth', localDate)

    if (data.image) {
      formData.append('image', data.image)
    }

    const storedToken = window.localStorage.getItem('token')
    try {
      await axiosConfig.post('/create-siswa', formData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${storedToken}`
        }
      })

      toast.success('Successfully Added!')
      router.push('/ms/siswa')
    } catch (error) {
      toast.error('Failed to add user')
    } finally {
      setLoading(false) // Stop loading
    }
  }

  return (
    <Card>
      <CardHeader title='Tambah Siswa' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={6}>
              <Controller
                name='nisn'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Nisn'
                    onChange={onChange}
                    placeholder='Leonard'
                    error={Boolean(errors.nisn)}
                    helperText={errors.nisn?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name='full_name'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Nama Lengkap'
                    onChange={onChange}
                    placeholder='Leonard'
                    error={Boolean(errors.full_name)}
                    helperText={errors.full_name?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name='email'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    type='email'
                    value={value}
                    label='Email'
                    onChange={onChange}
                    placeholder='leonard@gmail.com'
                    error={Boolean(errors.email)}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name='phone'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='No. Wa'
                    onChange={onChange}
                    placeholder='628123456789'
                    error={Boolean(errors.phone)}
                    helperText={errors.phone?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name='password'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Password'
                    onChange={onChange}
                    type={showPassword ? 'text' : 'password'}
                    error={Boolean(errors.password)}
                    helperText={errors.password?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            aria-label='toggle password visibility'
                            onClick={handleClickShowPassword}
                            edge='end'
                          >
                            {showPassword ? <GridVisibilityOffIcon /> : <GridVisibilityOffIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name='major'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    select
                    fullWidth
                    value={value}
                    label='Jurusan'
                    onChange={onChange}
                    error={Boolean(errors.major)}
                    helperText={errors.major?.message}
                  >
                    {majors.map(data => (
                      <MenuItem key={data.id} value={data.id}>
                        {data.major_name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name='class'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    select
                    fullWidth
                    value={value}
                    label='Kelas'
                    onChange={onChange}
                    error={Boolean(errors.class)}
                    helperText={errors.class?.message}
                  >
                    {clas.map(data => (
                      <MenuItem key={data.id} value={data.id}>
                        {data.class_name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name='status'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    select
                    fullWidth
                    value={value}
                    label='Status'
                    onChange={onChange}
                    error={Boolean(errors.status)}
                    helperText={errors.status?.message}
                  >
                    <MenuItem value='ON'>ON</MenuItem>
                    <MenuItem value='OFF'>OFF</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name='image'
                control={control}
                render={({ field: { onChange } }) => (
                  <CustomTextField
                    fullWidth
                    type='file'
                    label='Upload Image'
                    InputLabelProps={{
                      shrink: true // Agar label tetap muncul meskipun input type file
                    }}
                    inputProps={{
                      accept: 'image/*'
                    }}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      const file = event.target.files?.[0] || null
                      setValue('image', file)
                      onChange(event) // Triggers form update
                    }}
                    error={Boolean(errors.image)}
                    helperText={errors.image?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='date_of_birth'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <DatePickerWrapper>
                    <DatePicker
                      selected={value ? new Date(value) : null} // Ensure it's a Date object
                      onChange={(date: Date | null) => onChange(date)} // Pass the date to the form state
                      placeholderText='MM/DD/YYYY'
                      dateFormat='MM/dd/yyyy' // Optional: format the date display
                      customInput={
                        <CustomInput
                          value={(value as any) ? (new Date(value).toLocaleDateString('en-US') as any) : ''} // Display formatted date
                          onChange={onChange}
                          label='Tanggal Lahir'
                          error={Boolean(errors.date_of_birth)}
                          {...(errors.date_of_birth && { helperText: 'This field is required' })}
                        />
                      }
                    />
                  </DatePickerWrapper>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='address'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Alamat'
                    onChange={onChange}
                    placeholder='Jl Hr Agung'
                    error={Boolean(errors.address)}
                    helperText={errors.address?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Button type='submit' variant='contained' disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Submit'} {/* CircularProgress when loading */}
              </Button>
              <Box m={1} display='inline' />
              <Link href='/ms/siswa' passHref>
                <Button type='button' variant='contained' color='secondary'>
                  Back
                </Button>
              </Link>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default FormValidationSchema
