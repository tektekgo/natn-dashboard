/**
 * Dashboard layout - sidebar + header + content area + footer.
 */

import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import Footer from './Footer'
import ChatDrawer from '@/components/ai/ChatDrawer'

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
        <Footer />
      </div>
      <ChatDrawer />
    </div>
  )
}
