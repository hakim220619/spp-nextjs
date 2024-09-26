import { useState, useCallback, useEffect, FormEvent, ChangeEvent, forwardRef } from 'react'
import { Controller, useForm } from 'react-hook-form'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'

// Custom Component Imports
import CustomTextField from 'src/@core/components/mui/text-field'
import toast from 'react-hot-toast'

// Axios Import
import axiosConfig from '../../../configs/axiosConfig'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { CircularProgress } from '@mui/material'

interface Major {
  id: string
  major_name: string
}

interface Class {
  id: any
  class_name: string
}

const FormValidationSchema = () => {
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm()
  const userData = JSON.parse(localStorage.getItem('userData') as string)
  const [nisn, setNisn] = useState<string>('')
  const [fullName, setFullName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [school, setSchool] = useState<string>('')
  const [status, setStatus] = useState<string>('ON')
  const [role, setRole] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [majors, setMajorses] = useState<Major[]>([])
  const [major, setMajor] = useState<number | string>('')
  const [clases, setClases] = useState<Class[]>([])
  const [clas, setClas] = useState<number | string>('')
  const [dateOfBirth, setDateOfBirth] = useState<string>('')
  const [loading, setLoading] = useState(false) // Add loading state
  const schoolId = userData.school_id
  const router = useRouter()
  const { uid } = router.query

  const storedToken = window.localStorage.getItem('token')

  // Fetch majors and classes when the component mounts
  useEffect(() => {
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
        setClases(response.data)
      } catch (error) {
        console.error('Error fetching classes:', error)
      }
    }

    fetchMajors()
    fetchClases()

    if (storedToken) {
      axiosConfig
        .post(
          '/detailSiswa',
          { uid },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${storedToken}`
            }
          }
        )
        .then(response => {
          const { nisn, email, full_name, phone, address, class_id, major_id, school_id, status, date_of_birth } =
            response.data
          const localDate = new Date(date_of_birth).toLocaleDateString('en-CA')
          setNisn(nisn)
          setEmail(email)
          setFullName(full_name)
          setPhone(phone)
          setAddress(address)
          setClas(class_id)
          setMajor(major_id)
          setSchool(school_id)
          setStatus(status)
          setDateOfBirth(localDate.slice(0, 10))
        })
    }
  }, [uid, storedToken, schoolId])

  const handleMajorChange = useCallback((e: ChangeEvent<{ value: unknown }>) => {
    setMajor(e.target.value as number)
  }, [])

  const handleClassChange = useCallback((e: ChangeEvent<{ value: unknown }>) => {
    setClas(e.target.value as number)
  }, [])

  const validateForm = () => {
    if (!fullName) {
      toast.error('Full Name is required')
      return false
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Valid email is required')
      return false
    }
    if (!phone || !/^\d+$/.test(phone)) {
      toast.error('Valid phone number is required')
      return false
    }
    if (!address) {
      toast.error('Address is required')
      return false
    }
    if (!major) {
      toast.error('Major is required')
      return false
    }
    if (!clas) {
      toast.error('Class is required')
      return false
    }
    return true
  }

  const onSubmit = async () => {
    if (!validateForm()) {
      return
    }

    const formData = {
      uid,
      nisn,
      full_name: fullName,
      email,
      phone,
      school,
      status,
      class_id: clas,
      major_id: major,
      address,
      date_of_birth: dateOfBirth
    }

    if (storedToken) {
      setLoading(true)
      try {
        await axiosConfig.post(
          '/update-siswa',
          { data: formData },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${storedToken}`
            }
          }
        )
        toast.success('Successfully Updated!')
        router.push('/ms/siswa')
      } catch (error) {
        console.error('Failed to update:', error)
        toast.error("Failed. This didn't work.")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Card>
      <CardHeader title='Update Siswa' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={6}>
              <CustomTextField
                fullWidth
                value={nisn}
                onChange={e => setNisn(e.target.value)}
                label='Nisn'
                placeholder='NISN'
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                fullWidth
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                label='Full Name'
                placeholder='Full Name'
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                fullWidth
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                label='Email'
                placeholder='example@example.com'
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                fullWidth
                value={phone}
                onChange={e => setPhone(e.target.value)}
                label='Phone Number'
                placeholder='Phone Number'
              />
            </Grid>

            <Grid item xs={6}>
              <CustomTextField select fullWidth label='Jurusan' value={major} onChange={handleMajorChange}>
                <MenuItem value='' disabled>
                  Pilih Jurusan
                </MenuItem>
                {majors.map(data => (
                  <MenuItem key={data.id} value={data.id}>
                    {data.major_name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>
            <Grid item xs={6}>
              <CustomTextField select fullWidth label='Kelas' value={clas} onChange={handleClassChange}>
                <MenuItem value='' disabled>
                  Pilih Kelas
                </MenuItem>
                {clases.map(data => (
                  <MenuItem key={data.id} value={data.id}>
                    {data.class_name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                fullWidth
                type='date'
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
                label='Date of Birth'
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField select fullWidth label='Status' value={status} onChange={e => setStatus(e.target.value)}>
                <MenuItem value='ON'>ON</MenuItem>
                <MenuItem value='OFF'>OFF</MenuItem>
              </CustomTextField>
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                value={address}
                onChange={e => setAddress(e.target.value)}
                label='Address'
                placeholder='Address'
              />
            </Grid>
            <Grid item xs={12}>
              <Button type='submit' variant='contained' disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Save'} {/* CircularProgress when loading */}
              </Button>
              <Box m={1} display='inline'></Box>
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
