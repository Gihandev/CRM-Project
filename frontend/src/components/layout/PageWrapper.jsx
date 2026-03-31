import Navbar from './Navbar'

const PageWrapper = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {children}
    </main>
  </div>
)

export default PageWrapper