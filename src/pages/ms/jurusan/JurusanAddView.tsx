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
import axiosConfig from '../../../configs/axiosConfig'
import { useRouter } from 'next/navigation'

interface ClassForm {
  major_name: string
  major_status: 'ON' | 'OFF'
}

const schema = yup.object().shape({
  major_name: yup.string().required('Class Name is required'),
  major_status: yup.string().oneOf(['ON', 'OFF'], 'Invalid class status').required('Class Status is required')
})

const ClassFormComponent = () => {
  const router = useRouter()

  const defaultValues: ClassForm = {
    major_name: '',
    major_status: 'ON'
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
  const onSubmit = (data: ClassForm) => {
    const formData = new FormData()
    formData.append('school_id', schoolId)
    formData.append('major_name', data.major_name)
    formData.append('major_status', data.major_status)

    const storedToken = window.localStorage.getItem('token')
    axiosConfig
      .post('/create-jurusan', formData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${storedToken}`
        }
      })
      .then(response => {
        console.log(response)
        toast.success('Successfully Added Class!')
        router.push('/ms/jurusan')
      })
      .catch(() => {
        toast.error('Failed to add class')
      })
  }

  return (
    <Card>
      <CardHeader title='Tambah Kelas' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={6}>
              <Controller
                name='major_name'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Nama Kelas'
                    onChange={onChange}
                    placeholder='e.g. Class A'
                    error={Boolean(errors.major_name)}
                    helperText={errors.major_name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name='major_status'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    select
                    fullWidth
                    value={value}
                    label='Status'
                    onChange={onChange}
                    error={Boolean(errors.major_status)}
                    helperText={errors.major_status?.message}
                  >
                    <MenuItem value='ON'>ON</MenuItem>
                    <MenuItem value='OFF'>OFF</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type='submit' variant='contained'>
                Submit
              </Button>
              <Box m={1} display='inline' />
              <Button type='button' variant='contained' color='secondary' onClick={() => router.push('/ms/jurusan')}>
                Back
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default ClassFormComponent
