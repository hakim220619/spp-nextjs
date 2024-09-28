// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'
import { useRouter } from 'next/router' // Adjust this import according to your routing library

const navigation = (): VerticalNavItemsType => {
  const router = useRouter() // Initialize router for redirection
  const data = localStorage.getItem('userData')
  const getDataLocal = data ? JSON.parse(data) : null // Handle null case
  const role = getDataLocal?.role // Optional chaining for safety

  // Check if role is null and redirect to login
  if (!role) {
    window.localStorage.removeItem('userData')
    window.localStorage.removeItem('token')
    window.localStorage.removeItem('refreshToken') // Remove refresh token on logout
    router.push('/login')
    router.push('/login') // Redirect to login if role is null
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
        title: 'Setting Pembayaran',
        icon: 'ion:wallet',
        path: '/ms/setting/pembayaran'
      },
      {
        title: 'Setting',
        icon: 'tabler:settings-cog',
        badgeColor: 'error',
        children: [{ title: 'Aplikasi', path: '/ms/setting/aplikasi' }]
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
