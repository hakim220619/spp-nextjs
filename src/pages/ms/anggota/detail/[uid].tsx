import { Box, Card, Grid, Typography, Chip, Button, Icon } from '@mui/material'
import { useEffect, useState } from 'react'
import axiosConfig from '../../../../configs/axiosConfig'
import { useRouter } from 'next/router'
import { format } from 'date-fns' // Import date-fns for date formatting

const UserInfo = () => {
  const router = useRouter()
  const { uid } = router.query
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const storedToken = localStorage.getItem('token') // Assuming the token is stored in localStorage
  const accountData = [
    {
      title: 'TEST',
      code: '01240008',
      date: '14 Aug 2024',
      balance: '20.000,00',
      status: 'Aktif',
      statusColor: 'success'
    },
    {
      title: 'SIMPANAN BERJANGKA',
      code: '777240001',
      date: '13 Aug 2024',
      maturityDate: '13 Aug 2026',
      balance: '0,00',
      status: 'Tutup',
      statusColor: 'error'
    },
    {
      title: 'SIMPANAN POKOK',
      code: '1240012',
      date: '14 Aug 2024',
      balance: '100.000,00',
      status: 'Aktif',
      statusColor: 'success'
    },
    {
      title: 'SIMPANAN WAJIB',
      code: '2240011',
      date: '14 Aug 2024',
      balance: '10.000,00',
      status: 'Aktif',
      statusColor: 'success'
    },
    {
      title: 'PINJAMAN BULANAN',
      code: '3240024',
      date: '27 Jun 2024',
      maturityDate: '10 Jul 2025',
      loanAmount: '20.000.000,00',
      remainingLoan: '20.000.000,00',
      status: 'Aktif / Sudah Dicairkan',
      statusColor: 'success'
    },
    {
      title: 'PINJAMAN BULANAN',
      code: '3240026',
      date: '06 Aug 2024',
      maturityDate: '06 Aug 2025',
      loanAmount: '100.000.000,00',
      remainingLoan: '100.000.000,00',
      status: 'Diajukan',
      statusColor: 'warning'
    }
  ]
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosConfig.post(
          '/general/findUsersByUid',
          { uid },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${storedToken}`
            }
          }
        )
        console.log(response.data)

        // Assuming the API response has user data and account data
        setUserData(response.data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching user data:', error)
        setLoading(false)
      }
    }

    fetchUserData()
  }, [uid, storedToken])

  if (loading) {
    return <Typography>Loading...</Typography>
  }

  if (!userData) {
    return <Typography>No user data available</Typography>
  }
  const formattedDateOfBirth = userData.date_of_birth
    ? format(new Date(userData.date_of_birth), 'dd-MM-yyyy')
    : 'Tanggal Lahir Tidak Tersedia'
  const formattedCreatedOfBirth = userData.date_of_birth
    ? format(new Date(userData.created_at), 'dd-MM-yyyy')
    : 'Tanggal Lahir Tidak Tersedia'

  return (
    <Card sx={{ p: 4 }}>
      <Typography variant='h5' mb={2}>
        INFORMASI ANGGOTA
      </Typography>
      <Grid container spacing={2}>
        {/* Left Column */}
        <Grid item xs={6} md={6}>
          <Box display='flex' mb={2}>
            <Typography variant='body2' sx={{ width: '120px' }}>
              PIN:
            </Typography>
            <Chip label='Pin Belum Di Atur' color='error' sx={{ fontSize: '12px' }} />
          </Box>
          <Box display='flex' mb={2}>
            <Typography variant='body2' sx={{ width: '120px' }}>
              ID:
            </Typography>
            <Typography variant='body2'>{userData.member_id}</Typography>
          </Box>
          <Box display='flex' mb={2}>
            <Typography variant='body2' sx={{ width: '120px' }}>
              Nama:
            </Typography>
            <Typography variant='body2'>{userData.fullName}</Typography>
          </Box>
          <Box display='flex' mb={2}>
            <Typography variant='body2' sx={{ width: '120px' }}>
              Tempat Lahir:
            </Typography>
            <Typography variant='body2'>{userData.place_of_birth}</Typography>
          </Box>
          <Box display='flex' mb={2}>
            <Typography variant='body2' sx={{ width: '120px' }}>
              Tanggal Lahir:
            </Typography>
            <Typography variant='body2'>{formattedDateOfBirth}</Typography>
          </Box>
          <Box display='flex' mb={2}>
            <Typography variant='body2' sx={{ width: '120px' }}>
              Jenis Kelamin:
            </Typography>
            <Typography variant='body2'>{userData.gender}</Typography>
          </Box>
          <Box display='flex' mb={2}>
            <Typography variant='body2' sx={{ width: '120px' }}>
              Alamat:
            </Typography>
            <Typography variant='body2'>Banyuasin</Typography>
          </Box>
          <Box display='flex' mb={2}>
            <Typography variant='body2' sx={{ width: '120px' }}>
              Tanggal Daftar:
            </Typography>
            <Typography variant='body2'>{formattedCreatedOfBirth}</Typography>
          </Box>
          <Box display='flex' mb={2}>
            <Typography variant='body2' sx={{ width: '120px' }}>
              Status Verifikasi KTP:
            </Typography>
            <Chip label='Belum Terverifikasi' color='error' sx={{ fontSize: '12px' }} />
          </Box>
          <Box display='flex' mb={2}>
            <Typography variant='body2' sx={{ width: '120px' }}>
              Status:
            </Typography>
            <Chip label='Aktif' color='success' sx={{ fontSize: '12px' }} />
          </Box>
        </Grid>

        {/* Right Column */}
        <Grid item xs={6} md={6}>
          <Box display='flex' mb={2}>
            <Typography variant='body2' sx={{ width: '120px' }}>
              Agama:
            </Typography>
            <Typography variant='body2'>{userData.religion}</Typography>
          </Box>
          <Box display='flex' mb={2}>
            <Typography variant='body2' sx={{ width: '120px' }}>
              Profesi:
            </Typography>
            <Typography variant='body2'>{userData.work}</Typography>
          </Box>
          <Box display='flex' mb={2}>
            <Typography variant='body2' sx={{ width: '120px' }}>
              Status Pernikahan:
            </Typography>
            <Typography variant='body2'>{userData.marital_status}</Typography>
          </Box>
          <Box display='flex' mb={2}>
            <Typography variant='body2' sx={{ width: '120px' }}>
              Jenis Identitas:
            </Typography>
            <Typography variant='body2'>{userData.identity_type}</Typography>
          </Box>
          <Box display='flex' mb={2}>
            <Typography variant='body2' sx={{ width: '120px' }}>
              No. Identitas:
            </Typography>
            <Typography variant='body2'>{userData.no_identity}</Typography>
          </Box>
          <Box display='flex' mb={2}>
            <Typography variant='body2' sx={{ width: '120px' }}>
              No. Wa/Handphone:
            </Typography>
            <Typography variant='body2'>{userData.no_wa}</Typography>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant='h5' mb={3}>
          INFORMASI REKENING
        </Typography>
        <Grid container spacing={3}>
          {accountData.map((account, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card sx={{ p: 3, backgroundColor: index % 2 === 0 ? '#6a1b9a' : '#00796b', color: 'white' }}>
                <Typography variant='h6' mb={2} sx={{ color: 'white' }}>
                  {account.title}
                </Typography>
                <Typography variant='body2' sx={{ color: 'white' }}>
                  Kode {account.loanAmount ? 'Pinjaman' : 'Tabungan'}: {account.code}
                </Typography>
                <Typography variant='body2' sx={{ color: 'white' }}>
                  Tanggal Dibuat: {account.date}
                </Typography>
                {account.maturityDate && (
                  <Typography variant='body2' sx={{ color: 'white' }}>
                    Tanggal Jatuh Tempo: {account.maturityDate}
                  </Typography>
                )}
                {account.loanAmount ? (
                  <>
                    <Typography variant='body2' sx={{ color: 'white' }}>
                      Jumlah Pinjaman: {account.loanAmount}
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'white' }}>
                      Sisa Pinjaman: {account.remainingLoan}
                    </Typography>
                  </>
                ) : (
                  <Typography variant='body2' sx={{ color: 'white' }}>
                    Saldo: {account.balance}
                  </Typography>
                )}
                <Box mt={2} display='flex' justifyContent='space-between' alignItems='center'>
                  <Chip label={account.status} color={account.statusColor as any} />
                </Box>
                <Button
                  variant='outlined'
                  startIcon={<Icon />}
                  sx={{ mt: 2, backgroundColor: 'white', color: index % 2 === 0 ? '#6a1b9a' : '#00796b' }}
                  fullWidth
                >
                  Riwayat Transaksi
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Card>
  )
}

const UserProfile = () => {
  return (
    <Box sx={{ p: 4, minHeight: '100vh' }}>
      <UserInfo />
    </Box>
  )
}

export default UserProfile
