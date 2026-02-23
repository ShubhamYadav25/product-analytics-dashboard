import React, { useState, useEffect, useCallback } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import DatePicker from 'react-datepicker';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { toast } from 'react-hot-toast';
import "react-datepicker/dist/react-datepicker.css";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [cookies, setCookie] = useCookies(['filters']);
  const [loading, setLoading] = useState(false);
  const [barChartData, setBarChartData] = useState([]);
  const [lineChartData, setLineChartData] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [features, setFeatures] = useState([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    startDate: cookies.filters?.startDate ? new Date(cookies.filters.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: cookies.filters?.endDate ? new Date(cookies.filters.endDate) : new Date(),
    ageGroup: cookies.filters?.ageGroup || 'all',
    gender: cookies.filters?.gender || 'all'
  });

  // Track feature click
  const trackFeature = useCallback(async (featureName) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/track`, {
        featureName
      });
    } catch (error) {
      console.error('Tracking error:', error);
    }
  }, []);

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        startDate: filters.startDate.toISOString(),
        endDate: filters.endDate.toISOString(),
        ageGroup: filters.ageGroup,
        gender: filters.gender
      };

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/analytics`, { params });
      setBarChartData(response.data.barChartData);
      setFeatures(response.data.features);
      
      // Track filter application
      trackFeature('filter_apply');
    } catch (error) {
      toast.error('Failed to load analytics data');
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, trackFeature]);

  // Load line chart data for selected feature
  const loadFeatureTrend = useCallback(async (featureName) => {
    if (!featureName) return;
    
    try {
      const params = {
        featureName,
        startDate: filters.startDate.toISOString(),
        endDate: filters.endDate.toISOString(),
        ageGroup: filters.ageGroup,
        gender: filters.gender
      };

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/analytics/feature-trend`, { params });
      setLineChartData(response.data.timeSeriesData);
    } catch (error) {
      console.error('Feature trend error:', error);
    }
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // Save to cookies
      setCookie('filters', {
        startDate: newFilters.startDate.toISOString(),
        endDate: newFilters.endDate.toISOString(),
        ageGroup: newFilters.ageGroup,
        gender: newFilters.gender
      }, { path: '/', maxAge: 30 * 24 * 60 * 60 }); // 30 days

      return newFilters;
    });

    // Track filter change
    trackFeature(`${key}_filter`);
  };

  // Handle bar click
  const handleBarClick = (data) => {
    setSelectedFeature(data.featureName);
    loadFeatureTrend(data.featureName);
    trackFeature('bar_chart_click');
  };

  // Initial load
  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Load line chart when selected feature changes
  useEffect(() => {
    if (selectedFeature) {
      loadFeatureTrend(selectedFeature);
    }
  }, [selectedFeature, loadFeatureTrend]);

  // Logout handler
  const handleLogout = () => {
    trackFeature('logout');
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Product Analytics Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.username}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <DatePicker
                selected={filters.startDate}
                onChange={(date) => handleFilterChange('startDate', date)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                maxDate={filters.endDate}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <DatePicker
                selected={filters.endDate}
                onChange={(date) => handleFilterChange('endDate', date)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                minDate={filters.startDate}
                maxDate={new Date()}
              />
            </div>

            {/* Age Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age Group
              </label>
              <select
                value={filters.ageGroup}
                onChange={(e) => handleFilterChange('ageGroup', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Ages</option>
                <option value="<18">Under 18</option>
                <option value="18-40">18-40</option>
                <option value=">40">Over 40</option>
              </select>
            </div>

            {/* Gender Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Charts */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Bar Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Feature Usage</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="featureName" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="totalClicks" 
                      fill="#4F46E5" 
                      onClick={handleBarClick}
                      cursor="pointer"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Line Chart */}
            {selectedFeature && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Time Trend: {selectedFeature}
                </h2>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="clicks" 
                        stroke="#4F46E5" 
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;