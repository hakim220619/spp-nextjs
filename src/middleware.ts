// src/middleware.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import axiosConfig from './configs/axiosConfig'

async function fetchRolePermissions(schoolId: string): Promise<{ [key: string]: number[] }> {
  try {
    const response = await axiosConfig.get(`/rolePermissions?school_id=${schoolId}`)
    if (response.status !== 200) {
      throw new Error('Failed to fetch role permissions')
    }
    
    return response.data
  } catch (error) {
    console.error('Error fetching role permissions:', error)
    throw error // Rethrow to handle in the calling function
  }
}

export async function middleware(request: NextRequest) {
  const userData = request.cookies.get('userData')?.value
  const isAuthenticated = userData ? JSON.parse(userData) : null
  const schoolId = isAuthenticated?.school_id
  const { pathname } = request.nextUrl

  console.log('Requested Path:', schoolId)

  // Allow access to the login page without authentication
  if (pathname === '/login/') {
    if (isAuthenticated) {

      return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
  }

  // Check if user is authenticated and extract role
  const userRole = isAuthenticated?.role || null
  if (!userRole) {
    return NextResponse.redirect(new URL('/login/', request.url))
  }

  // Fetch role permissions based on schoolId
  const rolePermissions: { [key: string]: number[] } = {}
  if (schoolId) {
    try {
      ;(rolePermissions as any) = await fetchRolePermissions(schoolId)
      console.log('Fetched Role Permissions:', rolePermissions)
    } catch (error) {
      return NextResponse.redirect(new URL('/error', request.url))
    }
  } else {
    console.warn('No schoolId found, defaulting to empty role permissions.')
  }

  // Check if the current path is allowed based on role permissions
  const allowedRoles = rolePermissions[pathname] || []
  if (!allowedRoles.includes(userRole)) {
    console.log(`User role (${userRole}) does not match required roles for path ${pathname}, redirecting to 404.`)

    return NextResponse.redirect(new URL('/404', request.url))
  }

  // Allow the request to continue if authenticated and authorized
  return NextResponse.next()
}

// Static matcher for all paths in the /ms folder
export const config = {
  matcher: [
    '/ms/' // Match all paths in the /ms directory
  ]
}
