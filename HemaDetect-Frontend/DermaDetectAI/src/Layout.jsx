import React from 'react'
import { Outlet } from 'react-router-dom'

import './index.css'
const Layout = () => {

  return (
    <div className="layout-container">
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
