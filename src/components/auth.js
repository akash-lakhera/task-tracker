import { createContext ,useContext,useState} from "react";
const AuthContext=createContext(null)
export const Authprovider=({children})=>{
    const [user,setUser]=useState(null)
    const login=(value)=>{
        setUser(value)
    }
    const logout=()=>{
        setUser(null)
    }
    return(
        <AuthContext.Provider value={{user,login,logout}}>
            {children}
        </AuthContext.Provider>
    )
}
export const useAuth=()=>{
    return useContext(AuthContext)
}