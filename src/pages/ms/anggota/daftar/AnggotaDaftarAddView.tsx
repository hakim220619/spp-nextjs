// ** React Imports
import { forwardRef, useState, ChangeEvent, useEffect } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import { Box } from '@mui/system'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import DatePicker from 'react-datepicker'
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import axiosConfig from '../../../../configs/axiosConfig'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

interface State {
  password: string
  showPassword: boolean
}
interface IdentityType {
  idt_name: string // Adjust if there's a different property name
}
interface ReligionType {
  religion_name: string // Adjust if there's a different property name
}
interface MsStatus {
  ms_name: string
}
interface Working {
  work_name: string
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

const showErrors = (field: string, valueLen: number, min: number) => {
  if (valueLen === 0) {
    return `${field} field is required`
  } else if (valueLen > 0 && valueLen < min) {
    return `${field} must be at least ${min} characters`
  } else {
    return ''
  }
}

const schema = yup.object().shape({
  email: yup.string().email().required(),

  nik: yup
    .string()
    .min(3, obj => showErrors('nik', obj.value.length, obj.min))
    .required(),
  password: yup
    .string()
    .min(4, obj => showErrors('password', obj.value.length, obj.min))
    .required(),
  fullName: yup
    .string()
    .min(3, obj => showErrors('fullName', obj.value.length, obj.min))
    .required(),
  dob: yup.date().required(),
  address: yup.string().required(),
  phone_number: yup
    .number()
    .min(3, obj => showErrors('phone number', obj.value.length, obj.min))
    .required(),
  place_of_birth: yup.string().required(),
  gender: yup.string().oneOf(['Laki-Laki', 'Perempuan']).required(),
  marital_status: yup.string().required(),
  identity_type: yup.string().required(),
  no_identity: yup.string().required()
})

const FormValidationSchema = () => {
  const router = useRouter()
  const [state, setState] = useState<State>({
    password: '',
    showPassword: false
  })
  const [identityTypes, setIdentityTypes] = useState<IdentityType[]>([])
  const [religion, setReligion] = useState<ReligionType[]>([])
  const [maritalStatusOptions, setMaritalStatusOptions] = useState<MsStatus[]>([])
  const [Working, setWorking] = useState<Working[]>([])
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)

  const defaultValues = {
    nik: '4234d23',
    email: 'asdasd@gmail.com',
    fullName: 'asdasd',
    password: '12345678',
    address: 'asdasdasds',
    phone_number: '34534534634565',
    company_id: getDataLocal.company_id,
    created_by: getDataLocal.id,
    dob: null,
    place_of_birth: '',
    gender: '',
    marital_status: '',
    identity_type: '',
    no_identity: '',
    religion: '',
    work: ''
  }

  // ** Hook
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  const handleClickShowPassword = () => {
    setState({ ...state, showPassword: !state.showPassword })
  }

