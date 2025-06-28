import { Link, Outlet } from 'react-router-dom'

const Layout = () => {
  return (
    <div className="grid grid-cols-12">
      <div className="col-span-2 flex flex-col h-screen gap-3 p-5 bg-gray-700">
        <Link to="/">
          <button className="btn btn-primary w-full">Examenes</button>
        </Link>
        <Link to="/preguntas">
          <button className="btn btn-secondary w-full">Preguntas</button>
        </Link>
      </div>
      <div className="col-span-10 p-6">
        <Outlet />
      </div>
    </div>
  )
}

export default Layout
