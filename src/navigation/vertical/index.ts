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
          }
        ]
      },
      {
        title: 'Administrasi Koperasi',
        icon: 'tabler:input-check',
        badgeColor: 'error',
        children: [
          {
            title: 'Identitas Koperasi',
            path: 'admin/ms/cooperative/identitas'
          },
          {
            title: 'Buku Administrasi',
            path: 'admin/ms/cooperative/administrasi'
          },
          {
            title: 'Pengumuman',
            path: 'admin/ms/cooperative/pengumuman-anggota'
          },
          {
            title: 'Sehat Koperasiku',
            path: 'admin/ms/cooperative/integrasi-sehat-koperasiku'
          },
          {
            title: 'Kritik dan Saran Anggota',
            path: 'admin/ms/cooperative/saran-anggota'
          }
        ]
      },
      {
        title: 'Anggota',
        icon: 'tabler:user-square',
        badgeColor: 'error',
        children: [
          {
            title: 'Calon Anggota',
            path: '/ms/anggota/daftar'
          },
          {
            title: 'Kategori Anggota',
            path: 'admin/ms/nasabah/kategori-nasabah'
          },
          {
            title: 'Anggota',
            path: '/ms/anggota'
          },
          {
            title: 'Teller',
            path: 'admin/ms/nasabah/transaksi'
          }
        ]
      },
      {
        title: 'Simpanan',
        icon: 'tabler:folder-dollar',
        badgeColor: 'error',
        children: [
          {
            title: 'Daftar Transaksi Autodebet',
            path: 'admin/ms/tabungan/transaksi-penjadwalan-transaksi'
          },
          {
            title: 'Rekening Simpanan',
            path: 'admin/ms/tabungan/rekening'
          },
          {
            title: 'Transaksi Simpanan',
            path: 'admin/ms/tabungan/transaksi'
          },
          {
            title: 'Jadwal Bunga Otomatis',
            path: 'admin/ms/tabungan/pengaturan-bunga-otomatis'
          },
          {
            title: 'Tutup Rekening',
            path: 'admin/ms/tabungan/tutup-rekening'
          },
          {
            title: 'Tutup Rekening Pasif',
            path: 'admin/ms/tabungan/tutup-rekening-tidak-aktif'
          },
          {
            title: 'Transfer',
            path: 'admin/ms/tabungan/transfer'
          },
          {
            title: 'Transfer Bank Lain',
            path: 'admin/ms/tabungan/transfer-bank-lain'
          },
          {
            title: 'Cetak Buku',
            path: 'admin/ms/tabungan/cetak-buku'
          },
          {
            title: 'Prima Nota',
            path: 'admin/ms/tabungan/rekening-koran'
          }
        ]
      },
      {
        sectionTitle: 'Report'
      },
      {
        title: 'Akunting',
        icon: 'tabler:calculator',
        path: '/finance/accounting/reports/daily-balance'
      },
      {
        sectionTitle: 'Setting'
      },
      {
        title: 'Setting',
        icon: 'tabler:settings-cog',
        badgeColor: 'error',
        children: [
          {
            title: 'Aplikasi',
            path: 'admin/setting/aplikasi'
          }
        ]
      }
    ]
  } else if (role == 160) {
    return [
      {
        title: 'Approval',
        icon: 'mingcute:archive-line',
        path: 'admin/cb/approval;'
      },
      {
        title: 'Dashboards',
        icon: 'ion:home-outline',
        badgeColor: 'error',
        children: [
          {
            title: 'Anggota',
            path: 'admin/cb/dashboards/anggota'
          },
          {
            title: 'Tabungan',
            path: 'admin/cb/dashboards/tabungan'
          },
          {
            title: 'Simpanan Berjangka',
            path: 'admin/cb/dashboards/deposito'
          },
          {
            title: 'Kolektor',
            path: 'admin/cb/dashboards/kolektor'
          },
          {
            title: 'PPOB',
            path: 'admin/cb/dashboards/ppob'
          }
        ]
      },
      {
        sectionTitle: 'Master Data'
      },
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
      },
      {
        title: 'Administrasi Koperasi',
        icon: 'tabler:input-check',
        badgeColor: 'error',
        children: [
          {
            title: 'Identitas Koperasi',
            path: 'admin/ms/cooperative/identitas'
          },
          {
            title: 'Buku Administrasi',
            path: 'admin/ms/cooperative/administrasi'
          },
          {
            title: 'Pengumuman',
            path: 'admin/ms/cooperative/pengumuman-anggota'
          },
          {
            title: 'Sehat Koperasiku',
            path: 'admin/ms/cooperative/integrasi-sehat-koperasiku'
          },
          {
            title: 'Kritik dan Saran Anggota',
            path: 'admin/ms/cooperative/saran-anggota'
          }
        ]
      },
      {
        title: 'Anggota',
        icon: 'tabler:user-square',
        badgeColor: 'error',
        children: [
          {
            title: 'Calon Anggota',
            path: 'admin/ms/nasabah/daftar'
          },
          {
            title: 'Kategori Anggota',
            path: 'admin/ms/nasabah/kategori-nasabah'
          },
          {
            title: 'Anggota',
            path: '/ms/anggota'
          },
          {
            title: 'Teller',
            path: 'admin/ms/nasabah/transaksi'
          }
        ]
      },
      {
        title: 'Simpanan',
        icon: 'tabler:folder-dollar',
        badgeColor: 'error',
        children: [
          {
            title: 'Daftar Transaksi Autodebet',
            path: 'admin/ms/tabungan/transaksi-penjadwalan-transaksi'
          },
          {
            title: 'Rekening Simpanan',
            path: 'admin/ms/tabungan/rekening'
          },
          {
            title: 'Transaksi Simpanan',
            path: 'admin/ms/tabungan/transaksi'
          },
          {
            title: 'Jadwal Bunga Otomatis',
            path: 'admin/ms/tabungan/pengaturan-bunga-otomatis'
          },
          {
            title: 'Tutup Rekening',
            path: 'admin/ms/tabungan/tutup-rekening'
          },
          {
            title: 'Tutup Rekening Pasif',
            path: 'admin/ms/tabungan/tutup-rekening-tidak-aktif'
          },
          {
            title: 'Transfer',
            path: 'admin/ms/tabungan/transfer'
          },
          {
            title: 'Transfer Bank Lain',
            path: 'admin/ms/tabungan/transfer-bank-lain'
          },
          {
            title: 'Cetak Buku',
            path: 'admin/ms/tabungan/cetak-buku'
          },
          {
            title: 'Prima Nota',
            path: 'admin/ms/tabungan/rekening-koran'
          }
        ]
      },
      {
        sectionTitle: 'Report'
      },
      {
        title: 'Akunting',
        icon: 'tabler:calculator',
        path: '/finance/accounting/reports/daily-balance'
      },
      {
        sectionTitle: 'Setting'
      },
      {
        title: 'Setting',
        icon: 'tabler:settings-cog',
        badgeColor: 'error',
        children: [
          {
            title: 'Aplikasi',
            path: 'admin/setting/aplikasi'
          }
        ]
      }
    ]
  } else if (role == 170) {
    return [
      {
        title: 'Dashboards',
        icon: 'ion:home-outline',
        path: '/ms/dashboard'
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
            path: 'admin/setting/aplikasi'
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
