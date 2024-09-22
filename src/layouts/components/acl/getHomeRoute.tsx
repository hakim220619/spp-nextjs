/**
 *  Set Home URL based on User Roles
 */
const getHomeRoute = (role: number) => {
  if (role === 150) return '/ms/admin'
  else if (role === 170) return 'ms/siswa'
  else return '/ms/siswa'
}

export default getHomeRoute
