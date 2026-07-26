import { useState } from 'react'
import {Routes,Route} from 'react-router-dom'

import './App.css'

import Navbar from "../src/components/layout/Navbar"
import Footer from "../src/components/layout/Footer"
import Home from "../src/pages/Home"
import About from "../src/pages/About"
import Contact from "../src/pages/Contact"
import Dashboard from "../src/pages/Dashboard"
import Login from "../src/pages/Login"
import Register from "../src/pages/Register"  
import Report from "../src/pages/Report"  


function App() {
  

  return (
    <>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/about" element={<About/>}/>
          <Route path="/contact" element={<Contact/>}/>
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/report" element={<Report/>}/>
        </Routes>

      <Footer/>
    </>
  )
}

export default App
