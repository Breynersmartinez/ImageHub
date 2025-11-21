import React, { useState } from 'react';
import { ArrowRight, Upload, Settings, Lock, Users } from 'lucide-react';

export default function LandingPage({ navigateTo }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const features = [
        {
            icon: <Upload className="w-6 h-6" />,
            title: "Carga Simple",
            description: "Sube tus imágenes de forma segura en múltiples formatos."
        },
        {
            icon: <Settings className="w-6 h-6" />,
            title: "Transformaciones",
            description: "Redimensiona, rota, recorta y aplica filtros profesionales."
        },
        {
            icon: <Lock className="w-6 h-6" />,
            title: "Seguridad",
            description: "Protección de nivel empresarial para tus archivos."
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: "Gestión",
            description: "Administra usuarios y permisos con facilidad."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Navigation */}
            <nav className="border-b border-gray-700 bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                                <span className="text-white font-bold text-sm">IH</span>
                            </div>
                            <span className="text-xl font-semibold text-white">ImageHub</span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-6">
                            <a href="#features" className="text-gray-300 hover:text-white transition">Características</a>
                            <button
                                onClick={() => navigateTo('login')}
                                className="text-gray-300 hover:text-white transition"
                            >
                                Inicia Sesión
                            </button>
                            <button
                                onClick={() => navigateTo('signup')}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                            >
                                Registrarse
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden text-gray-300"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {isMenuOpen && (
                        <div className="md:hidden pb-4 space-y-2 border-t border-gray-700">
                            <a href="#features" className="block px-4 py-2 text-gray-300 hover:text-white">Características</a>
                            <button
                                onClick={() => navigateTo('login')}
                                className="block w-full text-left px-4 py-2 text-gray-300 hover:text-white"
                            >
                                Inicia Sesión
                            </button>
                            <button
                                onClick={() => navigateTo('signup')}
                                className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg mt-2"
                            >
                                Registrarse
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                            Gestiona tus imágenes profesionalmente
                        </h1>
                        <p className="text-xl text-gray-300">
                            ImageHub te proporciona las herramientas necesarias para editar, transformar y administrar tus imágenes con eficiencia.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                onClick={() => navigateTo('signup')}
                                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
                            >
                                Comenzar <ArrowRight size={18} />
                            </button>
                            <button
                                onClick={() => navigateTo('login')}
                                className="px-8 py-3 border-2 border-gray-600 text-white rounded-lg hover:border-gray-500 transition font-semibold"
                            >
                                Inicia Sesión
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl h-96 flex items-center justify-center border border-gray-700">
                        <div className="text-center">
                            <div className="w-24 h-24 bg-blue-900 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <Upload className="w-12 h-12 text-blue-400" />
                            </div>
                            <p className="text-gray-300">Carga y transforma tus imágenes</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="bg-black/30 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">Características Principales</h2>
                        <p className="text-lg text-gray-400">
                            Todo lo que necesitas para gestionar tus imágenes
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-gray-800 p-8 rounded-lg border border-gray-700 hover:border-blue-600 transition hover:shadow-lg hover:shadow-blue-600/10">
                                <div className="text-blue-400 mb-4">{feature.icon}</div>
                                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                <p className="text-gray-400">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Info Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="bg-gray-800 rounded-xl h-96 flex items-center justify-center border border-gray-700">
                        <div className="text-center">
                            <div className="w-24 h-24 bg-blue-900 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <Settings className="w-12 h-12 text-blue-400" />
                            </div>
                            <p className="text-gray-300">Herramientas avanzadas</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-4xl font-bold text-white">Transformaciones Potentes</h2>
                        <ul className="space-y-4">
                            {[
                                "Redimensiona tus imágenes",
                                "Recorta áreas específicas",
                                "Rota y voltea imágenes",
                                "Aplica filtros profesionales",
                                "Cambia formatos de archivo",
                                "Convierte a escala de grises o sepia"
                            ].map((item, index) => (
                                <li key={index} className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                    <span className="text-gray-300">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-blue-600 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-white mb-4">¿Listo para comenzar?</h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Regístrate hoy y accede a todas nuestras herramientas de transformación de imágenes
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigateTo('signup')}
                            className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-semibold"
                        >
                            Registrarse Gratis
                        </button>
                        <button
                            onClick={() => navigateTo('login')}
                            className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                        >
                            Tengo cuenta
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-700 py-12 bg-black/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">IH</span>
                                </div>
                                <span className="font-semibold text-white">ImageHub</span>
                            </div>
                            <p className="text-gray-400 text-sm">Plataforma de gestión de imágenes</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Producto</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#features" className="hover:text-white transition">Características</a></li>
                                <li><a href="#" className="hover:text-white transition">Documentación</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Empresa</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#" className="hover:text-white transition">Sobre nosotros</a></li>
                                <li><a href="#" className="hover:text-white transition">Contacto</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Legal</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#" className="hover:text-white transition">Privacidad</a></li>
                                <li><a href="#" className="hover:text-white transition">Términos</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
                        <p>&copy; 2025 ImageHub. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}