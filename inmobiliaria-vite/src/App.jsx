import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NavBar from './components/NavBar';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <NavBar />
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}
