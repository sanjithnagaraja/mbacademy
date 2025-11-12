import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  FileText, 
  Settings, 
  Plus, 
  TrendingUp,
  UserCheck,
  GraduationCap,
  Activity
} from 'lucide-react';
import { userService, courseService } from '../utils/api';
import AdminUsers from './AdminUsers';
import AdminCourses from './AdminCourses';
import AdminModules from './AdminModules';

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    activeUsers: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [userStats, courseStats] = await Promise.all([
        userService.getStats(),
        courseService.getCourses({ limit: 1 }),
      ]);

      setStats({
        totalUsers: userStats.data.data.totalUsers,
        activeUsers: userStats.data.data.activeUsers,
        totalCourses: courseStats.data.data.pagination.total,
        totalRevenue: 50000, // Mock data
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    { name: 'Overview', path: '/admin', icon: Activity },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Courses', path: '/admin/courses', icon: BookOpen },
    { name: 'Modules', path: '/admin/modules', icon: FileText },
  ];

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses.toLocaleString(),
      icon: GraduationCap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-neutral-200">
        <div className="p-6">
          <h2 className="font-heading text-xl font-bold text-neutral-800">Admin Dashboard</h2>
        </div>
        <nav className="px-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<AdminOverview statsCards={statsCards} loading={loading} />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/courses" element={<AdminCourses />} />
          <Route path="/modules" element={<AdminModules />} />
        </Routes>
      </div>
    </div>
  );
};

// Admin Overview Component
const AdminOverview: React.FC<{ statsCards: any[]; loading: boolean }> = ({ statsCards, loading }) => {
  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="h-4 bg-neutral-200 rounded w-24 mb-4"></div>
                <div className="h-8 bg-neutral-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-neutral-800 mb-2">Dashboard Overview</h1>
        <p className="text-neutral-600">Welcome back! Here's what's happening with your academy.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-neutral-800">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 mb-8">
        <h2 className="font-heading text-xl font-semibold text-neutral-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/courses"
            className="flex items-center p-4 border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors duration-200"
          >
            <Plus className="w-5 h-5 text-primary-600 mr-3" />
            <span className="font-medium text-neutral-700">Add New Course</span>
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center p-4 border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors duration-200"
          >
            <Users className="w-5 h-5 text-primary-600 mr-3" />
            <span className="font-medium text-neutral-700">Manage Users</span>
          </Link>
          <Link
            to="/admin/modules"
            className="flex items-center p-4 border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors duration-200"
          >
            <FileText className="w-5 h-5 text-primary-600 mr-3" />
            <span className="font-medium text-neutral-700">Create Module</span>
          </Link>
        </div>
      </div>
    </div>
  );
};


export default AdminDashboard;