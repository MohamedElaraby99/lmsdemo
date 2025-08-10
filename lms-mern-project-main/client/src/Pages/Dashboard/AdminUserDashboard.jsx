import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import Layout from "../../Layout/Layout";
import { 
    getAllUsers, 
    createUser,
    getUserDetails, 
    toggleUserStatus, 
    deleteUser, 
    updateUserRole,
    getUserActivities,
    getUserStats,
    clearAdminUserError 
} from "../../Redux/Slices/AdminUserSlice";
import { 
    FaUsers, 
    FaUser, 
    FaUserCheck, 
    FaUserTimes, 
    FaUserCog, 
    FaTrash, 
    FaEdit, 
    FaEye, 
    FaSearch, 
    FaFilter,
    FaChartBar,
    FaWallet,
    FaCreditCard,
    FaCalendarAlt,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaGraduationCap,
    FaBirthdayCake,
    FaToggleOn,
    FaToggleOff,
    FaCrown,
    FaUserSecret,
    FaHistory,
    FaMoneyBillWave,
    FaArrowUp,
    FaArrowDown,
    FaExclamationTriangle,
    FaCheckCircle,
    FaTimesCircle,
    FaPlus,
    FaSave,
    FaTimes
} from "react-icons/fa";
import { axiosInstance } from "../../Helpers/axiosInstance";
import { egyptianGovernorates } from "../../utils/governorateMapping";

