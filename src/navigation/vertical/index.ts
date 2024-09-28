// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  const data = localStorage.getItem('userData') as any
  const getDataLocal = JSON.parse(data)
  const role = getDataLocal.role
  if (role == 150) {
    return [
      {
        title: 'Dashboards',
        icon: 'ion:home-outline',
        path: 'admin/cb/approval;'
      },
      {
        title: 'Master Data',
        icon: 'tabler:users',
        badgeColor: 'error',
        children: [
          {
            title: 'Admin',
            path: '/ms/admin'
          },
          {
            title: 'Siswa',
            path: '/ms/siswa'
          },
          {
            title: 'Sekolah',
            path: '/ms/sekolah'
          },
          {
            title: 'Aplikasi',
            path: '/ms/aplikasi'
          },
          {
            title: 'Affiliate',
            path: '/ms/affiliate'
          }
        ]
      },

      {
        title: 'Setting',
        icon: 'tabler:settings-cog',
        badgeColor: 'error',
        children: [
          {
            title: 'Aplikasi',
            path: 'ms/setting/aplikasi'
          }
        ]
      }
    ]
  } else if (role == 160) {
    return [
      {
        title: 'Dashboards',
        icon: 'ion:home-outline',
        badgeColor: 'error',
        path: '/ms/dashboard/siswa'
      }
    ]
  } else if (role == 170) {
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
          {
            title: 'Siswa',
            path: '/ms/siswa'
          },
          {
            title: 'Kelas',
            path: '/ms/kelas'
          },
          {
            title: 'Jurusan',
            path: '/ms/jurusan'
          },
          {
            title: 'Bulan',
            path: '/ms/bulan'
          }
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
        children: [
          {
            title: 'Aplikasi',
            path: '/ms/setting/aplikasi'
          }
        ]
      }
    ]
  } else {
    return [
      {
        title: 'Admin',
        icon: 'tabler:users',
        badgeColor: 'error',
        children: [
          {
            title: 'Data Admin',
            path: '/ms/admin'
          }
        ]
      }
    ]
  }
}

export default navigation
