import { HashRouter, Route, Routes } from 'react-router-dom'
import Layout from './pages/layout'
import Questions from './pages/questions'
import Exams from './pages/exams'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Exams />} />
          <Route path="preguntas" element={<Questions />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
