import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Registration from './pages/Patients';
import Appointments from './pages/Appointments';
import Records from './pages/Records';
import Pharmacy from './pages/Pharmacy';
import Inventory from './pages/Inventory';
import Vitals from './pages/Vitals';
import Reports from './pages/Reports';
import Laboratory from './pages/Laboratory';
import Billing from './pages/Billing';
import UserManagement from './pages/UserManagement';
import PatientPortal from './pages/PatientPortal';
import AuditLogs from './pages/AuditLogs';
import Wards from './pages/Wards';
import Admissions from './pages/Admissions';
import Notifications from './pages/Notifications';
import Backup from './pages/Backup';
import Emergency from './pages/Emergency';
import ConsultingRoom from './pages/ConsultingRoom';


const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="app-container">
                    <AuthContent />
                </div>
            </Router>
        </AuthProvider>
    );
}

const AuthContent = () => {
    const { user } = useAuth();

    return (
        <>
            {user && <Navbar />}
            <main className="content" style={{ marginLeft: user ? '0' : 'auto', marginRight: user ? '0' : 'auto' }}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/registration" element={<ProtectedRoute><Registration /></ProtectedRoute>} />
                    <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
                    <Route path="/records" element={<ProtectedRoute><Records /></ProtectedRoute>} />
                    <Route path="/pharmacy" element={<ProtectedRoute><Pharmacy /></ProtectedRoute>} />
                    <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
                    <Route path="/vitals" element={<ProtectedRoute><Vitals /></ProtectedRoute>} />
                    <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                    <Route path="/laboratory" element={<ProtectedRoute><Laboratory /></ProtectedRoute>} />
                    <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
                    <Route path="/billing/:id" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
                    <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
                    <Route path="/patient-portal" element={<ProtectedRoute><PatientPortal /></ProtectedRoute>} />
                    <Route path="/audit" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
                    <Route path="/wards" element={<ProtectedRoute><Wards /></ProtectedRoute>} />
                    <Route path="/admissions" element={<ProtectedRoute><Admissions /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                    <Route path="/backup" element={<ProtectedRoute><Backup /></ProtectedRoute>} />
                    <Route path="/emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
                    <Route path="/consulting-room" element={<ProtectedRoute><ConsultingRoom /></ProtectedRoute>} />

                </Routes>
            </main>
        </>
    );
};

export default App;
