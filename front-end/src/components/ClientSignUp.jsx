import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import logo from "../assets/bm.png";

function ClientSignUp({ navigateTo }) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        direction: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const validateForm = () => {
        if (!formData.firstName?.trim()) return 'El nombre es requerido';
        if (!formData.lastName?.trim()) return 'El apellido es requerido';
        if (!formData.email?.trim()) return 'El email es requerido';
        if (!formData.email.includes('@')) return 'El email no es válido';
        if (!formData.password) return 'La contraseña es requerida';
        if (formData.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
        if (formData.password !== formData.confirmPassword) return 'Las contraseñas no coinciden';
        if (!formData.phoneNumber?.trim()) return 'El teléfono es requerido';
        if (!formData.direction?.trim()) return 'La dirección es requerida';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);

        const registrationData = {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim(),
            password: formData.password,
            phoneNumber: formData.phoneNumber.trim(),
            direction: formData.direction.trim(),
            role: "USER"
        };

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registrationData),
            });

            const data = await response.json();

            if (response.ok && data.token) {
                setSuccess('Registro exitoso. Redirigiendo al inicio de sesión...');
                setTimeout(() => {
                    navigateTo('login');
                }, 2000);
            } else {
                setError(data.message || "Error al registrar. Por favor, inténtelo de nuevo.");
            }
        } catch (error) {
            console.error("Error al registrar:", error);
            setError("Error de conexión con el servidor. Por favor, inténtelo más tarde.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoHome = () => {
        navigateTo('home');
    };

    const handleGoLogin = () => {
        navigateTo('login');
    };

    return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-slate-900 overflow-y-auto py-12">
            <div className="w-full max-w-md space-y-8 bg-black p-8 rounded-lg shadow-lg border border-gray-700">
                <div className="flex flex-col items-center">
                    <img className="h-20 w-auto mb-4" src={logo} alt="AlphaBrein Logo" />
                    <h2 className="text-center text-2xl font-bold text-white">
                        Crear Cuenta
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Regístrate para acceder a nuestros servicios
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Nombre */}
                        <div>
                            <label htmlFor="firstName" className="block text-xs font-medium text-gray-300 mb-1">
                                Nombre *
                            </label>
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                required
                                value={formData.firstName}
                                onChange={handleChange}
                                disabled={isLoading}
                                placeholder="Ej: Juan"
                                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition"
                            />
                        </div>

                        {/* Apellido */}
                        <div>
                            <label htmlFor="lastName" className="block text-xs font-medium text-gray-300 mb-1">
                                Apellido *
                            </label>
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                required
                                value={formData.lastName}
                                onChange={handleChange}
                                disabled={isLoading}
                                placeholder="Ej: Pérez"
                                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-xs font-medium text-gray-300 mb-1">
                                Correo Electrónico *
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                disabled={isLoading}
                                placeholder="usuario@ejemplo.com"
                                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition"
                            />
                        </div>

                        {/* Contraseña */}
                        <div>
                            <label htmlFor="password" className="block text-xs font-medium text-gray-300 mb-1">
                                Contraseña *
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength="6"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={isLoading}
                                placeholder="Mínimo 6 caracteres"
                                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition"
                            />
                        </div>

                        {/* Confirmar Contraseña */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-300 mb-1">
                                Confirmar Contraseña *
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                minLength="6"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={isLoading}
                                placeholder="Confirme su contraseña"
                                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition"
                            />
                        </div>

                        {/* Teléfono */}
                        <div>
                            <label htmlFor="phoneNumber" className="block text-xs font-medium text-gray-300 mb-1">
                                Número de Teléfono *
                            </label>
                            <input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                required
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                disabled={isLoading}
                                placeholder="Ej: +57 1234567890"
                                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition"
                            />
                        </div>

                        {/* Dirección */}
                        <div>
                            <label htmlFor="direction" className="block text-xs font-medium text-gray-300 mb-1">
                                Dirección *
                            </label>
                            <input
                                id="direction"
                                name="direction"
                                type="text"
                                required
                                value={formData.direction}
                                onChange={handleChange}
                                disabled={isLoading}
                                placeholder="Ej: Calle 123 # 45-67"
                                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-900 border-l-4 border-red-500 text-red-100 p-4 rounded-md flex items-center gap-2">
                            <AlertCircle size={18} className="flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-900 border-l-4 border-green-500 text-green-100 p-4 rounded-md flex items-center gap-2">
                            <CheckCircle size={18} className="flex-shrink-0" />
                            <p className="text-sm">{success}</p>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-2 px-4 text-sm font-medium rounded-md text-white flex items-center justify-center gap-2 transition ${
                                isLoading
                                    ? 'bg-blue-500 cursor-not-allowed opacity-75'
                                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            }`}
                        >
                            {isLoading && <Loader size={16} className="animate-spin" />}
                            {isLoading ? 'Registrando...' : 'Registrarse'}
                        </button>
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                        <button
                            onClick={handleGoLogin}
                            className="text-blue-400 hover:text-blue-300 text-sm transition"
                            type="button"
                        >
                            ¿Ya tienes cuenta? Iniciar sesión
                        </button>

                        <button
                            onClick={handleGoHome}
                            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition text-sm"
                            type="button"
                        >
                            Volver a inicio
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ClientSignUp;