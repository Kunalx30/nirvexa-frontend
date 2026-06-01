import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {children}
      </main>
    </div>
  )
}
