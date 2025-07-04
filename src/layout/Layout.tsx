import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Layout = () => {
  return (
    <div className="felx flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow px-4 py-6">
        <Outlet /> 
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
