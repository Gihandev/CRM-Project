import Sidebar from './Sidebar'

const PageWrapper = ({ children }) => (
  <div className="flex min-h-screen bg-gray-50">
    <Sidebar />
    {/* Content shifts right by sidebar width */}
    <main className="flex-1 ml-64 p-8 min-h-screen">
      {children}
    </main>
  </div>
)

export default PageWrapper