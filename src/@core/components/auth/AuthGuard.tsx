import { ReactNode, ReactElement, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from 'src/hooks/useAuth'

interface AuthGuardProps {
  children: ReactNode
  fallback: ReactElement | null
}

const AuthGuard = (props: AuthGuardProps) => {
  const { children, fallback } = props
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) {
      return
    }

    // Cek apakah halaman yang diakses adalah /ppdb/ dan biarkan akses tanpa login
    if (router.asPath === '/ppdb') {
      return
    }

    // Cek apakah user sudah login, jika belum arahkan ke halaman login
    if (auth.user === null && !window.localStorage.getItem('userData')) {
      router.replace({
        pathname: '/login',
        query: { returnUrl: router.asPath }
      })
    }
  }, [router.isReady, router.asPath, auth.user])

  if (auth.loading || auth.user === null) {
    return fallback
  }

  return <>{children}</>
}

export default AuthGuard
