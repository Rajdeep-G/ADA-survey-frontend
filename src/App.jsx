import { Routes, Route } from 'react-router-dom'
import Landing from './Landing'
import SurveyPage from './SurveyPage'


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/survey" element={<SurveyPage />} />
    </Routes>
  )
}
