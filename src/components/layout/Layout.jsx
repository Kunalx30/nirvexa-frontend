import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 w-full">
        {children}
      </main>
    </div>
  )
}