  const onSubmit = (data: any) => {
    const dataAll = {
      data: data
    }
    console.log(dataAll)

    const storedToken = window.localStorage.getItem('token')
    axiosConfig
      .post('/create-anggota-verification', dataAll, {
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer ' + storedToken
        }
      })
      .then(async response => {
        toast.success('Successfully Added!')
        router.push('/ms/anggota/daftar')
      })
      .catch(() => {
        toast.error("Failed This didn't work.")
        console.log('gagal')
      })
  }
  const handleVerifyKtp = () => {
    // Add your KTP verification logic here
    toast.error('Verifikasi KTP clicked')
  }
  useEffect(() => {
    // Fetch identity types from API
    const storedToken = window.localStorage.getItem('token')
    if (storedToken) {
      axiosConfig
        .get('/get-identity-types', {
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer ' + storedToken
          }
        })
        .then(response => {
          setIdentityTypes(response.data) // Assuming the API returns an array of strings
        })
        .catch(() => {
          console.error('Failed to fetch identity types')
          toast.error('Failed to fetch identity types')
        })
      axiosConfig
        .get('/general/getReligion', {
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer ' + storedToken
          }
        })
        .then(response => {
          setReligion(response.data) // Assuming the API returns an array of strings
        })
        .catch(() => {
          console.error('Failed to fetch identity types')
          toast.error('Failed to fetch identity types')
        })
      axiosConfig
        .get('/general/getMaritalStatus', {
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer ' + storedToken
          }
        })
        .then(response => {
          setMaritalStatusOptions(response.data) // Assuming the API returns an array of status objects
        })
        .catch(() => {
          console.error('Failed to fetch marital status options')
          toast.error('Failed to fetch marital status options')
        })
      axiosConfig
        .get('/general/getWorking', {
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer ' + storedToken
          }
        })
        .then(response => {
          setWorking(response.data) // Assuming the API returns an array of status objects
        })
        .catch(() => {
          console.error('Failed to fetch marital status options')
          toast.error('Failed to fetch marital status options')
        })
    }
  }, [])
  return (
    <Card>
      <CardHeader title='Added New Anggota' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={10}>
              <Controller
                name='nik'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Nik'
                    onChange={onChange}
                    placeholder='Ksp635247813'
                    error={Boolean(errors.nik)}
                    aria-describedby='validation-schema-nik'
                    {...(errors.nik && { helperText: errors.nik.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={2} container alignItems='center' spacing={5} style={{ marginTop: '0px' }}>
              <Grid item>
                <Button variant='outlined' onClick={handleVerifyKtp}>
                  Verifikasi KTP
                </Button>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='fullName'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Full Name'
                    onChange={onChange}
                    placeholder='Leonard'
                    error={Boolean(errors.fullName)}
                    aria-describedby='validation-schema-fullName'
                    {...(errors.fullName && { helperText: errors.fullName.message })}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='email'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    type='email'
                    value={value}
                    label='Email'
                    onChange={onChange}
                    error={Boolean(errors.email)}
                    placeholder='carterleonard@gmail.com'
                    aria-describedby='validation-schema-email'
                    {...(errors.email && { helperText: errors.email.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='password'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Password'
                    onChange={onChange}
                    id='validation-schema-password'
                    error={Boolean(errors.password)}
                    type={state.showPassword ? 'text' : 'password'}
                    {...(errors.password && { helperText: errors.password.message })}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            edge='end'
                            onClick={handleClickShowPassword}
                            onMouseDown={e => e.preventDefault()}
                            aria-label='toggle password visibility'
                          >
                            <Icon fontSize='1.25rem' icon={state.showPassword ? 'tabler:eye' : 'tabler:eye-off'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <Controller
                name='dob'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <DatePickerWrapper>
                    <DatePicker
                      selected={value}
                      showYearDropdown
                      showMonthDropdown
                      onChange={e => onChange(e)}
                      placeholderText='MM/DD/YYYY'
                      customInput={
                        <CustomInput
                          value={value}
                          onChange={onChange}
                          label='Tanggal Lahir'
                          error={Boolean(errors.dob)}
                          aria-describedby='validation-basic-dob'
                          {...(errors.dob && { helperText: 'This field is required' })}
                        />
                      }
                    />
                  </DatePickerWrapper>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='phone_number'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='No. Handphone / Wa'
                    onChange={onChange}
                    placeholder='6285***'
                    error={Boolean(errors.phone_number)}
                    aria-describedby='validation-schema-phone_number'
                    {...(errors.phone_number && { helperText: errors.phone_number.message })}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='place_of_birth'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Tempat Lahir'
                    onChange={onChange}
                    placeholder='Place of Birth'
                    error={Boolean(errors.place_of_birth)}
                    aria-describedby='validation-schema-place_of_birth'
                    {...(errors.place_of_birth && { helperText: errors.place_of_birth.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='gender'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    select
                    value={value}
                    label='Jenis Kelamin'
                    onChange={onChange}
                    defaultValue='Select'
                    error={Boolean(errors.gender)}
                    aria-describedby='validation-schema-gender'
                    {...(errors.gender && { helperText: errors.gender.message })}
                  >
                    <MenuItem value='' disabled>
                      Select
                    </MenuItem>
                    <MenuItem value='Laki-Laki'>Laki-Laki</MenuItem>
                    <MenuItem value='Perempuan'>Perempuan</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='identity_type'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    select
                    {...field}
                    label='Jenis Identitas'
                    error={Boolean(errors.identity_type)}
                    {...(errors.identity_type && { helperText: errors.identity_type.message })}
                  >
                    <MenuItem value='' disabled>
                      Select
                    </MenuItem>
                    {identityTypes.map(type => (
                      <MenuItem key={type.idt_name} value={type.idt_name}>
                        {type.idt_name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='no_identity'
                control={control}
                rules={{
                  required: true,
                  pattern: {
                    value: /^[0-9]+$/, // Regex to allow only numbers
                    message: 'Please enter a valid number'
                  }
                }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='No. Identitas'
                    onChange={onChange}
                    placeholder=''
                    error={Boolean(errors.no_identity)}
                    aria-describedby='validation-schema-no_identity'
                    type='text' // Set type to text to allow custom validation
                    onKeyPress={e => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault() // Prevent input of non-numeric characters
                      }
                    }}
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} // Ensure numeric keyboard on mobile
                    {...(errors.no_identity && { helperText: errors.no_identity.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='marital_status'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    select
                    value={value}
                    label='Status Pernikahan'
                    onChange={onChange}
                    defaultValue='Select'
                    error={Boolean(errors.marital_status)}
                    aria-describedby='validation-schema-marital_status'
                    {...(errors.marital_status && { helperText: errors.marital_status.message })}
                  >
                    <MenuItem value='' disabled>
                      Select
                    </MenuItem>
                    {maritalStatusOptions.map(status => (
                      <MenuItem key={status.ms_name} value={status.ms_name}>
                        {status.ms_name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='religion'
                control={control}
                defaultValue='' // Set default value to empty string
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    select
                    {...field}
                    label='Agama'
                    value={field.value} // Use the field's value as-is
                    error={Boolean(errors.religion)}
                    helperText={errors.religion ? errors.religion.message : ''}
                  >
                    <MenuItem value='' disabled>
                      Select
                    </MenuItem>
                    {religion.map(type => (
                      <MenuItem key={type.religion_name} value={type.religion_name}>
                        {type.religion_name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='work'
                control={control}
                defaultValue='' // Set default value to empty string
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    select
                    {...field}
                    label='Working'
                    value={field.value} // Use the field's value as-is
                    error={Boolean(errors.work)}
                    helperText={errors.work ? errors.work.message : ''}
                  >
                    <MenuItem value='' disabled>
                      Select
                    </MenuItem>
                    {Working.map(type => (
                      <MenuItem key={type.work_name} value={type.work_name}>
                        {type.work_name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='address'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Alamat'
                    onChange={onChange}
                    placeholder='Jl Hr Agung'
                    error={Boolean(errors.address)}
                    aria-describedby='validation-schema-address'
                    {...(errors.address && { helperText: errors.address.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type='submit' variant='contained'>
                Submit
              </Button>
              <Box m={1} display='inline'>
                {/* This adds a margin between the buttons */}
              </Box>
              <Link href='/ms/anggota/daftar' passHref>
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
