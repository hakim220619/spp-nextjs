// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Grid, { GridProps } from '@mui/material/Grid'
import { styled } from '@mui/material/styles'
import { useEffect, useState } from 'react'

// Styled Grid component
const StyledGrid = styled(Grid)<GridProps>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    order: -1,
    display: 'flex',
    justifyContent: 'center'
  }
}))

// Styled component for the image
const Img = styled('img')(({ theme }) => ({
  right: 90,
  bottom: -50,
  width: '30%',
  position: 'absolute',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    maxWidth: 250,
    position: 'static'
  }
}))
const SuccessText = styled('span')(({ theme }) => ({
  color: theme.palette.success.main // Use the success color from the theme
}))

const AnalyticsCongratulations = () => {
  const [fullName, setFullName] = useState<string | null>(null)
  const [roleName, setRoleName] = useState<string | null>(null)
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') as string)
    const full_name = userData.full_name
    const roleName = userData.role_name

    setFullName(full_name)
    setRoleName(roleName)

    // Update time every second
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString())
    }

    const timeInterval = setInterval(updateTime, 1000)

    // Cleanup interval on component unmount
    return () => clearInterval(timeInterval)
  }, [])

  return (
    <Card sx={{ position: 'relative' }}>
      <CardContent sx={{ p: theme => `${theme.spacing(6.75, 7.5)} !important` }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant='h5' sx={{ mb: 4.5 }}>
              Congratulations{' '}
              <Box component='span' sx={{ fontWeight: 'bold' }}>
                {fullName}
              </Box>
              ! 🎉
            </Typography>
            <Typography variant='body2'>
              Halo, <SuccessText>{roleName}</SuccessText> Senang melihat Anda kembali. Mari kita ciptakan perubahan
              hebat hari ini!
            </Typography>
            <br />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}
          >
            <StyledGrid item xs={12} sm={6}>
              <Box>
                <Typography
                  variant='body2'
                  sx={{
                    mt: 2,
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    color: theme => theme.palette.info.main // Set the text color to info
                  }}
                >
                  {time} <br />
                </Typography>
              </Box>
              <Img alt='Congratulations John' src={`/images/cards/congratulations-john.png`} />
            </StyledGrid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default AnalyticsCongratulations
