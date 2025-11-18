import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from '@/components/theme-provider';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Loading from './pages/Loading';
import MyListing from './pages/MyListing';
import NewListing from './pages/NewListing';
import { BookingRequests } from './pages/BookingRequests';

import { ListingDetailContent } from './pages/ListingDetail';
function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="airbrb-theme">
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <div className="min-h-screen">
              <Navbar />
              <Routes>
                <Route path="/" element={<Loading />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/hosted-listings" element={<MyListing />} />
                <Route path="/my-listings" element={<MyListing />} />
                <Route path="/listings/new" element={<NewListing />} />
                <Route path="/listings/:id/edit" element={<NewListing />} />
                <Route path="/listings/:id" element={<ListingDetailContent />} />
                <Route path="/listings/:id/requests" element={<BookingRequests />} />
                <Route path="/booking-requests" element={<BookingRequests />} />
                
              </Routes>
            </div>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
