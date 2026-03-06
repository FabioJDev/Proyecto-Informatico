import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute.jsx';

// Lazy-loaded pages
import { lazy, Suspense } from 'react';

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const wrap = (Component) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component />
  </Suspense>
);

// Auth
const LoginPage = lazy(() => import('../modules/auth/LoginPage.jsx'));
const RegisterPage = lazy(() => import('../modules/auth/RegisterPage.jsx'));
const ForgotPasswordPage = lazy(() => import('../modules/auth/ForgotPasswordPage.jsx'));
const ResetPasswordPage = lazy(() => import('../modules/auth/ResetPasswordPage.jsx'));
const SettingsPage = lazy(() => import('../modules/auth/SettingsPage.jsx'));

// Catalog
const HomePage = lazy(() => import('../modules/catalog/HomePage.jsx'));
const LandingPage = lazy(() => import('../modules/catalog/LandingPage.jsx'));
const ProductsPage = lazy(() => import('../modules/catalog/ProductsPage.jsx'));
const ProductDetailPage = lazy(() => import('../modules/catalog/ProductDetailPage.jsx'));

// Profile
const ProfilePage = lazy(() => import('../modules/profile/ProfilePage.jsx'));
const EditProfilePage = lazy(() => import('../modules/profile/EditProfilePage.jsx'));

// Orders / Dashboard
const MyOrdersPage = lazy(() => import('../modules/orders/MyOrdersPage.jsx'));
const SellerOrdersPage = lazy(() => import('../modules/orders/SellerOrdersPage.jsx'));
const DashboardPage = lazy(() => import('../modules/orders/DashboardPage.jsx'));
const MyProductsPage = lazy(() => import('../modules/orders/MyProductsPage.jsx'));
const NewProductPage = lazy(() => import('../modules/orders/NewProductPage.jsx'));
const EditProductPage = lazy(() => import('../modules/orders/EditProductPage.jsx'));

// Admin
const AdminDashboardPage = lazy(() => import('../modules/admin/AdminDashboardPage.jsx'));
const AdminUsersPage = lazy(() => import('../modules/admin/AdminUsersPage.jsx'));
const AdminProductsPage = lazy(() => import('../modules/admin/AdminProductsPage.jsx'));

export const router = createBrowserRouter([
  // ── Public routes ──────────────────────────────────────────────────────
  { path: '/', element: wrap(HomePage) },
  { path: '/login', element: wrap(LoginPage) },
  { path: '/register', element: wrap(RegisterPage) },
  { path: '/forgot-password', element: wrap(ForgotPasswordPage) },
  { path: '/reset-password', element: wrap(ResetPasswordPage) },
  { path: '/products', element: wrap(ProductsPage) },
  { path: '/products/:id', element: wrap(ProductDetailPage) },
  { path: '/profile/:id', element: wrap(ProfilePage) },

  // ── COMPRADOR routes ───────────────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRoles={['COMPRADOR', 'EMPRENDEDOR', 'ADMIN']} />,
    children: [
      { path: '/settings', element: wrap(SettingsPage) },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['COMPRADOR']} />,
    children: [
      { path: '/my-orders', element: wrap(MyOrdersPage) },
    ],
  },

  // ── EMPRENDEDOR routes ─────────────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRoles={['EMPRENDEDOR']} />,
    children: [
      { path: '/dashboard', element: wrap(DashboardPage) },
      { path: '/my-products', element: wrap(MyProductsPage) },
      { path: '/my-products/new', element: wrap(NewProductPage) },
      { path: '/my-products/:id/edit', element: wrap(EditProductPage) },
      { path: '/seller-orders', element: wrap(SellerOrdersPage) },
      { path: '/profile/edit', element: wrap(EditProfilePage) },
    ],
  },

  // ── ADMIN routes ───────────────────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRoles={['ADMIN']} />,
    children: [
      { path: '/admin', element: wrap(AdminDashboardPage) },
      { path: '/admin/users', element: wrap(AdminUsersPage) },
      { path: '/admin/products', element: wrap(AdminProductsPage) },
    ],
  },

  // ── Fallback ───────────────────────────────────────────────────────────
  { path: '*', element: <Navigate to="/" replace /> },
]);
