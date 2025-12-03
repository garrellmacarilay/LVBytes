import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthForm } from './components/AuthForm'
import './index.css'
import {LandingPage} from './components/LandingPage';
import {Dashboard} from './pages/Dashboard';
import {ChatInterface} from './pages/ChatInterFace';

function App() {

  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthForm />}/>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<ChatInterface />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App
