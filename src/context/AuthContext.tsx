// ** React Imports
import { createContext, useEffect, useState, ReactNode } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Config
import authConfig from 'src/configs/auth'

// ** Types
import { AuthValuesType, LoginParams, ErrCallbackType, UserDataType } from './types'

import axiosConfig from 'src/configs/axiosConfig'

// ** Defaults
const defaultProvider: AuthValuesType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
}

const AuthContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const AuthProvider = ({ children }: Props) => {
  // ** States
  const [user, setUser] = useState<UserDataType | null>(defaultProvider.user)
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading)

  // ** Hooks
  const router = useRouter()

  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      const storedToken = window.localStorage.getItem('token')
      if (storedToken) {
        setLoading(true)
        // Check login with the stored token
        await checkLogin(storedToken)
      } else {
        setLoading(false)
        router.replace('/login')
      }
    }

    const checkLogin = async (token: string): Promise<void> => {
      setLoading(true)
      try {
        const response = await axiosConfig.get('/checklogin', {
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer ' + token
          }
        })

        setUser({ ...response.data.userData })
      } catch (error) {
        handleAuthError(error)
      } finally {
        setLoading(false)
      }
    }

    const handleAuthError = async (error: any) => {
      localStorage.removeItem('userData')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('accessToken')
      setUser(null)

      if (error.response) {
        if (error.response.data.message === 'Invalid token') {
          // Attempt to refresh token
          await refreshAccessToken()
        } else {
          // Handle other errors
          if (authConfig.onTokenExpiration === 'logout' && !router.pathname.includes('login')) {
            router.replace('/login')
          }
        }
      }
    }

    const refreshAccessToken = async (): Promise<void> => {
      const refreshToken = localStorage.getItem('refreshToken') // Change from 'token' to 'refreshToken'
      if (!refreshToken) {
        router.replace('/login')
        return
      }

      try {
        const storedToken = localStorage.getItem('token') // Get the access token for headers
        const response = await axiosConfig.get('/refresh-token', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}` // Use the access token for authorization
          }
        })

        const newAccessToken = response.data.accessToken
        const userData = response.data.userData

        // Update local storage
        window.localStorage.setItem('token', newAccessToken)
        window.localStorage.setItem('userData', JSON.stringify(userData))
        setUser({ ...userData })
      } catch (error) {
        // If refreshing fails, log the user out
        handleLogout()
      }
    }

    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogin = (params: LoginParams, errorCallback?: ErrCallbackType) => {
    axiosConfig
      .post('/login', params)
      .then(async response => {
        if (params.rememberMe) {
          window.localStorage.setItem('token', response.data.accessToken)
          window.localStorage.setItem('refreshToken', response.data.accessToken) // Store refresh token
          window.localStorage.setItem('userData', JSON.stringify(response.data.userData))
        }

        const returnUrl = router.query.returnUrl
        setUser({ ...response.data.userData })

        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
        router.replace(redirectURL as string)
      })
      .catch(err => {
        if (errorCallback) errorCallback(err)
      })
  }

  const handleLogout = () => {
    setUser(null)
    window.localStorage.removeItem('userData')
    window.localStorage.removeItem(authConfig.storageTokenKeyName)
    window.localStorage.removeItem('refreshToken') // Remove refresh token on logout
    router.push('/login')
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
