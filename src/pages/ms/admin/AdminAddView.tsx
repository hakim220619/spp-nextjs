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

interface User {
  full_name: string
  email: string
  phone: string
  password: string
  school: string
  status: 'ON' | 'OFF'
  role: string
  address: string
  image: File | null
  date_of_birth: '' // Add default value for date_of_birth
}

interface School {
  id: string
  school_name: string
}

interface Role {
  id: any
  role_name: string
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
  full_name: yup.string().required('Full name is required').min(3),
  email: yup.string().email().required('Email is required'),
  phone: yup.string().required('Phone is required').min(10, 'Phone must be at least 10 digits'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  school: yup.string().required('School is required'),
  status: yup.string().oneOf(['ON', 'OFF'], 'Invalid status').required('Status is required'),
  role: yup.string().required('Role is required'),
  address: yup.string().required('Address is required')
})

const FormValidationSchema = () => {
  const router = useRouter()
  const [schools, setSchools] = useState<School[]>([])
  const [roles, setRoles] = useState<Role[]>([])

  const defaultValues: any = {
    full_name: 'asdasd',
    email: 'sdasd@gmail.com',
    phone: '6285797887711',
    password: '12345678',
    school: '',
    status: 'ON',
    role: '',
    address: 'asdasd',
    image: null,
    date_of_birth: ''
  }

  // Fetch Schools and Roles using useEffect
  useEffect(() => {
    const storedToken = window.localStorage.getItem('token')

    const fetchSchools = async () => {
      try {
        const response = await axiosConfig.get('/getSchool', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        setSchools(response.data)
      } catch (error) {
        console.error('Error fetching schools:', error)
      }
    }

    const fetchRoles = async () => {
      try {
        const response = await axiosConfig.get('/getRole', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        setRoles(response.data)
      } catch (error) {
        console.error('Error fetching roles:', error)
      }
    }

    fetchSchools()
    fetchRoles()
  }, [])

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

  const onSubmit = (data: User) => {
    const localDate = new Date(data.date_of_birth).toLocaleDateString('en-CA') //
    const formData = new FormData()
    formData.append('full_name', data.full_name)
    formData.append('email', data.email)
    formData.append('phone', data.phone)
    formData.append('password', data.password)
    formData.append('school', data.school)
    formData.append('status', data.status)
    formData.append('role', data.role)
    formData.append('address', data.address)
    formData.append('date_of_birth', localDate)

    if (data.image) {
      formData.append('image', data.image)
    }

    const storedToken = window.localStorage.getItem('token')
    axiosConfig
      .post('/create-admin', formData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${storedToken}`
        }
      })
      .then(response => {
        console.log(response)

        toast.success('Successfully Added!')
        router.push('/ms/admin')
      })
      .catch(() => {
        toast.error('Failed to add user')
      })
  }
  
  return (
    <Card>
      <CardHeader title='Add New User' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
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
                    type='password'
                    error={Boolean(errors.password)}
                    helperText={errors.password?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name='school'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    select
                    fullWidth
                    value={value}
                    label='Sekolah'
                    onChange={onChange}
                    error={Boolean(errors.school)}
                    helperText={errors.school?.message}
                  >
                    {schools.map(school => (
                      <MenuItem key={school.id} value={school.id}>
                        {school.school_name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name='role'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    select
                    fullWidth
                    value={value}
                    label='Role'
                    onChange={onChange}
                    error={Boolean(errors.role)}
                    helperText={errors.role?.message}
                  >
                    {roles
                      .filter(role => role.id !== 160) // Filter untuk mengecualikan ID 160
                      .map(role => (
                        <MenuItem key={role.id} value={role.id}>
                          {role.role_name}
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
                          label='Date of Birth'
                          error={Boolean(errors.date_of_birth)}
                          {...(errors.date_of_birth && { helperText: 'This field is required' })}
                        />
                      }
                    />
                  </DatePickerWrapper>
                )}
              />
            </Grid>

            <Grid item xs={6}>
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
              <Button type='submit' variant='contained'>
                Submit
              </Button>
              <Box m={1} display='inline' />
              <Link href='/ms/users' passHref>
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
