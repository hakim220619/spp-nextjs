import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { styled } from '@mui/material/styles'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import MuiTimeline, { TimelineProps } from '@mui/lab/Timeline'
import axios from 'axios'

// ** Custom Components Imports
import OptionsMenu from 'src/@core/components/option-menu'
import axiosConfig from 'src/configs/axiosConfig'

// Styled Timeline component
const Timeline = styled(MuiTimeline)<TimelineProps>({
  paddingLeft: 0,
  paddingRight: 0,
  '& .MuiTimelineItem-root': {
    width: '100%',
    '&:before': {
      display: 'none'
    }
  }
})

const EcommerceActivityTimeline = () => {
  const [activities, setActivities] = useState([])
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const schoolId = getDataLocal.school_id
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') // Get token from localStorage
        // You can replace 123 with dynamic data if available
        const response = await axiosConfig.get(`/getActivityBySchoolId?school_id=${schoolId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        setActivities(response.data) // Assuming the data is an array of activities
      } catch (error) {
        console.error('Error fetching activities:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Card>
      <CardHeader
        title='Activity Timeline'
        action={
          <OptionsMenu
            options={['Last 28 Days', 'Last Month', 'Last Year']}
            iconButtonProps={{ size: 'small', className: 'card-more-options' }}
          />
        }
      />
      <CardContent sx={{ pt: theme => `${theme.spacing(2.5)} !important` }}>
        <Timeline sx={{ my: 0, py: 0 }}>
          {activities.map((activity, index) => (
            // <TimelineItem key={index}>
            //   <TimelineSeparator>
            //     <TimelineDot color={activity.status === 'error' ? 'error' : 'primary'} />
            //     {index !== activities.length - 1 && <TimelineConnector />}
            //   </TimelineSeparator>
            //   <TimelineContent sx={{ mt: 0, mb: theme => `${theme.spacing(3)} !important` }}>
            //     <Box
            //       sx={{
            //         mb: 3,
            //         display: 'flex',
            //         flexWrap: 'wrap',
            //         alignItems: 'center',
            //         justifyContent: 'space-between'
            //       }}
            //     >
            //       <Typography sx={{ mr: 2, fontWeight: 600 }}>{activity.title}</Typography>
            //       <Typography variant='caption' sx={{ color: 'text.disabled' }}>
            //         {activity.date}
            //       </Typography>
            //     </Box>
            //     <Typography variant='body2' sx={{ mb: 2 }}>
            //       {activity.description}
            //     </Typography>
            //     {activity.file && (
            //       <Box sx={{ display: 'flex', alignItems: 'center' }}>
            //         <img width={24} height={24} alt={activity.fileName} src='/images/icons/file-icons/pdf.png' />
            //         <Typography variant='subtitle2' sx={{ ml: 2, fontWeight: 600 }}>
            //           {activity.fileName}
            //         </Typography>
            //       </Box>
            //     )}
            //   </TimelineContent>
            // </TimelineItem>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot color='error' />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent sx={{ mt: 0, mb: theme => `${theme.spacing(3)} !important` }}>
                <Box
                  sx={{
                    mb: 3,
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Typography sx={{ mr: 2, fontWeight: 600 }}>8 Invoices have been paid</Typography>
                  <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                    Wednesday
                  </Typography>
                </Box>
                <Typography variant='body2' sx={{ mb: 2 }}>
                  Invoices have been paid to the company.
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <img width={24} height={24} alt='invoice.pdf' src='/images/icons/file-icons/pdf.png' />
                  <Typography variant='subtitle2' sx={{ ml: 2, fontWeight: 600 }}>
                    bookingCard.pdf
                  </Typography>
                </Box>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </CardContent>
    </Card>
  )
}

export default EcommerceActivityTimeline
