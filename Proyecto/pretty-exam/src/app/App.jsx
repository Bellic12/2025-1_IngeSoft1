import { HashRouter, Route, Routes } from 'react-router-dom'
import Layout from '../modules/shared/components/layout'
import Questions from '../modules/questions/pages/questions'
import Exams from '../modules/exams/pages/exams'
import ExamDetail from '../modules/exams/pages/examDetail'
import { ToastContainer } from 'react-toastify'
import ExamSimulation from '../modules/exams/components/examSimulation'
import { ExamSimProvider } from '../modules/exams/components/examSimContext'
import ExamResults from '../modules/exams/components/examResults'
import ExamHistory from '../modules/exams/pages/examHistory'

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
              <Route path="exam/:id/history" element={<ExamHistory />} />
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
