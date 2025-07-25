import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import Layout from "../../Layout/Layout";
import {
    getAllServicesAdmin,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    addWhatsAppNumber,
    removeWhatsAppNumber,
    clearWhatsAppServiceError
} from "../../Redux/Slices/WhatsAppServiceSlice";
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaToggleOn,
    FaToggleOff,
    FaWhatsapp,
    FaPhone,
    FaClock,
    FaEye,
    FaEyeSlash,
    FaSearch,
    FaFilter,
    FaSort,
    FaTimes,
    FaCheck,
    FaExclamationTriangle
} from "react-icons/fa";

export default function WhatsAppServiceDashboard() {
    const dispatch = useDispatch();
    const { services, adminLoading, adminError, createLoading, updateLoading, deleteLoading } = useSelector((state) => state.whatsappService);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddNumberModal, setShowAddNumberModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [sortBy, setSortBy] = useState("createdAt");

    const [createForm, setCreateForm] = useState({
        name: "",
        description: "",
        category: "course",
        price: "",
        currency: "EGP",
        icon: "📞",
        instructions: "",
        estimatedResponseTime: "Within 24 hours",
        whatsappNumbers: [{ number: "", name: "", workingHours: "24/7" }]
    });

    const [editForm, setEditForm] = useState({
        name: "",
        description: "",
        category: "course",
        price: "",
        currency: "EGP",
        icon: "📞",
        instructions: "",
        estimatedResponseTime: "Within 24 hours",
        whatsappNumbers: []
    });

    const [addNumberForm, setAddNumberForm] = useState({
        number: "",
        name: "",
        workingHours: "24/7"
    });

    useEffect(() => {
        dispatch(getAllServicesAdmin());
    }, [dispatch]);

    useEffect(() => {
        if (adminError) {
            toast.error(adminError);
            dispatch(clearWhatsAppServiceError());
        }
    }, [adminError, dispatch]);

    const handleCreateFormChange = (e) => {
        const { name, value } = e.target;
        setCreateForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddNumberFormChange = (e) => {
        const { name, value } = e.target;
        setAddNumberForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const addWhatsAppNumberField = () => {
        setCreateForm(prev => ({
            ...prev,
            whatsappNumbers: [...prev.whatsappNumbers, { number: "", name: "", workingHours: "24/7" }]
        }));
    };

    const removeWhatsAppNumberField = (index) => {
        setCreateForm(prev => ({
            ...prev,
            whatsappNumbers: prev.whatsappNumbers.filter((_, i) => i !== index)
        }));
    };

    const updateWhatsAppNumberField = (index, field, value) => {
        setCreateForm(prev => ({
            ...prev,
            whatsappNumbers: prev.whatsappNumbers.map((num, i) =>
                i === index ? { ...num, [field]: value } : num
            )
        }));
    };

    const handleCreateService = async (e) => {
        e.preventDefault();
        
        if (!createForm.name || !createForm.description || !createForm.price) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (createForm.whatsappNumbers.some(num => !num.number || !num.name)) {
            toast.error("Please fill in all WhatsApp number fields");
            return;
        }

        try {
            await dispatch(createService(createForm)).unwrap();
            toast.success("Service created successfully!");
            setShowCreateModal(false);
            setCreateForm({
                name: "",
                description: "",
                category: "course",
                price: "",
                currency: "EGP",
                icon: "📞",
                instructions: "",
                estimatedResponseTime: "Within 24 hours",
                whatsappNumbers: [{ number: "", name: "", workingHours: "24/7" }]
            });
        } catch (error) {
            toast.error(error);
        }
    };

    const handleEditService = async (e) => {
        e.preventDefault();
        
        if (!editForm.name || !editForm.description || !editForm.price) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            await dispatch(updateService({ id: selectedService._id, serviceData: editForm })).unwrap();
            toast.success("Service updated successfully!");
            setShowEditModal(false);
            setSelectedService(null);
        } catch (error) {
            toast.error(error);
        }
    };

    const handleDeleteService = async (serviceId) => {
        if (window.confirm("Are you sure you want to delete this service?")) {
            try {
                await dispatch(deleteService(serviceId)).unwrap();
                toast.success("Service deleted successfully!");
            } catch (error) {
                toast.error(error);
            }
        }
    };

    const handleToggleStatus = async (serviceId) => {
        try {
            await dispatch(toggleServiceStatus(serviceId)).unwrap();
            toast.success("Service status updated successfully!");
        } catch (error) {
            toast.error(error);
        }
    };

    const handleAddWhatsAppNumber = async (e) => {
        e.preventDefault();
        
        if (!addNumberForm.number || !addNumberForm.name) {
            toast.error("Please fill in number and name");
            return;
        }

        try {
            await dispatch(addWhatsAppNumber({
                serviceId: selectedService._id,
                numberData: addNumberForm
            })).unwrap();
            toast.success("WhatsApp number added successfully!");
            setShowAddNumberModal(false);
            setAddNumberForm({ number: "", name: "", workingHours: "24/7" });
        } catch (error) {
            toast.error(error);
        }
    };

    const handleRemoveWhatsAppNumber = async (serviceId, numberId) => {
        if (window.confirm("Are you sure you want to remove this WhatsApp number?")) {
            try {
                await dispatch(removeWhatsAppNumber({ serviceId, numberId })).unwrap();
                toast.success("WhatsApp number removed successfully!");
            } catch (error) {
                toast.error(error);
            }
        }
    };

    const openEditModal = (service) => {
        setSelectedService(service);
        setEditForm({
            name: service.name,
            description: service.description,
            category: service.category,
            price: service.price.toString(),
            currency: service.currency,
            icon: service.icon,
            instructions: service.instructions,
            estimatedResponseTime: service.estimatedResponseTime,
            whatsappNumbers: service.whatsappNumbers
        });
        setShowEditModal(true);
    };

    const openAddNumberModal = (service) => {
        setSelectedService(service);
        setShowAddNumberModal(true);
    };

    const filteredServices = services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             service.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "all" || service.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const sortedServices = [...filteredServices].sort((a, b) => {
        switch (sortBy) {
            case "name":
                return a.name.localeCompare(b.name);
            case "price":
                return a.price - b.price;
            case "category":
                return a.category.localeCompare(b.category);
            case "createdAt":
            default:
                return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });

    const categories = ["course", "tutoring", "consultation", "support", "payment", "other"];

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                WhatsApp Services Management
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">
                                Manage WhatsApp services and contact numbers
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                        >
                            <FaPlus />
                            Add New Service
                        </button>
                    </div>

                    {/* Filters and Search */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search services..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            >
                                <option value="createdAt">Latest First</option>
                                <option value="name">Name A-Z</option>
                                <option value="price">Price Low-High</option>
                                <option value="category">Category</option>
                            </select>
                            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
                                {sortedServices.length} services found
                            </div>
                        </div>
                    </div>

                    {/* Services Grid */}
                    {adminLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortedServices.map((service) => (
                                <div key={service._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{service.icon}</span>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        {service.name}
                                                    </h3>
                                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                                        service.isActive 
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                    }`}>
                                                        {service.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleToggleStatus(service._id)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                                    title={service.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    {service.isActive ? <FaToggleOn className="text-green-500" /> : <FaToggleOff className="text-gray-400" />}
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(service)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteService(service._id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                                            {service.description}
                                        </p>

                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                    {service.price} {service.currency}
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                                {service.category}
                                            </span>
                                        </div>

                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    WhatsApp Numbers ({service.whatsappNumbers.length})
                                                </span>
                                                <button
                                                    onClick={() => openAddNumberModal(service)}
                                                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    Add Number
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {service.whatsappNumbers.map((number, index) => (
                                                    <div key={number._id || index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                                        <div className="flex items-center gap-2">
                                                            <FaWhatsapp className="text-green-500" />
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {number.name}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {number.number}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveWhatsAppNumber(service._id, number._id)}
                                                            className="text-red-500 hover:text-red-700 text-sm"
                                                            title="Remove"
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {sortedServices.length === 0 && !adminLoading && (
                        <div className="text-center py-12">
                            <FaExclamationTriangle className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No services found</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Get started by creating a new WhatsApp service.
                            </p>
                        </div>
                    )}
                </div>

                {/* Create Service Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Create New WhatsApp Service
                                    </h2>
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>

                                <form onSubmit={handleCreateService} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Service Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={createForm.name}
                                                onChange={handleCreateFormChange}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Category *
                                            </label>
                                            <select
                                                name="category"
                                                value={createForm.category}
                                                onChange={handleCreateFormChange}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                required
                                            >
                                                {categories.map(category => (
                                                    <option key={category} value={category}>
                                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Description *
                                        </label>
                                        <textarea
                                            name="description"
                                            value={createForm.description}
                                            onChange={handleCreateFormChange}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Price *
                                            </label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={createForm.price}
                                                onChange={handleCreateFormChange}
                                                min="0"
                                                step="0.01"
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Currency
                                            </label>
                                            <select
                                                name="currency"
                                                value={createForm.currency}
                                                onChange={handleCreateFormChange}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            >
                                                <option value="EGP">EGP</option>
                                                <option value="USD">USD</option>
                                                <option value="EUR">EUR</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Icon
                                            </label>
                                            <input
                                                type="text"
                                                name="icon"
                                                value={createForm.icon}
                                                onChange={handleCreateFormChange}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Instructions
                                        </label>
                                        <textarea
                                            name="instructions"
                                            value={createForm.instructions}
                                            onChange={handleCreateFormChange}
                                            rows={2}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Estimated Response Time
                                        </label>
                                        <input
                                            type="text"
                                            name="estimatedResponseTime"
                                            value={createForm.estimatedResponseTime}
                                            onChange={handleCreateFormChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                WhatsApp Numbers *
                                            </label>
                                            <button
                                                type="button"
                                                onClick={addWhatsAppNumberField}
                                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                + Add Number
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {createForm.whatsappNumbers.map((number, index) => (
                                                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Number *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={number.number}
                                                            onChange={(e) => updateWhatsAppNumberField(index, 'number', e.target.value)}
                                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={number.name}
                                                            onChange={(e) => updateWhatsAppNumberField(index, 'name', e.target.value)}
                                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="flex items-end gap-2">
                                                        <div className="flex-1">
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                Working Hours
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={number.workingHours}
                                                                onChange={(e) => updateWhatsAppNumberField(index, 'workingHours', e.target.value)}
                                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                            />
                                                        </div>
                                                        {createForm.whatsappNumbers.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeWhatsAppNumberField(index)}
                                                                className="p-2 text-red-500 hover:text-red-700"
                                                            >
                                                                <FaTimes />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateModal(false)}
                                            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={createLoading}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                        >
                                            {createLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <FaPlus />
                                                    Create Service
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Service Modal */}
                {showEditModal && selectedService && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Edit WhatsApp Service
                                    </h2>
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>

                                <form onSubmit={handleEditService} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Service Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={editForm.name}
                                                onChange={handleEditFormChange}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Category *
                                            </label>
                                            <select
                                                name="category"
                                                value={editForm.category}
                                                onChange={handleEditFormChange}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                required
                                            >
                                                {categories.map(category => (
                                                    <option key={category} value={category}>
                                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Description *
                                        </label>
                                        <textarea
                                            name="description"
                                            value={editForm.description}
                                            onChange={handleEditFormChange}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Price *
                                            </label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={editForm.price}
                                                onChange={handleEditFormChange}
                                                min="0"
                                                step="0.01"
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Currency
                                            </label>
                                            <select
                                                name="currency"
                                                value={editForm.currency}
                                                onChange={handleEditFormChange}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            >
                                                <option value="EGP">EGP</option>
                                                <option value="USD">USD</option>
                                                <option value="EUR">EUR</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Icon
                                            </label>
                                            <input
                                                type="text"
                                                name="icon"
                                                value={editForm.icon}
                                                onChange={handleEditFormChange}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Instructions
                                        </label>
                                        <textarea
                                            name="instructions"
                                            value={editForm.instructions}
                                            onChange={handleEditFormChange}
                                            rows={2}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Estimated Response Time
                                        </label>
                                        <input
                                            type="text"
                                            name="estimatedResponseTime"
                                            value={editForm.estimatedResponseTime}
                                            onChange={handleEditFormChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            type="button"
                                            onClick={() => setShowEditModal(false)}
                                            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={updateLoading}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                        >
                                            {updateLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <FaEdit />
                                                    Update Service
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add WhatsApp Number Modal */}
                {showAddNumberModal && selectedService && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Add WhatsApp Number
                                    </h2>
                                    <button
                                        onClick={() => setShowAddNumberModal(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>

                                <form onSubmit={handleAddWhatsAppNumber} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Number *
                                        </label>
                                        <input
                                            type="text"
                                            name="number"
                                            value={addNumberForm.number}
                                            onChange={handleAddNumberFormChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={addNumberForm.name}
                                            onChange={handleAddNumberFormChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Working Hours
                                        </label>
                                        <input
                                            type="text"
                                            name="workingHours"
                                            value={addNumberForm.workingHours}
                                            onChange={handleAddNumberFormChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddNumberModal(false)}
                                            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                        >
                                            <FaPlus />
                                            Add Number
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
} 