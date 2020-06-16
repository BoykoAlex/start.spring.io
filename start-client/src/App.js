import '../@oss/styles/app.scss'
import './styles/app.scss'

import React from 'react'
import { ToastContainer } from 'react-toastify'
import { render } from 'react-dom'

import Application from './components/Application'
import Close from '../@oss/components/common/form/Close'
import { AppProvider } from '../@oss/components/reducer/App'
import { InitializrProvider } from '../@oss/components/reducer/Initializr'

render(
  <AppProvider>
    <InitializrProvider>
      <ToastContainer
        closeButton={<Close />}
        position='top-center'
        hideProgressBar
      />
      <Application />
    </InitializrProvider>
  </AppProvider>,
  document.getElementById('app')
)
