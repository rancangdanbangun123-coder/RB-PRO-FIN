import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Procurement from './pages/Procurement';
import Subkontraktor from './pages/Subkontraktor';
import MaterialDatabase from './pages/MaterialDatabase';
import AssetsInventory from './pages/AssetsInventory';
import Invoice from './pages/Invoice';
import Laporan from './pages/Laporan';
import CategoryList from './pages/CategoryList';
import CategoryCreate from './pages/CategoryCreate';
import CategoryEdit from './pages/CategoryEdit';
import SubCategoryCreate from './pages/SubCategoryCreate';
import SubCategoryEdit from './pages/SubCategoryEdit';
import Akuntansi from './pages/Akuntansi';
import UserManagement from './pages/UserManagement';
import PendingApproval from './pages/PendingApproval';

export default function App() {
  // Data seeding and migrations are now handled by the backend database;

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/pending" element={<PendingApproval />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/proyek" element={<ProtectedRoute requiredPermission="view_proyek"><Projects /></ProtectedRoute>} />
          <Route path="/project/:id" element={<ProtectedRoute requiredPermission="view_proyek"><ProjectDetails /></ProtectedRoute>} />
          <Route path="/procurement" element={<ProtectedRoute requiredPermission="view_logistik"><Procurement /></ProtectedRoute>} />
          <Route path="/subkontraktor" element={<ProtectedRoute requiredPermission="view_logistik"><Subkontraktor /></ProtectedRoute>} />
          <Route path="/material" element={<ProtectedRoute requiredPermission="view_logistik"><MaterialDatabase /></ProtectedRoute>} />
          <Route path="/assets" element={<ProtectedRoute requiredPermission="view_logistik"><AssetsInventory /></ProtectedRoute>} />
          <Route path="/invoice" element={<ProtectedRoute requiredPermission="view_keuangan"><Invoice /></ProtectedRoute>} />
          <Route path="/laporan" element={<ProtectedRoute requiredPermission="view_keuangan"><Laporan /></ProtectedRoute>} />
          <Route path="/category" element={<ProtectedRoute requiredPermission="view_category"><CategoryList /></ProtectedRoute>} />
          <Route path="/category/create" element={<ProtectedRoute requiredPermission="view_category"><CategoryCreate /></ProtectedRoute>} />
          <Route path="/category/edit/:id" element={<ProtectedRoute requiredPermission="view_category"><CategoryEdit /></ProtectedRoute>} />
          <Route path="/subcategory/create" element={<ProtectedRoute requiredPermission="view_category"><SubCategoryCreate /></ProtectedRoute>} />
          <Route path="/subcategory/edit/:id" element={<ProtectedRoute requiredPermission="view_category"><SubCategoryEdit /></ProtectedRoute>} />
          <Route path="/akuntansi" element={<ProtectedRoute requiredPermission="view_akuntansi"><Akuntansi /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute requiredPermission="view_users"><UserManagement /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

