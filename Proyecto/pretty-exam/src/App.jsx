import { HashRouter, Route, Routes } from 'react-router-dom'
import Layout from './pages/layout'
import Questions from './pages/questions'
import Exams from './pages/exams'
import ExamDetail from './pages/examDetail'
import { ToastContainer } from 'react-toastify'

function App() {
  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Exams />} />
            <Route path="exams" element={<Exams />} />
            <Route path="exam/:id" element={<ExamDetail />} />
            <Route path="preguntas" element={<Questions />} />
          </Route>
        </Routes>
      </HashRouter>
      <ToastContainer theme="dark" position="bottom-left" />
    </>
  )
}

export default App