export default function AdminUserDashboard() {
    const dispatch = useDispatch();
    const { data: user, isLoggedIn, role } = useSelector((state) => state.auth);
    const { 
        users, 
        selectedUser, 
        userActivities, 
        userStats, 
        stats, 
        pagination, 
        loading, 
        error, 
        actionLoading, 
        actionError 
    } = useSelector((state) => state.adminUser);

    const [filters, setFilters] = useState({
        role: "",
        status: "",
        stage: "",
        search: ""
    });
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [showUserDetails, setShowUserDetails] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createUserForm, setCreateUserForm] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        role: 'USER',
        phoneNumber: '',
        fatherPhoneNumber: '',
        governorate: '',
        stage: '',
        age: ''
    });
    const [activeTab, setActiveTab] = useState("users");
    const [stages, setStages] = useState([]);

    // Fetch stages on component mount
    useEffect(() => {
        const fetchStages = async () => {
            try {
                const response = await axiosInstance.get('/stages');
                if (response.data.success) {
                    setStages(response.data.data.stages);
                }
            } catch (error) {
                console.error('Error fetching stages:', error);
            }
        };

        fetchStages();
    }, []);

    // Monitor filter changes
    useEffect(() => {
        console.log('Filters changed:', filters);
    }, [filters]);

    useEffect(() => {
        console.log('=== AUTH DEBUG ===');
        console.log('Current user:', user);
        console.log('Is logged in:', isLoggedIn);
        console.log('User role:', role);
        console.log('User object:', user);
        console.log('LocalStorage data:', localStorage.getItem('data'));
        console.log('LocalStorage role:', localStorage.getItem('role'));
        console.log('LocalStorage isLoggedIn:', localStorage.getItem('isLoggedIn'));
        
        if (isLoggedIn && role === "ADMIN") {
            console.log('Dispatching getAllUsers...');
            let roleFilter = "";
            if (activeTab === "users") {
                roleFilter = "USER";
            } else if (activeTab === "admins") {
                roleFilter = "ADMIN";
            }
            
            console.log('Initial role filter:', roleFilter);
            console.log('Initial filters:', filters);
            
            dispatch(getAllUsers({ 
                page: 1, 
                limit: 20, 
                role: roleFilter,
                status: filters.status,
                stage: filters.stage,
                search: filters.search 
            }));
        } else {
            console.log('User not admin or not logged in');
            console.log('isLoggedIn:', isLoggedIn);
            console.log('role:', role);
        }
    }, [dispatch, user, isLoggedIn, role, activeTab]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearAdminUserError());
        }
        if (actionError) {
            toast.error(actionError);
            dispatch(clearAdminUserError());
        }
    }, [error, actionError, dispatch]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        console.log('Filter change:', name, value);
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleApplyFilters = () => {
        console.log('Applying filters:', filters);
        console.log('Active tab:', activeTab);
        
        let roleFilter = "";
        if (activeTab === "users") {
            roleFilter = "USER";
        } else if (activeTab === "admins") {
            roleFilter = "ADMIN";
        } else {
            roleFilter = filters.role;
        }
        
        console.log('Role filter:', roleFilter);
        console.log('Final filter params:', { 
            page: 1, 
            limit: 20, 
            role: roleFilter,
            status: filters.status,
            stage: filters.stage,
            search: filters.search 
        });
        
        dispatch(getAllUsers({ 
            page: 1, 
            limit: 20, 
            role: roleFilter,
            status: filters.status,
            stage: filters.stage,
            search: filters.search 
        }));
    };

    const handleViewUser = async (userId) => {
        setSelectedUserId(userId);
        setShowUserDetails(true);
        setActiveTab("details");
        
        try {
            await dispatch(getUserDetails(userId)).unwrap();
            await dispatch(getUserStats(userId)).unwrap();
            await dispatch(getUserActivities({ userId, page: 1, limit: 20 })).unwrap();
        } catch (error) {
            // Error is handled in useEffect
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            await dispatch(toggleUserStatus({ 
                userId, 
                isActive: !currentStatus 
            })).unwrap();
            toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
        } catch (error) {
            // Error is handled in useEffect
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await dispatch(updateUserRole({ 
                userId, 
                role: newRole 
            })).unwrap();
            toast.success(`User role updated to ${newRole}!`);
        } catch (error) {
            // Error is handled in useEffect
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        
        try {
            await dispatch(deleteUser(userToDelete)).unwrap();
            toast.success("User deleted successfully!");
            setShowDeleteConfirm(false);
            setUserToDelete(null);
        } catch (error) {
            // Error is handled in useEffect
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (isActive) => {
        return isActive 
            ? 'text-green-600 bg-green-50 dark:bg-green-900/20' 
            : 'text-red-600 bg-red-50 dark:bg-red-900/20';
    };

    const getRoleColor = (role) => {
        return role === 'ADMIN' 
            ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' 
            : 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'recharge':
                return <FaArrowUp className="text-green-500" />;
            case 'purchase':
                return <FaArrowDown className="text-red-500" />;
            case 'refund':
                return <FaArrowUp className="text-blue-500" />;
            default:
                return <FaMoneyBillWave className="text-gray-500" />;
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8" dir="rtl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto h-16 w-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                            <FaUsers className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            إدارة المستخدمين
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            إدارة المستخدمين وعرض الأنشطة والتحكم في الوصول
                        </p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                                    <FaUsers className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="mr-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">إجمالي المستخدمين</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                                    <FaUserCheck className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="mr-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">المستخدمون النشطون</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeUsers}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
                                    <FaUserTimes className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="mr-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">المستخدمون غير النشطين</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inactiveUsers}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
                                    <FaCrown className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="mr-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">المديرون</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.adminUsers}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/20">
                                    <FaUser className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div className="mr-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">الطلاب</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.regularUsers}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-4 space-x-reverse mb-6">
                        <button
                            onClick={() => setActiveTab("users")}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                activeTab === "users"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                            }`}
                        >
                            <FaUsers className="inline mr-2" />
                            الطلاب
                        </button>
                        <button
                            onClick={() => setActiveTab("admins")}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                activeTab === "admins"
                                    ? "bg-purple-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                            }`}
                        >
                            <FaCrown className="inline mr-2" />
                            المديرون
                        </button>
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                activeTab === "all"
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                            }`}
                        >
                            <FaUser className="inline mr-2" />
                            جميع المستخدمين
                        </button>
                    </div>

                    {/* Create User Button */}
                    <div className="mb-6 flex justify-end">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
                        >
                            <FaPlus />
                            إنشاء مستخدم جديد
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                        {activeTab === "users" && (
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                    جميع المستخدمين
                                </h3>

                                {/* Filters */}
                                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                البحث
                                            </label>
                                            <input
                                                type="text"
                                                name="search"
                                                value={filters.search}
                                                onChange={handleFilterChange}
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="البحث بالاسم أو البريد الإلكتروني"
                                            />
                                        </div>
                                        {activeTab === "all" && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    الدور
                                                </label>
                                                <select
                                                    name="role"
                                                    value={filters.role}
                                                    onChange={handleFilterChange}
                                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    <option value="">جميع الأدوار</option>
                                                    <option value="USER">مستخدم</option>
                                                    <option value="ADMIN">مدير</option>
                                                </select>
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                الحالة
                                            </label>
                                            <select
                                                name="status"
                                                value={filters.status}
                                                onChange={handleFilterChange}
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="">جميع الحالات</option>
                                                <option value="active">نشط</option>
                                                <option value="inactive">غير نشط</option>
                                            </select>
                                        </div>
                                        {activeTab === "users" && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    المرحلة الدراسية
                                                </label>
                                                <select
                                                    name="stage"
                                                    value={filters.stage}
                                                    onChange={handleFilterChange}
                                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    <option value="">جميع المراحل</option>
                                                    {stages.map(stage => (
                                                        <option key={stage._id} value={stage._id}>{stage.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                        <div className="flex items-end">
                                            <button
                                                onClick={() => {
                                                    console.log('Filter button clicked!');
                                                    handleApplyFilters();
                                                }}
                                                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
                                            >
                                                <FaFilter className="inline mr-2" />
                                                تطبيق المرشحات
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Users List */}
                                {loading ? (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                                    </div>
                                ) : users.length === 0 ? (
                                    <div className="text-center py-8">
                                        <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">
                                            لم يتم العثور على مستخدمين يطابقون معاييرك.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {users.map((user) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className={`p-2 rounded-full ${getStatusColor(user.isActive)}`}>
                                                        {user.isActive ? <FaUserCheck /> : <FaUserTimes />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                                {user.fullName}
                                                            </h4>
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                                {user.role}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {user.email}
                                                        </p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                                            المحفظة: {user.walletBalance} جنيه مصري • المعاملات: {user.totalTransactions}
                                                            {user.stage && (
                                                                <span className="ml-2">• المرحلة: {user.stage.name}</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleViewUser(user.id)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                                        title="عرض التفاصيل"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                                                        className="p-2 text-gray-500 hover:text-yellow-600 transition-colors"
                                                        title={user.isActive ? "إلغاء التفعيل" : "تفعيل"}
                                                    >
                                                        {user.isActive ? <FaToggleOn /> : <FaToggleOff />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateRole(user.id, user.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                                                        className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                                                        title="تغيير الدور"
                                                    >
                                                        <FaUserCog />
                                                    </button>
                                                    {user.role !== 'ADMIN' && (
                                                        <button
                                                            onClick={() => {
                                                                setUserToDelete(user.id);
                                                                setShowDeleteConfirm(true);
                                                            }}
                                                            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                                                            title="حذف المستخدم"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="mt-6 flex justify-center">
                                        <div className="flex space-x-2">
                                            {Array.from({ length: pagination.totalPages }, (_, i) => (
                                                <button
                                                    key={i + 1}
                                                    onClick={() => dispatch(getAllUsers({ 
                                                        page: i + 1, 
                                                        limit: 20, 
                                                        ...filters 
                                                    }))}
                                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                        pagination.currentPage === i + 1
                                                            ? "bg-indigo-600 text-white"
                                                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                                    }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "admins" && (
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                    المديرون
                                </h3>

                                {/* Filters */}
                                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                البحث
                                            </label>
                                            <input
                                                type="text"
                                                name="search"
                                                value={filters.search}
                                                onChange={handleFilterChange}
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="البحث بالاسم أو البريد الإلكتروني"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                الحالة
                                            </label>
                                            <select
                                                name="status"
                                                value={filters.status}
                                                onChange={handleFilterChange}
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="">جميع الحالات</option>
                                                <option value="active">نشط</option>
                                                <option value="inactive">غير نشط</option>
                                            </select>
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                onClick={() => {
                                                    console.log('Filter button clicked (admins)!');
                                                    handleApplyFilters();
                                                }}
                                                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                                            >
                                                <FaFilter className="inline mr-2" />
                                                تطبيق المرشحات
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Admins List */}
                                {loading ? (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                                    </div>
                                ) : users.length === 0 ? (
                                    <div className="text-center py-8">
                                        <FaCrown className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">
                                            لا يوجد مديرون حالياً
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {users.map((user) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className={`p-2 rounded-full ${getStatusColor(user.isActive)}`}>
                                                        {user.isActive ? <FaUserCheck /> : <FaUserTimes />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                                {user.fullName}
                                                            </h4>
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                                {user.role}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {user.email}
                                                        </p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                                            المحفظة: {user.walletBalance} جنيه مصري • المعاملات: {user.totalTransactions}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleViewUser(user.id)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                                        title="عرض التفاصيل"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                                                        className="p-2 text-gray-500 hover:text-yellow-600 transition-colors"
                                                        title={user.isActive ? "إلغاء التفعيل" : "تفعيل"}
                                                    >
                                                        {user.isActive ? <FaToggleOn /> : <FaToggleOff />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateRole(user.id, user.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                                                        className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                                                        title="تغيير الدور"
                                                    >
                                                        <FaUserCog />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "all" && (
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                    جميع المستخدمين
                                </h3>

                                {/* Filters */}
                                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                البحث
                                            </label>
                                            <input
                                                type="text"
                                                name="search"
                                                value={filters.search}
                                                onChange={handleFilterChange}
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="البحث بالاسم أو البريد الإلكتروني"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                الدور
                                            </label>
                                            <select
                                                name="role"
                                                value={filters.role}
                                                onChange={handleFilterChange}
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="">جميع الأدوار</option>
                                                <option value="USER">مستخدم</option>
                                                <option value="ADMIN">مدير</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                الحالة
                                            </label>
                                            <select
                                                name="status"
                                                value={filters.status}
                                                onChange={handleFilterChange}
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="">جميع الحالات</option>
                                                <option value="active">نشط</option>
                                                <option value="inactive">غير نشط</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                المرحلة الدراسية
                                            </label>
                                            <select
                                                name="stage"
                                                value={filters.stage}
                                                onChange={handleFilterChange}
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="">جميع المراحل</option>
                                                {stages.map(stage => (
                                                    <option key={stage._id} value={stage._id}>{stage.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                onClick={() => {
                                                    console.log('Filter button clicked (all)!');
                                                    handleApplyFilters();
                                                }}
                                                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                                            >
                                                <FaFilter className="inline mr-2" />
                                                تطبيق المرشحات
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* All Users List */}
                                {loading ? (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                                    </div>
                                ) : users.length === 0 ? (
                                    <div className="text-center py-8">
                                        <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">
                                            لا يوجد مستخدمون حالياً
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {users.map((user) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className={`p-2 rounded-full ${getStatusColor(user.isActive)}`}>
                                                        {user.isActive ? <FaUserCheck /> : <FaUserTimes />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                                {user.fullName}
                                                            </h4>
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                                {user.role}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {user.email}
                                                        </p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                                            المحفظة: {user.walletBalance} جنيه مصري • المعاملات: {user.totalTransactions}
                                                            {user.stage && (
                                                                <span className="ml-2">• المرحلة: {user.stage.name}</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleViewUser(user.id)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                                        title="عرض التفاصيل"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                                                        className="p-2 text-gray-500 hover:text-yellow-600 transition-colors"
                                                        title={user.isActive ? "إلغاء التفعيل" : "تفعيل"}
                                                    >
                                                        {user.isActive ? <FaToggleOn /> : <FaToggleOff />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateRole(user.id, user.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                                                        className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                                                        title="تغيير الدور"
                                                    >
                                                        <FaUserCog />
                                                    </button>
                                                    {user.role !== 'ADMIN' && (
                                                        <button
                                                            onClick={() => {
                                                                setUserToDelete(user.id);
                                                                setShowDeleteConfirm(true);
                                                            }}
                                                            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                                                            title="حذف المستخدم"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Create User Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        إنشاء مستخدم جديد
                                    </h3>
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <FaTimes size={20} />
                                    </button>
                                </div>
                            </div>

                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    try {
                                        await dispatch(createUser(createUserForm)).unwrap();
                                        setShowCreateModal(false);
                                        setCreateUserForm({
                                            fullName: '',
                                            username: '',
                                            email: '',
                                            password: '',
                                            role: 'USER',
                                            phoneNumber: '',
                                            fatherPhoneNumber: '',
                                            governorate: '',
                                            stage: '',
                                            age: ''
                                        });
                                        toast.success('تم إنشاء المستخدم بنجاح');
                                    } catch (error) {
                                        toast.error(error || 'فشل في إنشاء المستخدم');
                                    }
                                }}
                                className="p-6 space-y-4"
                            >
                                {/* Role Selection */}
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        نوع الحساب *
                                    </label>
                                    <div className="flex space-x-4 space-x-reverse">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="role"
                                                value="USER"
                                                checked={createUserForm.role === 'USER'}
                                                onChange={(e) => setCreateUserForm({...createUserForm, role: e.target.value})}
                                                className="ml-2"
                                            />
                                            طالب (USER)
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="role"
                                                value="ADMIN"
                                                checked={createUserForm.role === 'ADMIN'}
                                                onChange={(e) => setCreateUserForm({...createUserForm, role: e.target.value})}
                                                className="ml-2"
                                            />
                                            مدير (ADMIN)
                                        </label>
                                    </div>
                                </div>

                                {/* Basic Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            الاسم الكامل *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={createUserForm.fullName}
                                            onChange={(e) => setCreateUserForm({...createUserForm, fullName: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            placeholder="أدخل الاسم الكامل"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            اسم المستخدم *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={createUserForm.username}
                                            onChange={(e) => setCreateUserForm({...createUserForm, username: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            placeholder="أدخل اسم المستخدم"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            البريد الإلكتروني *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={createUserForm.email}
                                            onChange={(e) => setCreateUserForm({...createUserForm, email: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            placeholder="أدخل البريد الإلكتروني"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            كلمة المرور *
                                        </label>
                                        <input
                                            type="password"
                                            required
                                            value={createUserForm.password}
                                            onChange={(e) => setCreateUserForm({...createUserForm, password: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            placeholder="أدخل كلمة المرور"
                                        />
                                    </div>
                                </div>

                                {/* User-specific fields */}
                                {createUserForm.role === 'USER' && (
                                    <div className="space-y-4 border-t pt-4">
                                        <h4 className="font-medium text-gray-900 dark:text-white">معلومات إضافية للطلاب</h4>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    رقم الهاتف *
                                                </label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={createUserForm.phoneNumber}
                                                    onChange={(e) => setCreateUserForm({...createUserForm, phoneNumber: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                    placeholder="أدخل رقم الهاتف"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    رقم هاتف ولي الأمر *
                                                </label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={createUserForm.fatherPhoneNumber}
                                                    onChange={(e) => setCreateUserForm({...createUserForm, fatherPhoneNumber: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                    placeholder="أدخل رقم هاتف ولي الأمر"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    المحافظة *
                                                </label>
                                                <select
                                                    required
                                                    value={createUserForm.governorate}
                                                    onChange={(e) => setCreateUserForm({...createUserForm, governorate: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">اختر المحافظة</option>
                                                    {egyptianGovernorates.map((gov) => (
                                                        <option key={gov.value} value={gov.value}>
                                                            {gov.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    المرحلة الدراسية *
                                                </label>
                                                <select
                                                    required
                                                    value={createUserForm.stage}
                                                    onChange={(e) => setCreateUserForm({...createUserForm, stage: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">اختر المرحلة الدراسية</option>
                                                    {stages.map((stage) => (
                                                        <option key={stage._id} value={stage._id}>
                                                            {stage.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    العمر *
                                                </label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="10"
                                                    max="25"
                                                    value={createUserForm.age}
                                                    onChange={(e) => setCreateUserForm({...createUserForm, age: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                    placeholder="أدخل العمر"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Form Actions */}
                                <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {actionLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                جاري الإنشاء...
                                            </>
                                        ) : (
                                            <>
                                                <FaSave />
                                                إنشاء المستخدم
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                            <div className="flex items-center space-x-3 mb-4">
                                <FaExclamationTriangle className="h-8 w-8 text-red-500" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Delete User
                                </h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Are you sure you want to delete this user? This action cannot be undone.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteUser}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
} 