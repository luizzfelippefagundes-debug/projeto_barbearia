import { RouterProvider } from 'react-router-dom'
import { router } from './routes/router'
import { AppDataProvider } from './state/AppDataContext'

function App() {
  return (
    <AppDataProvider>
      <RouterProvider router={router} />
    </AppDataProvider>
  )
}

export default App
