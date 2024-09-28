// ** React Imports
import { ChangeEvent, useCallback, useEffect, useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import InputLabel from '@mui/material/InputLabel'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import FormControl from '@mui/material/FormControl'
import toast from 'react-hot-toast'
import Select from '@mui/material/Select'
import axiosConfig from '../../../../../../configs/axiosConfig'
import { useRouter } from 'next/router'
import { CircularProgress } from '@mui/material'

const AddPaymentDetailByClass = () => {
  const [spName, setSpName] = useState<string>('')
  const [years, setYears] = useState<string>('')
  const [spType, setSpType] = useState<string>('')
  const [kelas, setKelas] = useState<string>('')
  const [kelases, setKelases] = useState<any[]>([])
  const [major, setMajor] = useState<string>('')
  const [majors, setMajors] = useState<any[]>([])
  const [months, setMonths] = useState<any[]>([])
  const [amount, setAmount] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [units, setUnits] = useState<any[]>([]) // State for units
  const [unitId, setUnitId] = useState<string>('') // State for selected unit_id
  const userData = JSON.parse(localStorage.getItem('userData') as string)
  const storedToken = window.localStorage.getItem('token')
  const schoolId = userData.school_id
  const router = useRouter()
  const { uid } = router.query

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = event.target.value
    const numericValue = newAmount.replace(/\D/g, '') // Remove non-numeric characters
    const formattedValue = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(parseInt(numericValue || '0', 10)) // Format as currency
    setAmount(formattedValue)
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
          setSpName(sp_name)
          setYears(years)
          setSpType(sp_type)
        })
        .catch(error => {
          console.error('Error fetching class details:', error)
        })
    }

    const fetchUnits = async () => {
      try {
        const response = await axiosConfig.get(`/getUnits/?schoolId=${schoolId}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        setUnits(response.data) // Assuming response.data contains unit information
      } catch (error) {
        console.error('Error fetching units:', error)
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
        console.error('Error fetching months:', error)
      }
    }

    fetchUnits() // Fetch units
    fetchMajors()
    fetchClases()
    fetchMonths()
  }, [uid, schoolId, storedToken])

  const handleClassChange = useCallback((e: ChangeEvent<{ value: unknown }>) => {
    setKelas(e.target.value as string)
  }, [])

  const handleMajorChange = useCallback((e: ChangeEvent<{ value: unknown }>) => {
    setMajor(e.target.value as string)
  }, [])

  const handleUnitChange = useCallback((e: ChangeEvent<{ value: unknown }>) => {
    setUnitId(e.target.value as string) // Handle unit change
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    const formData = {
      school_id: schoolId,
      sp_name: spName,
      years: years,
      sp_type: spType,
      class_id: kelas,
      major_id: major,
      unit_id: unitId, // Include unit_id
      amount: amount.replace(/\D/g, ''),
      uid: uid // Add uid from router.query
    }
    console.log(formData)

    try {
      const response = await axiosConfig.post('/create-payment-byFree', formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${storedToken}`
        }
      })

      if (response.status === 200) {
        toast.success('Pembayaran berhasil disimpan!')
        router.push(`/ms/setting/pembayaran/bebas/${uid}`)
      } else if (response.status === 404) {
        toast.error('Users Not found')
      } else {
        toast.error('Terjadi kesalahan saat menyimpan pembayaran. Silakan coba lagi.')
      }
    } catch (error: any) {
      console.error('Error creating payment:', error)
      toast.error('Terjadi kesalahan saat menyimpan pembayaran: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false) // Set loading to false once the process is done
    }
  }

  return (
    <Card>
      <CardHeader title='Tambah Pembayaran Baru' />
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
              <InputLabel id='form-layouts-separator-select-label'>Unit</InputLabel>
              <FormControl fullWidth>
                <Select
                  label='Unit'
                  defaultValue=''
                  id='form-layouts-separator-select'
                  labelId='form-layouts-separator-select-label'
                  value={unitId}
                  onChange={handleUnitChange as any} // Handle unit change
                >
                  {units.map(data => (
                    <MenuItem key={data.id} value={data.id}>
                      {data.unit_name} {/* Assuming unit_name is the field for display */}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={12}>
              <InputLabel id='form-layouts-separator-select-label'>Jumlah Pembayaran Rp.</InputLabel>
              <TextField
                fullWidth
                label=''
                placeholder='Masukkan jumlah pembayaran'
                value={amount}
                onChange={handleAmountChange}
              />
            </Grid>
          </Grid>
        </CardContent>
        <Divider sx={{ m: '0 !important' }} />
        <CardActions>
          <Button
            size='large'
            type='submit'
            variant='contained'
            disabled={loading} // Disable button when loading
            startIcon={loading ? <CircularProgress size={20} /> : null} // Show CircularProgress when loading
          >
            {loading ? 'Loading...' : 'Simpan'}
          </Button>
          <Button
            size='large'
            color='secondary'
            variant='outlined'
            onClick={() => router.push(`/ms/setting/pembayaran/bebas/${uid}`)} // Navigate to the route when clicked
          >
            Kembali
          </Button>
        </CardActions>
      </form>
    </Card>
  )
}

export default AddPaymentDetailByClass
