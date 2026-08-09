import {createContext,useContext,useState} from "react";

import GlobalLoader from "../common/GlobalLoader";

const LoaderContext = createContext();

export const LoaderProvider = ({children})=>{
    const [loading,setLoading]=useState(false);

    const showLoader = ()=>setLoading(true);
    const hideLoader = ()=>setLoading(false);

    return (
        <LoaderContext.Provider value={{loading,showLoader,hideLoader}}> 
        {loading && <GlobalLoader/>}
        {children}
        </LoaderContext.Provider>
    )
}

export const useLoader = () => useContext(LoaderContext);