import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthForm } from './components/AuthForm'
import './index.css'
import {LandingPage} from './components/LandingPage';

function App() {

  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthForm />}/>
        </Routes>
      </BrowserRouter>
  )
}

export default App
