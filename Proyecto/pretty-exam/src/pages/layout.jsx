import { Link, Outlet, useLocation } from 'react-router-dom'
import { BookOpen, HelpCircle, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { ExamSimProvider } from '../components/examSimContext'

const Layout = () => {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <div className="grid grid-cols-12">
        {/* Mobile menu button */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <button
            className="btn btn-square btn-primary"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Sidebar */}
        <aside
          className={`
          col-span-12 lg:col-span-2 min-h-screen bg-base-300 
          fixed lg:static inset-y-0 left-0 z-40 lg:w-auto
          transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 transition-transform duration-300 ease-in-out
        `}
        >
          <div className="p-6 pt-16 lg:pt-6">
            <h1 className="text-xl font-bold mb-8">Pretty Exam</h1>

            <ul className="menu space-y-2 w-full">
              <li>
                <Link
                  to="/"
                  className={`w-full btn btn-outline btn-primary justify-center ${location.pathname === '/' || location.pathname.startsWith('/exam') ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Exámenes
                </Link>
              </li>
              <li>
                <Link
                  to="/preguntas"
                  className={`w-full btn btn-outline btn-secondary justify-center ${location.pathname === '/preguntas' ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <HelpCircle className="w-5 h-5 mr-2" />
                  Preguntas
                </Link>
              </li>
            </ul>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="col-span-12 lg:col-span-10 p-6 pt-16 lg:pt-6">
          <ExamSimProvider>
            <Outlet />
          </ExamSimProvider>
        </div>
      </div>
    </>
  )
}

export default Layout
