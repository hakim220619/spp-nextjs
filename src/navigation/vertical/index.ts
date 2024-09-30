// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'
import { useRouter } from 'next/router' // Adjust this import according to your routing library
import axiosConfig from 'src/configs/axiosConfig'
import { useEffect, useState } from 'react'

const navigation = (): VerticalNavItemsType => {
  const [user, setUser] = useState<any | null>(null) // Initialize user state to null
  const router = useRouter() // Initialize router for redirection
  const storedToken = localStorage.getItem('token')
  // console.log(user)

  // Logout handler
  const handleLogout = () => {
    setUser(null)
    window.localStorage.removeItem('userData')
    window.localStorage.removeItem('token')
    window.localStorage.removeItem('refreshToken')
    router.push('/login')
  }

  // Refresh access token
  const refreshAccessToken = async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      router.replace('/login')
      return
    }

    try {
      const response = await axiosConfig.get('/refresh-token', {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${storedToken}`
        }
      })

      const { accessToken, userData } = response.data // Destructure response data

      // Update local storage
      window.localStorage.setItem('token', accessToken)
      window.localStorage.setItem('userData', JSON.stringify(userData))
      setUser({ ...userData })
    } catch (error) {
      console.error('Failed to refresh token:', error) // Log refresh token errors
      handleLogout() // Logout on failure
    }
  }

  // Retrieve user data from local storage
  const data = localStorage.getItem('userData')
  const getDataLocal = data ? JSON.parse(data) : null // Handle null case
  const role = getDataLocal?.role // Optional chaining for safety

  useEffect(() => {
    if (!role) {
      refreshAccessToken()
    }
  }, [storedToken]) // Trigger refresh if storedToken changes
  // Check if role is null and redirect to login
  if (!role) {
    handleLogout() // Call logout to clean up storage and redirect
    return [] // Return an empty array to avoid rendering the navigation
  }

  if (role === 150) {
    return [
      {
        title: 'Dashboards',
        icon: 'ion:home-outline',
        path: 'admin/cb/approval'
      },
      {
        title: 'Master Data',
        icon: 'tabler:users',
        badgeColor: 'error',
        children: [
          { title: 'Admin', path: '/ms/admin' },
          { title: 'Siswa', path: '/ms/siswa' },
          { title: 'Sekolah', path: '/ms/sekolah' },
          { title: 'Aplikasi', path: '/ms/aplikasi' },
          { title: 'Affiliate', path: '/ms/affiliate' }
        ]
      },
      {
        title: 'Setting',
        icon: 'tabler:settings-cog',
        badgeColor: 'error',
        children: [{ title: 'Aplikasi', path: '/ms/setting/aplikasi' }]
      }
    ]
  } else if (role === 160) {
    return [
      {
        title: 'Dashboards',
        icon: 'ion:home-outline',
        badgeColor: 'error',
        path: '/ms/dashboard/siswa'
      }
    ]
  } else if (role === 170) {
    return [
      {
        title: 'Dashboards',
        icon: 'ion:home-outline',
        path: '/ms/dashboard/admin'
      },
      {
        title: 'Broadcast',
        icon: 'ion:logo-whatsapp',
        path: '/ms/broadcast/whatsapp'
      },
      {
        title: 'Master Data',
        icon: 'tabler:users',
        badgeColor: 'error',
        children: [
          { title: 'Siswa', path: '/ms/siswa' },
          { title: 'Kelas', path: '/ms/kelas' },
          { title: 'Jurusan', path: '/ms/jurusan' },
          { title: 'Bulan', path: '/ms/bulan' },
          { title: 'Unit', path: '/ms/unit' }
        ]
      },
      {
        title: 'Pembayaran',
        icon: 'ion:wallet-outline',
        path: '/ms/pembayaran/admin'
      },
      {
        title: 'Setting Pembayaran',
        icon: 'ion:wallet',
        path: '/ms/setting/pembayaran'
      },
      {
        title: 'Laporan',
        icon: 'tabler:report-search',
        path: '/ms/laporan'
      },
      {
        title: 'Setting',
        icon: 'tabler:settings-cog',
        badgeColor: 'error',
        children: [{ title: 'Aplikasi', path: '/ms/setting/aplikasi' }]
      }
    ]
  } else if (role === 200) {
    return [
      {
        title: 'Dashboards',
        icon: 'ion:home-outline',
        path: '/ms/dashboard/admin'
      },
      {
        title: 'Pembayaran',
        icon: 'ion:wallet-outline',
        path: '/ms/pembayaran/admin'
      }
    ]
  } else {
    return [
      {
        title: 'Admin',
        icon: 'tabler:users',
        badgeColor: 'error',
        children: [{ title: 'Data Admin', path: '/ms/admin' }]
      }
    ]
  }
}

export default navigation
