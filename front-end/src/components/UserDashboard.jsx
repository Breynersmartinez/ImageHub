import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Edit2, Trash2, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import AuthService from '../services/AuthService';
import { useAuth } from '../context/AuthContext.jsx';

function UserDashboard({ navigateTo }) {
    const { user, logout } = useAuth();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [isEditingUser, setIsEditingUser] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [currentUser, setCurrentUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        direction: '',
        role: 'USER',
        active: true
    });

    // Verificar permisos de admin
    useEffect(() => {
        if (user?.role !== 'ADMIN') {
            navigateTo('dashboard');
        }
    }, [user, navigateTo]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
                method: 'GET',
                headers: AuthService.getAuthHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else if (response.status === 401 || response.status === 403) {
                logout();
                navigateTo('login');
            } else {
                setError('Error al cargar los usuarios');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error de conexión al servidor');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentUser({
            ...currentUser,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const resetForm = () => {
        setCurrentUser({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            phoneNumber: '',
            direction: '',
            role: 'USER',
            active: true
        });
        setEditingUserId(null);
    };

    const handleAddUser = () => {
        setIsAddingUser(true);
        setIsEditingUser(false);
        resetForm();
        setError('');
        setSuccess('');
    };

    const handleEditUser = (userData) => {
        setCurrentUser({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: '',
            phoneNumber: userData.phoneNumber,
            direction: userData.direction,
            role: userData.role,
            active: userData.active
        });
        setEditingUserId(userData.id);
        setIsEditingUser(true);
        setIsAddingUser(false);
        setError('');
        setSuccess('');
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userId}`, {
                    method: 'DELETE',
                    headers: AuthService.getAuthHeaders(),
                });

                if (response.ok || response.status === 204) {
                    fetchUsers();
                    setSuccess('Usuario eliminado correctamente');
                    setError('');
                    setTimeout(() => setSuccess(''), 3000);
                } else if (response.status === 401 || response.status === 403) {
                    logout();
                    navigateTo('login');
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    setError(errorData.message || 'Error al eliminar el usuario');
                }
            } catch (error) {
                console.error('Error:', error);
                setError('Error de conexión al servidor');
            }
        }
    };

    const validateForm = () => {
        if (!currentUser.firstName?.trim()) return 'El nombre es requerido';
        if (!currentUser.lastName?.trim()) return 'El apellido es requerido';
        if (!currentUser.email?.trim()) return 'El email es requerido';
        if (!currentUser.phoneNumber?.trim()) return 'El teléfono es requerido';
        if (!currentUser.direction?.trim()) return 'La dirección es requerida';
        if (!isEditingUser && !currentUser.password) return 'La contraseña es requerida para nuevos usuarios';
        if (currentUser.password && currentUser.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
        if (!currentUser.email.includes('@')) return 'El email no es válido';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            let url, method, body;

            if (isEditingUser) {
                url = `${import.meta.env.VITE_API_URL}/api/users/${editingUserId}`;
                method = 'PUT';
                body = { ...currentUser };
                // No enviar password vacía en ediciones
                if (!currentUser.password) {
                    delete body.password;
                }
            } else {
                url = `${import.meta.env.VITE_API_URL}/api/auth/register`;
                method = 'POST';
                body = { ...currentUser };
            }

            const response = await fetch(url, {
                method: method,
                headers: AuthService.getAuthHeaders(),
                body: JSON.stringify(body),
            });

            if (response.ok) {
                fetchUsers();
                resetForm();
                setIsAddingUser(false);
                setIsEditingUser(false);
                setError('');
                setSuccess(isEditingUser ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
                setTimeout(() => setSuccess(''), 3000);
            } else if (response.status === 401 || response.status === 403) {
                logout();
                navigateTo('login');
            } else {
                const errorData = await response.json().catch(() => ({}));
                setError(errorData.message || 'Error al guardar el usuario');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error de conexión al servidor');
        }
    };

    const handleLogout = () => {
        logout();
        navigateTo('login');
    };

    const handleCancel = () => {
        setIsAddingUser(false);
        setIsEditingUser(false);
        resetForm();
        setError('');
        setSuccess('');
    };

    if (isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
                <div className="text-center">
                    <Loader className="animate-spin text-blue-500 mx-auto mb-4" size={32} />
                    <p className="text-white text-lg">Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-slate-900 flex flex-col">
            {/* Header */}
            <div className="bg-black border-b border-gray-700 px-6 py-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white">ImageHub - Panel Admin</h1>
                        <p className="text-gray-400 text-sm">Bienvenido, {user?.firstName} {user?.lastName}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                    >
                        <LogOut size={18} />
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    {error && (
                        <div className="bg-red-900 border-l-4 border-red-500 text-red-100 p-4 rounded mb-6 flex items-center gap-2">
                            <AlertCircle size={18} />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-900 border-l-4 border-green-500 text-green-100 p-4 rounded mb-6 flex items-center gap-2">
                            <CheckCircle size={18} />
                            <p className="text-sm">{success}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Lista de usuarios */}
                        <div className="lg:col-span-2 bg-black rounded-lg border border-gray-700 shadow-lg">
                            <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Gestión de Usuarios</h2>
                                    <p className="text-gray-400 text-sm mt-1">Total: {users.length} usuarios</p>
                                </div>
                                {!isAddingUser && !isEditingUser && (
                                    <button
                                        onClick={handleAddUser}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                                    >
                                        <Plus size={18} />
                                        Agregar Usuario
                                    </button>
                                )}
                            </div>

                            <div className="overflow-x-auto">
                                {users.length === 0 ? (
                                    <div className="px-6 py-8 text-center text-gray-400">
                                        <p>No hay usuarios registrados</p>
                                    </div>
                                ) : (
                                    <table className="w-full">
                                        <thead className="bg-gray-800 border-b border-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Nombre</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Teléfono</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Rol</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Estado</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Acciones</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700">
                                        {users.map((userData) => (
                                            <tr key={userData.id} className="hover:bg-gray-800 transition">
                                                <td className="px-6 py-4 text-sm text-gray-200">
                                                    {userData.firstName} {userData.lastName}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-200">{userData.email}</td>
                                                <td className="px-6 py-4 text-sm text-gray-200">{userData.phoneNumber}</td>
                                                <td className="px-6 py-4 text-sm">
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                            userData.role === 'ADMIN'
                                                                ? 'bg-purple-900 text-purple-200'
                                                                : userData.role === 'OPERATOR'
                                                                    ? 'bg-orange-900 text-orange-200'
                                                                    : 'bg-blue-900 text-blue-200'
                                                        }`}>
                                                            {userData.role}
                                                        </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                            userData.active
                                                                ? 'bg-green-900 text-green-200'
                                                                : 'bg-red-900 text-red-200'
                                                        }`}>
                                                            {userData.active ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEditUser(userData)}
                                                            disabled={isEditingUser || isAddingUser}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Editar"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(userData.id)}
                                                            disabled={isEditingUser || isAddingUser}
                                                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        {/* Formulario */}
                        {(isAddingUser || isEditingUser) && (
                            <div className="bg-black rounded-lg border border-gray-700 shadow-lg h-fit sticky top-8">
                                <div className="px-6 py-4 border-b border-gray-700">
                                    <h2 className="text-xl font-bold text-white">
                                        {isEditingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                                    </h2>
                                </div>

                                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1">Nombre *</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={currentUser.firstName}
                                                onChange={handleInputChange}
                                                placeholder="Ej: Juan"
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1">Apellido *</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={currentUser.lastName}
                                                onChange={handleInputChange}
                                                placeholder="Ej: Pérez"
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={currentUser.email}
                                            onChange={handleInputChange}
                                            placeholder="usuario@example.com"
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                                            disabled={isEditingUser}
                                            required
                                        />
                                        {isEditingUser && <p className="text-xs text-gray-400 mt-1">El email no puede ser modificado</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">
                                            {isEditingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={currentUser.password}
                                            onChange={handleInputChange}
                                            placeholder={isEditingUser ? 'Dejar en blanco para no cambiar' : 'Mínimo 6 caracteres'}
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                                            required={!isEditingUser}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">Teléfono *</label>
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={currentUser.phoneNumber}
                                            onChange={handleInputChange}
                                            placeholder="Ej: +57 1234567890"
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">Dirección *</label>
                                        <input
                                            type="text"
                                            name="direction"
                                            value={currentUser.direction}
                                            onChange={handleInputChange}
                                            placeholder="Ej: Calle 123 # 45-67"
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">Rol *</label>
                                        <select
                                            name="role"
                                            value={currentUser.role}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                                        >
                                            <option value="USER">Usuario</option>
                                            <option value="OPERATOR">Operador</option>
                                            <option value="ADMIN">Administrador</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="active"
                                            checked={currentUser.active}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 rounded"
                                        />
                                        <label className="text-sm text-gray-300">Usuario Activo</label>
                                    </div>

                                    <div className="flex gap-2 pt-4 border-t border-gray-600">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm font-medium transition"
                                        >
                                            {isEditingUser ? 'Actualizar' : 'Guardar'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded text-sm font-medium transition"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserDashboard;