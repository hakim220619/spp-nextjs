// ** React Imports
import { useState, useCallback, useEffect, FormEvent } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'
import toast from 'react-hot-toast'

// ** Axios Import
import axiosConfig from '../../../configs/axiosConfig'
import { useRouter } from 'next/router'
import Link from 'next/link'

// ** Types
interface ReligionType {
  religion_name: string // Adjust if there's a different property name
}
interface State {
  id: string
  status_name: string
}
interface IdentityType {
  id: string
  idt_name: string
}
interface MaritalStatus {
  id: string
  ms_name: string
}

const FormValidationSchema = () => {
  const data = localStorage.getItem('userData') as string
  const getDataCache = JSON.parse(data)
  const [nik, setNik] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [fullName, setFullName] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const [dateOfBirth, setDateOfBirth] = useState<string>('')
  const [placeOfBirth, setPlaceOfBirth] = useState<string>('') // New state
  const [gender, setGender] = useState<string>('') // New state
  const [identityType, setIdentityType] = useState<string>('') // New state
  const [noIdentity, setNoIdentity] = useState<string>('') // New state
  const [maritalStatus, setMaritalStatus] = useState<string>('') // New state
  const [status, setStatus] = useState<State[]>([])
  const [statuses, setStatuses] = useState<State[]>([])
  const [identityTypes, setIdentityTypes] = useState<IdentityType[]>([]) // New state
  const [maritalStatusOptions, setMaritalStatusOptions] = useState<MaritalStatus[]>([]) // New state
  const [company_id, setCompanyId] = useState<string>(getDataCache.company_id)
  const [setValCompany, setValueCompany] = useState<any[]>([])

  const [updated_by, setUpdatedBy] = useState<string>()
  const router = useRouter()
  const { uid } = router.query

  useEffect(() => {
    const storedToken = window.localStorage.getItem('token')
    if (storedToken) {
      axiosConfig
        .post(
          '/general/findUsersByUid',
          { uid },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${storedToken}`
            }
          }
        )
        .then(response => {
          const {
            nik,
            email,
            fullName,
            address,
            phone_number,
            date_of_birth,
            place_of_birth,
            gender,
            identity_type,
            no_identity,
            marital_status,
            company_id,
            status
          } = response.data
          setNik(nik)
          setEmail(email)
          setFullName(fullName)
          setAddress(address)
          setPhoneNumber(phone_number)
          setDateOfBirth(date_of_birth.slice(0, 10))
          setPlaceOfBirth(place_of_birth)
          setGender(gender)
          setIdentityType(identity_type)
          setNoIdentity(no_identity)
          setMaritalStatus(marital_status)
          setCompanyId(company_id)
          setStatus(status)
          setUpdatedBy(getDataCache.id)
        })

      axiosConfig
        .get('/general/getStatus', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        .then(response => {
          setStatuses(response.data)
        })

      axiosConfig
        .post(
          '/general/getCompany',
          { company_id }, // Send company_id in the request body
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${storedToken}`
            }
          }
        )
        .then(response => {
          setValueCompany(response.data)
        })
        .catch(error => {
          console.error('Error fetching company data:', error)
        })

      axiosConfig
        .get('/get-identity-types', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        .then(response => {
          setIdentityTypes(response.data)
        })
        .catch(() => {
          console.error('Failed to fetch identity types')
          toast.error('Failed to fetch identity types')
        })

      axiosConfig
        .get('/general/getMaritalStatus', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        .then(response => {
          setMaritalStatusOptions(response.data)
        })
        .catch(() => {
          console.error('Failed to fetch marital status options')
          toast.error('Failed to fetch marital status options')
        })
    }
  }, [uid])

  const handleCompanyChange = useCallback((e: React.ChangeEvent<{ value: unknown }>) => {
    setCompanyId(e.target.value as string)
  }, [])
  const handleStateChange = useCallback((e: React.ChangeEvent<{ value: unknown }>) => {
    setStatus(e.target.value as any)
  }, [])
  const handleIdentityTypeChange = useCallback((e: React.ChangeEvent<{ value: unknown }>) => {
    setIdentityType(e.target.value as string)
  }, [])
  const handleMaritalStatusChange = useCallback((e: React.ChangeEvent<{ value: unknown }>) => {
    setMaritalStatus(e.target.value as string)
  }, [])
  const handleGenderChange = useCallback((e: React.ChangeEvent<{ value: unknown }>) => {
    setGender(e.target.value as string)
  }, [])

  const validateForm = () => {
    if (!nik) {
      toast.error('Nik is required')
      return false
    }
    if (!fullName) {
      toast.error('Full Name is required')
      return false
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Valid email is required')
      return false
    }
    if (!address) {
      toast.error('Address is required')
      return false
    }
    if (!phoneNumber || !/^\d+$/.test(phoneNumber)) {
      toast.error('Valid phone number is required')
      return false
    }
    if (!dateOfBirth) {
      toast.error('Date of Birth is required')
      return false
    }
    if (!placeOfBirth) {
      toast.error('Place of Birth is required')
      return false
    }
    if (!gender) {
      toast.error('Gender is required')
      return false
    }
    if (!identityType) {
      toast.error('Identity Type is required')
      return false
    }
    if (!noIdentity) {
      toast.error('No Identity is required')
      return false
    }
    if (!maritalStatus) {
      toast.error('Marital Status is required')
      return false
    }
    if (!status) {
      toast.error('State is required')
      return false
    }
    return true
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }

    const storedToken = window.localStorage.getItem('token')
    const data = {
      uid,
      nik,
      email,
      fullName,
      address,
      phone_number: phoneNumber,
      dateOfBirth,
      placeOfBirth,
      gender,
      identityType,
      noIdentity,
      maritalStatus,
      company_id,
      status,
      updated_by
    }

    if (storedToken) {
      axiosConfig
        .post(
          '/update-anggota',
          { data },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${storedToken}`
            }
          }
        )
        .then(() => {
          toast.success('Successfully Added!')
          router.push('/ms/anggota')
        })
        .catch(() => {
          toast.error("Failed. This didn't work.")
        })
    }
  }

  return (
    <Card>
      <CardHeader title='Update Anggota' />
      <CardContent>
        <form onSubmit={onSubmit}>
          <Grid container spacing={5}>
            <Grid item xs={6}>
              <CustomTextField
                fullWidth
                value={nik}
                onChange={e => setNik(e.target.value)}
                label='Nik'
                placeholder='Ksp635247813'
                aria-readonly
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                fullWidth
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                label='Full Name'
                placeholder='Leonard'
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                fullWidth
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                label='Email'
                placeholder='carterleonard@gmail.com'
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type='date'
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
                label='Date of Birth'
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                fullWidth
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                label='Phone Number'
                placeholder='6285***'
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                fullWidth
                value={placeOfBirth}
                onChange={e => setPlaceOfBirth(e.target.value)}
                label='Place of Birth'
                placeholder='City, Country'
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField select fullWidth label='Gender' value={gender} onChange={handleGenderChange}>
                <MenuItem value='' disabled>
                  Select Gender
                </MenuItem>
                <MenuItem value='Laki-Laki'>Laki-Laki</MenuItem>
                <MenuItem value='Perempuan'>Perempuan</MenuItem>
              </CustomTextField>
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                select
                fullWidth
                label='Identity Type'
                value={identityType}
                onChange={handleIdentityTypeChange}
              >
                <MenuItem value='' disabled>
                  Select Identity Type
                </MenuItem>
                {identityTypes.map(data => (
                  <MenuItem key={data.idt_name} value={data.idt_name}>
                    {data.idt_name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                fullWidth
                value={noIdentity}
                onChange={e => setNoIdentity(e.target.value)}
                label='No Identity'
                placeholder='ID Number'
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                select
                fullWidth
                label='Marital Status'
                value={maritalStatus}
                onChange={handleMaritalStatusChange}
              >
                <MenuItem value='' disabled>
                  Select Marital Status
                </MenuItem>
                {maritalStatusOptions.map(data => (
                  <MenuItem key={data.ms_name} value={data.ms_name}>
                    {data.ms_name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>
            <Grid item xs={6}>
              <CustomTextField select fullWidth label='Status' value={status} onChange={handleStateChange}>
                <MenuItem value='' disabled>
                  Select State
                </MenuItem>
                {statuses.map(data => (
                  <MenuItem key={data.status_name} value={data.status_name}>
                    {data.status_name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                select
                fullWidth
                label='Company'
                value={company_id}
                onChange={handleCompanyChange}
                InputProps={{
                  readOnly: company_id === '1' // Make it readOnly only if company_id is '1'
                }}
              >
                <MenuItem value='' disabled>
                  Select Company
                </MenuItem>
                {setValCompany.map(data => (
                  <MenuItem key={data.id} value={data.id}>
                    {data.company_name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                fullWidth
                value={address}
                onChange={e => setAddress(e.target.value)}
                label='Address'
                placeholder='Jl Hr Agung'
              />
            </Grid>

            <Grid item xs={12}>
              <Button type='submit' variant='contained'>
                Save
              </Button>
              <Box m={1} display='inline'>
                {/* This adds a margin between the buttons */}
              </Box>
              <Link href='/ms/anggota' passHref>
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
