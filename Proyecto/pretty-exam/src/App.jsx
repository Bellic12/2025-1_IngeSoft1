import { HashRouter, Route, Routes } from 'react-router-dom'
import Layout from './pages/layout'
import Questions from './pages/questions'
import Exams from './pages/exams'
import ExamDetail from './pages/examDetail'
import { ToastContainer } from 'react-toastify'
import ExamSimulation from './components/examSimulation'
import { ExamSimProvider } from './components/examSimContext'
import ExamResults from './components/examResults'

function App() {
  return (
    <>
      <HashRouter>
        <ExamSimProvider>
          <Routes>
            <Route path="/exam/:id/simulacion" element={<ExamSimulation />} />
            <Route path="/resultados/:id" element={<ExamResults />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Exams />} />
              <Route path="exams" element={<Exams />} />
              <Route path="exam/:id" element={<ExamDetail />} />
              <Route path="preguntas" element={<Questions />} />
            </Route>
          </Routes>
        </ExamSimProvider>
      </HashRouter>
      <ToastContainer theme="dark" position="bottom-left" />
    </>
  )
}

export default App
