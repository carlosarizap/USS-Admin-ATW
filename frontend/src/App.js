import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

import Navigation from './components/Navigation';
import Inicio from './components/Inicio';
import Alumnos from './components/Alumnos';
import Operadores from './components/Operadores';
import Asignaturas from './components/Asignaturas';
import AlumnoForm from './components/AlumnoForm';
import OperadorForm from './components/OperadorForm';
import Reportes from './components/Reportes';
import Login from './components/Login';
import RecuperaContraseña from './components/RecuperarContraseña';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<RecuperaContraseña />} />
          {/* Protected Routes */}
          <Route
            path="/menu"
            element={
              <>
                <Navigation />
                <ProtectedRoute component={Inicio} />
              </>
            }
          />
          <Route
            path="/alumnos"
            element={
              <>
                <Navigation />
                <ProtectedRoute component={Alumnos} />
              </>
            }
          />
          <Route
            path="/alumnos/:id"
            element={
              <>
                <Navigation />
                <ProtectedRoute component={AlumnoForm} />
              </>
            }
          />
          <Route
            path="/operadores"
            element={
              <>
                <Navigation />
                <ProtectedRoute component={Operadores} />
              </>
            }
          />
          <Route
            path="/operadores/:id"
            element={
              <>
                <Navigation />
                <ProtectedRoute component={OperadorForm} />
              </>
            }
          />
          <Route
            path="/asignaturas"
            element={
              <>
                <Navigation />
                <ProtectedRoute component={Asignaturas} />
              </>
            }
          />
          <Route
            path="/reportes"
            element={
              <>
                <Navigation />
                <ProtectedRoute component={Reportes} />
              </>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// A helper component for protected routes
function ProtectedRoute({ component: Component, ...props }) {
  const { isAuthenticated } = useContext(AuthContext);

  if (isAuthenticated) {
    return <Component {...props} />;
  } else {
    return <Navigate to="/" />;
  }
}

export default App;
