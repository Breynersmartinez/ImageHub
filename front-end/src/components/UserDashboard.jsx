import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Edit2, Trash2, Loader } from 'lucide-react';
import AuthService from '../services/AuthService';
import { useAuth } from '../context/AuthContext.js';

function UserDashboard({ navigateTo }) {
    const { user, logout } = useAuth();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [isEditingUser, setIsEditingUser] = useState(false);
    const [currentUser, setCurrentUser] = useState({
        idCard: '',
        identificationType: 'CC',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        direction: '',
        role: 'USER',
        active: true
    });

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
            [name]: type === 'checkbox' ? checked : (name === 'idCard' ? (value ? parseInt(value, 10) : '') : value)
        });
    };

    const resetForm = () => {
        setCurrentUser({
            idCard: '',
            identificationType: 'CC',
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            phoneNumber: '',
            direction: '',
            role: 'USER',
            active: true
        });
    };

    const handleAddUser = () => {
        setIsAddingUser(true);
        setIsEditingUser(false);
        resetForm();
    };

    const handleEditUser = (userData) => {
        setCurrentUser({
            idCard: userData.idCard,
            identificationType: userData.identificationType,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: '',
            phoneNumber: userData.phoneNumber,
            direction: userData.direction,
            role: userData.role,
            active: userData.active
        });
        setIsEditingUser(true);
        setIsAddingUser(false);
    };

    const handleDeleteUser = async (idCard) => {
        if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${idCard}`, {
                    method: 'DELETE',
                    headers: AuthService.getAuthHeaders(),
                });

                if (response.ok || response.status === 204) {
                    fetchUsers();
                    setError('');
                } else if (response.status === 401 || response.status === 403) {
                    logout();
                    navigateTo('login');
                } else {
                    setError('Error al eliminar el usuario');
                }
            } catch (error) {
                console.error('Error:', error);
                setError('Error de conexión al servidor');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser.idCard || !currentUser.firstName || !currentUser.lastName ||
            !currentUser.email || (!isEditingUser && !currentUser.password)) {
            setError('Todos los campos obligatorios deben ser completados');
            return;
        }

        try {
            let url, method, body;

            if (isEditingUser) {
                url = `${import.meta.env.VITE_API_URL}/api/users/${currentUser.idCard}`;
                method = 'PUT';
                body = { ...currentUser };
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
            } else if (response.status === 401 || response.status === 403) {
                logout();
                navigateTo('login');
            } else {
                const errorData = await response.json();
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
                        <h1 className="text-2xl font-bold text-white">AlphaBrein - Panel Admin</h1>
                        <p className="text-gray-400 text-sm">Bienvenido, {user?.name}</p>
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
                        <div className="bg-red-900 border-l-4 border-red-500 text-red-100 p-4 rounded mb-6">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Lista de usuarios */}
                        <div className="lg:col-span-2 bg-black rounded-lg border border-gray-700 shadow-lg">
                            <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">Gestión de Usuarios</h2>
                                <button
                                    onClick={handleAddUser}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                                >
                                    <Plus size={18} />
                                    Agregar Usuario
                                </button>
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
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Cédula</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Rol</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Estado</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Acciones</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700">
                                        {users.map((userData) => (
                                            <tr key={userData.idCard} className="hover:bg-gray-800 transition">
                                                <td className="px-6 py-4 text-sm text-gray-200">
                                                    {userData.firstName} {userData.lastName}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-200">{userData.email}</td>
                                                <td className="px-6 py-4 text-sm text-gray-200">{userData.idCard}</td>
                                                <td className="px-6 py-4 text-sm">
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-900 text-blue-200">
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
                                                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition"
                                                            title="Editar"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(userData.idCard)}
                                                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition"
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
                                            <label className="block text-xs font-medium text-gray-300 mb-1">Tipo ID</label>
                                            <select
                                                name="identificationType"
                                                value={currentUser.identificationType}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                                            >
                                                <option value="TI">TI</option>
                                                <option value="CC">CC</option>
                                                <option value="NUIP">NUIP</option>
                                                <option value="CE">CE</option>
                                                <option value="P">Pasaporte</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1">Cédula</label>
                                            <input
                                                type="number"
                                                name="idCard"
                                                value={currentUser.idCard}
                                                onChange={handleInputChange}
                                                disabled={isEditingUser}
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm disabled:opacity-50"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1">Nombre</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={currentUser.firstName}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1">Apellido</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={currentUser.lastName}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={currentUser.email}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">
                                            {isEditingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={currentUser.password}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                                            required={!isEditingUser}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">Teléfono</label>
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={currentUser.phoneNumber}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">Dirección</label>
                                        <input
                                            type="text"
                                            name="direction"
                                            value={currentUser.direction}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">Rol</label>
                                        <select
                                            name="role"
                                            value={currentUser.role}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                                        >
                                            <option value="USER">Usuario</option>
                                            <option value="ADMIN">Administrador</option>
                                            <option value="OPERATOR">Operador</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="active"
                                            checked={currentUser.active}
                                            onChange={handleInputChange}
                                            className="w-4 h-4"
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
                                            onClick={() => {
                                                setIsAddingUser(false);
                                                setIsEditingUser(false);
                                                resetForm();
                                            }}
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