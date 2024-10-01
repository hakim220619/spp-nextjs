// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Badge from '@mui/material/Badge'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Third Party Components
import clsx from 'clsx'
import { useKeenSlider } from 'keen-slider/react'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'
import axiosConfig from 'src/configs/axiosConfig'

interface SwiperData {
  header: string
  onetitle: string
  img: string
  title: string
  details: any
}

const Slides = ({ data }: { data: SwiperData[] }) => {
  return (
    <>
      {data.map((slide: SwiperData, index: number) => {
        return (
          <Box key={index} className='keen-slider__slide'>
            <Typography variant='h6' sx={{ color: 'common.white' }}>
              {slide.header}
            </Typography>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', '& svg': { color: 'success.main' } }}>
              <Typography variant='caption' sx={{ mr: 1.5, color: 'common.white' }}>
                {slide.onetitle}
              </Typography>
              <Typography variant='subtitle2' sx={{ color: 'success.main' }}>
                +62%
              </Typography>
              <Icon icon='mdi:chevron-up' fontSize={20} />
            </Box>

            <Grid container>
              <Grid item xs={12} sm={6} lg={12} sx={{ order: [2, 1] }}>
                <Typography sx={{ mb: 4.5, color: 'common.white' }}>{slide.title}</Typography>

                <Grid container spacing={3} sx={{ flexWrap: 'wrap', overflow: 'hidden' }}>
                  {Object.entries(JSON.parse(slide.details)).map(([key, value], index: number) => {
                    return (
                      <Grid
                        item
                        key={index}
                        xs={12} // Full width on extra small screens (mobile)
                        sm={6} // Half width on small screens (tablets)
                        md={4} // Third width on medium screens (desktop)
                        lg={5} // Quarter width on large screens (large desktops)
                        sx={{ maxWidth: '100%' }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                          <CustomAvatar
                            color='primary'
                            variant='rounded'
                            sx={{
                              mr: 2,
                              width: 40,
                              height: 30,
                              fontSize: '0.875rem',
                              color: 'common.white',
                              backgroundColor: 'primary.dark'
                            }}
                          >
                            {value as any} {/* Display the value */}
                          </CustomAvatar>
                          <Typography
                            variant='caption'
                            sx={{ color: 'common.white', wordWrap: 'break-word', flexShrink: 2 }}
                          >
                            {key} {/* Display the key */}
                          </Typography>
                        </Box>
                      </Grid>
                    )
                  })}
                </Grid>
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
                lg={4}
                sx={{
                  order: [1, 2],
                  textAlign: 'center',
                  '& img': {
                    top: 0,
                    right: 0,
                    height: '200px !important',
                    maxWidth: '100% !important',
                    position: ['static', 'absolute'],
                    objectFit: 'contain' // Ensure the image doesn't stretch
                  }
                }}
              >
                <img src={slide.img} alt={slide.title} />
              </Grid>
            </Grid>
          </Box>
        )
      })}
    </>
  )
}

const EcommerceWeeklySalesBg = () => {
  // ** States
  const [loaded, setLoaded] = useState<boolean>(false)
  const [currentSlide, setCurrentSlide] = useState<number>(0)
  const [data, setData] = useState<SwiperData[]>([]) // Initialize the state for data

  useEffect(() => {
    // Fetch the data from the API
    const fetchData = async () => {
      try {
        // Retrieve token and school_id from localStorage
        const token = localStorage.getItem('token')
        const userData = JSON.parse(localStorage.getItem('userData') as any) // Assuming userData is stored as a JSON string in localStorage
        const school_id = userData.school_id

        // Configure axios request with headers and query parameter
        const response = await axiosConfig.get('/getDetailClassMajorUsers', {
          headers: {
            Authorization: `Bearer ${token}` // Attach the token as a Bearer token in the Authorization header
          },
          params: {
            school_id: school_id // Add school_id as a query parameter
          }
        })

        setData(response.data) // Assuming the API returns an array of SwiperData
      } catch (error) {
        console.error('Error fetching the data', error)
      }
    }

    fetchData()
  }, [])

  // ** Hook
  const theme = useTheme()
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      initial: 0,
      rtl: theme.direction === 'rtl',
      slideChanged(slider) {
        setCurrentSlide(slider.track.details.rel)
      },
      created() {
        setLoaded(true)
      }
    },
    [
      slider => {
        let mouseOver = false
        let timeout: number | ReturnType<typeof setTimeout>
        const clearNextTimeout = () => {
          clearTimeout(timeout as number)
        }
        const nextTimeout = () => {
          clearTimeout(timeout as number)

          if (mouseOver) return

          // Add a safety check for the slider instance
          if (slider && slider.track && slider.track.details) {
            timeout = setTimeout(() => {
              slider.next() // Only proceed if track details exist
            }, 4000)
          } else {
            console.error('Slider is not fully initialized')
          }
        }

        slider.on('created', () => {
          slider.container.addEventListener('mouseover', () => {
            mouseOver = true
            clearNextTimeout()
          })
          slider.container.addEventListener('mouseout', () => {
            mouseOver = false
            nextTimeout()
          })
          nextTimeout()
        })
        slider.on('dragStarted', clearNextTimeout)
        slider.on('animationEnded', nextTimeout)
        slider.on('updated', nextTimeout)
      }
    ]
  )

  return (
    <Card sx={{ position: 'relative', backgroundColor: 'primary.main' }}>
      <CardContent>
        {loaded && instanceRef.current && (
          <Box className='swiper-dots' sx={{ top: 7, right: 13, position: 'absolute' }}>
            {[...Array(3).keys()].map(idx => {
              return (
                <Badge
                  key={idx}
                  variant='dot'
                  component='div'
                  className={clsx({
                    active: currentSlide === idx
                  })}
                  onClick={() => {
                    instanceRef.current?.moveToIdx(idx)
                  }}
                  sx={{
                    mr: theme => `${theme.spacing(2.5)} !important`,
                    '&.active': {
                      '& .MuiBadge-dot': {
                        backgroundColor: theme => `${theme.palette.common.white} !important`
                      }
                    },
                    '& .MuiBadge-dot': {
                      height: '6px !important',
                      width: '6px !important',
                      minWidth: '6px !important'
                    }
                  }}
                ></Badge>
              )
            })}
          </Box>
        )}
        <Box ref={sliderRef} className='keen-slider'>
          <Slides data={data} />
        </Box>
      </CardContent>
    </Card>
  )
}

export default EcommerceWeeklySalesBg
