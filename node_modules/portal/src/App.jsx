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
import { useEffect } from 'react';
import { MATERIAL_DATABASE } from './data/materialData';

export default function App() {
  useEffect(() => {
    // Prevent continuous re-seeding if the user later renames or deletes seeded categories
    if (localStorage.getItem("hasSeededCategories")) {
      return;
    }

    const existingCats = localStorage.getItem("categories");
    const existingSubs = localStorage.getItem("subCategories");

    const existingCatsData = existingCats ? JSON.parse(existingCats) : [];
    const existingSubsData = existingSubs ? JSON.parse(existingSubs) : [];

    let catsUpdated = false;
    let subsUpdated = false;

    const uniqueCats = [...new Set(MATERIAL_DATABASE.map(m => m.category || "Uncategorized"))].filter(Boolean);

    uniqueCats.forEach((catName, index) => {
      let cat = existingCatsData.find(c => c.name.toLowerCase() === catName.toLowerCase());
      if (!cat) {
        cat = {
          id: Date.now() + index,
          name: catName
        };
        existingCatsData.push(cat);
        catsUpdated = true;
      }

      const matchingMaterials = MATERIAL_DATABASE.filter(m => (m.category || "Uncategorized") === catName);
      const uniqueSubNames = [...new Set(matchingMaterials.map(m => m.subCategory || "-"))].filter(Boolean);

      uniqueSubNames.forEach((subName, subIndex) => {
        let sub = existingSubsData.find(s => s.name.toLowerCase() === subName.toLowerCase() && s.categoryId === cat.id);
        if (!sub) {
          existingSubsData.push({
            id: Date.now() + 1000 + (index * 100) + subIndex,
            categoryId: cat.id,
            name: subName
          });
          subsUpdated = true;
        }
      });
    });

    if (catsUpdated) localStorage.setItem("categories", JSON.stringify(existingCatsData));
    if (subsUpdated) localStorage.setItem("subCategories", JSON.stringify(existingSubsData));

    // Mark as seeded so we don't accidentally resurrect deleted or renamed default categories
    localStorage.setItem("hasSeededCategories", "true");

    if (catsUpdated || subsUpdated) {
      window.dispatchEvent(new Event("storage"));
    }
  }, []);

  // One-time data migration to overwrite old MAT-XXX-000 IDs to new 3-letter scheme
  useEffect(() => {
    if (localStorage.getItem("hasMigratedMaterialIdsV3")) return;

    const savedMats = localStorage.getItem("materials");
    if (!savedMats) return;

    let materials = JSON.parse(savedMats);
    let changed = false;

    const getPrefix = (name) => {
      if (!name) return 'UNK';
      let cleanName = name.toUpperCase().replace(/[^A-Z]/g, '');
      return cleanName.substring(0, 3).padEnd(3, 'X');
    };

    // We will completely rebuild the IDs to ensure sequence is perfect
    const newMaterials = [];

    materials.forEach(m => {
      const catPrefix = getPrefix(m.category);
      const subPrefix = getPrefix(m.subCategory);
      const prefix = `${catPrefix}-${subPrefix}-`;

      let maxSeq = 0;
      newMaterials.forEach(existingM => {
        if (existingM.id && existingM.id.startsWith(prefix)) {
          const numPart = existingM.id.substring(prefix.length);
          const num = parseInt(numPart, 10);
          if (!isNaN(num) && num > maxSeq) {
            maxSeq = num;
          }
        }
      });

      const newId = `${prefix}${String(maxSeq + 1).padStart(3, '0')}`;
      if (m.id !== newId) {
        changed = true;
        newMaterials.push({ ...m, id: newId });
      } else {
        newMaterials.push(m);
      }
    });

    if (changed) {
      localStorage.setItem("materials", JSON.stringify(newMaterials));
      window.dispatchEvent(new Event("storage"));
    }

    localStorage.setItem("hasMigratedMaterialIdsV3", "true");
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

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

