// ** React Imports
import { ChangeEvent, forwardRef, useCallback, useEffect, useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import FormControl from '@mui/material/FormControl'
import toast from 'react-hot-toast'
import Select, { SelectChangeEvent } from '@mui/material/Select'

// ** Third Party Imports
import DatePicker from 'react-datepicker'
import axiosConfig from '../../../../../../configs/axiosConfig'

// ** Types
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import { useRouter } from 'next/router'
import CustomTextField from 'src/@core/components/mui/text-field'

interface State {
  password: string
  password2: string
  showPassword: boolean
  showPassword2: boolean
}

const CustomInput = forwardRef((props, ref) => {
  return <TextField fullWidth {...props} inputRef={ref} label='Birth Date' autoComplete='off' />
})

const FormLayoutsSeparator = () => {
  const [date, setDate] = useState<DateType>(null)
  const [language, setLanguage] = useState<string[]>([])
  const [spName, setSpName] = useState<string>('')
  const [years, setYears] = useState<string>('')
  const [spType, setSpType] = useState<string>('')
  const [kelas, setKelas] = useState<string>('')
  const [kelases, setKelases] = useState<any[]>([])
  const [major, setMajor] = useState<string>('')
  const [majors, setMajors] = useState<any[]>([])
  const [months, setMonths] = useState<any[]>([])
  const [amount, setAmount] = useState<string>('')
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])

  const userData = JSON.parse(localStorage.getItem('userData') as string)
  const storedToken = window.localStorage.getItem('token')
  const schoolId = userData.school_id
  const router = useRouter()
  const { uid } = router.query
  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = event.target.value
    const value = event.target.value
    const numericValue = value.replace(/\D/g, '') // Remove non-numeric characters
    const formattedValue = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(parseInt(numericValue || '0', 10)) // Ensure the value is converted to an integer
    const numericValueAmount = newAmount.replace(/\D/g, '') // Remove non-numeric characters
    const formattedValueAmount = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(parseInt(numericValueAmount || '0', 10)) // Ensure the value is converted to an integer
    setAmount(formattedValue)
    setMonths(months.map(month => ({ ...month, payment: formattedValueAmount })))
  }
  const handleMonthChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const updatedMonths = [...months] // Create a copy of the months array
    const inputValue = event.target.value

    // Remove non-numeric characters from the input
    const numericValue = inputValue.replace(/\D/g, '')

    // Format the value into IDR currency format
    const formattedValue = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(parseInt(numericValue || '0', 10))

    // Update the specific month payment with the formatted value
    updatedMonths[index].payment = formattedValue

    // Update the state with the modified months array
    setMonths(updatedMonths)
  }

  useEffect(() => {
    if (storedToken) {
      axiosConfig
        .post(
          '/detailSettingPembayaran',
          { uid },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${storedToken}`
            }
          }
        )
        .then(response => {
          const { sp_name, years, sp_type } = response.data
          // Set default values
          setSpName(sp_name)
          setYears(years)
          setSpType(sp_type)
        })
        .catch(error => {
          console.error('Error fetching class details:', error)
        })
    }
    const fetchClases = async () => {
      try {
        const response = await axiosConfig.get(`/getClass/?schoolId=${schoolId}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        setKelases(response.data)
      } catch (error) {
        console.error('Error fetching classes:', error)
      }
    }
    const fetchMajors = async () => {
      try {
        const response = await axiosConfig.get(`/getMajors/?schoolId=${schoolId}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        setMajors(response.data)
      } catch (error) {
        console.error('Error fetching majors:', error)
      }
    }
    const fetchMonths = async () => {
      try {
        const response = await axiosConfig.get(`/getMonths/?schoolId=${schoolId}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        setMonths(response.data)
      } catch (error) {
        console.error('Error fetching majors:', error)
      }
    }
    const fetchUsers = async () => {
      try {
        const response = await axiosConfig.get(`/list-siswa/?schoolId=${schoolId}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        setUsers(response.data)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }
    fetchUsers()
    fetchMajors()
    fetchClases()
    fetchMonths()
  }, [uid, storedToken])
  useEffect(() => {
    const filtered = users.filter(user => user.class_id === kelas && user.major_id === major)
    setFilteredUsers(filtered)
  }, [users, kelas, major])

  const handleClassChange = useCallback((e: ChangeEvent<{ value: unknown }>) => {
    setKelas(e.target.value as any)
  }, [])
  const handleMajorChange = useCallback((e: ChangeEvent<{ value: unknown }>) => {
    setMajor(e.target.value as any)
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Collect the form data
    const formData = {
      user_id: selectedUser,
      school_id: schoolId,
      sp_name: spName,
      years: years,
      sp_type: spType,
      class_id: kelas,
      major_id: major,
      amount: amount,
      uid: uid, // Add uid from router.query
      months: months.map(month => {
        // Remove "Rp." and "." from the payment value
        const cleanedPayment = month.payment.replace(/[Rp.\s]/g, '')

        return {
          month: month.month,
          payment: cleanedPayment, // Cleaned payment without Rp. and dots
          id: month.id // ID for the month
        }
      })
    }
    // console.log(formData)

    try {
      const response = await axiosConfig.post('/create-payment-byStudent', formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${storedToken}`
        }
      })

      if (response.status === 200) {
        toast.success('Pembayaran berhasil disimpan!')
        router.push(`/ms/setting/pembayaran/bulanan/${uid}`)
      } else if (response.status === 404) {
        toast.error('Users Not found')
      } else {
        toast.error('Terjadi kesalahan saat menyimpan pembayaran. Silakan coba lagi.')
      }
    } catch (error: any) {
      console.error('Error creating payment:', error)
      toast.error('Terjadi kesalahan saat menyimpan pembayaran: ' + (error.response?.data?.message || error.message))
    }
  }

  return (
    <Card>
      <CardHeader title='Tambah Pembayaran Baru Siswa' />
      <Divider sx={{ m: '0 !important' }} />
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                Pembayaran Details
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <InputLabel id='form-layouts-separator-select-label'>Nama Pembayaran</InputLabel>
              <TextField
                fullWidth
                label=''
                placeholder=''
                value={spName}
                InputProps={{
                  readOnly: true
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <InputLabel id='form-layouts-separator-select-label'>Tahun</InputLabel>
              <TextField
                fullWidth
                label=''
                placeholder=''
                value={years}
                InputProps={{
                  readOnly: true
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <InputLabel id='form-layouts-separator-select-label'>Tipe</InputLabel>
              <TextField
                fullWidth
                label=''
                placeholder=''
                value={spType}
                InputProps={{
                  readOnly: true
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <InputLabel id='form-layouts-separator-select-label'>Kelas</InputLabel>
              <FormControl fullWidth>
                <Select
                  label='Kelas'
                  defaultValue=''
                  id='form-layouts-separator-select'
                  labelId='form-layouts-separator-select-label'
                  value={kelas}
                  onChange={handleClassChange as any}
                >
                  {kelases.map(data => (
                    <MenuItem key={data.id} value={data.id}>
                      {data.class_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <InputLabel id='form-layouts-separator-select-label'>Jurusan</InputLabel>
              <FormControl fullWidth>
                <Select
                  label='Jurusan'
                  defaultValue=''
                  id='form-layouts-separator-select'
                  labelId='form-layouts-separator-select-label'
                  value={major}
                  onChange={handleMajorChange as any}
                >
                  {majors.map(data => (
                    <MenuItem key={data.id} value={data.id}>
                      {data.major_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <InputLabel id='form-layouts-separator-select-label'>Siswa</InputLabel>
              <FormControl fullWidth>
                <Select
                  label='Siswa'
                  defaultValue=''
                  id='form-layouts-separator-select-users'
                  labelId='form-layouts-separator-select-users-label'
                  value={selectedUser}
                  onChange={e => setSelectedUser(e.target.value as string)}
                >
                  {filteredUsers.map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.full_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <InputLabel id='form-layouts-separator-select-label'>Jumlah Pembayaran Rp.</InputLabel>
              <TextField
                fullWidth
                label=''
                placeholder='Masukkan jumlah pembayaran'
                value={amount}
                onChange={handleAmountChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ mb: '0 !important' }} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                Bulan
              </Typography>
            </Grid>
            {months.map((data, index) => (
              <Grid item xs={12} sm={3} key={index}>
                <InputLabel id={`form-layouts-separator-select-label-${index}`}>{data.month}</InputLabel>
                <TextField
                  fullWidth
                  label=''
                  placeholder=''
                  value={data.payment || ''} // Default to an empty string if undefined
                  onChange={e => handleMonthChange(e as any, index)}
                />
                <TextField
                  fullWidth
                  label='ID'
                  placeholder=''
                  value={data.id || ''} // Default to an empty string if undefined
                  InputProps={{
                    readOnly: true
                  }}
                  sx={{ display: 'none' }}
                />
              </Grid>
            ))}
          </Grid>
        </CardContent>
        <Divider sx={{ m: '0 !important' }} />
        <CardActions>
          <Button size='large' type='submit' sx={{ mr: 2 }} variant='contained'>
            Simpan
          </Button>
          <Button
            size='large'
            color='secondary'
            variant='outlined'
            onClick={() => router.push(`/ms/setting/pembayaran/bulanan/${uid}`)} // Navigate to the route when clicked
          >
            Kembali
          </Button>
        </CardActions>
      </form>
    </Card>
  )
}

export default FormLayoutsSeparator
