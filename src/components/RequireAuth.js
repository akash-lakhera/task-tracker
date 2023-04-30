import React from 'react'
import { useNavigate,useLocation } from 'react-router-dom'
import { useAuth } from './auth'
function RequireAuth({children}) {
    const nav=useNavigate()
    const auth=useAuth()
    if(!auth.user){
        nav("/login")
    }
  return (
    {children}
  )
}

export default RequireAuth