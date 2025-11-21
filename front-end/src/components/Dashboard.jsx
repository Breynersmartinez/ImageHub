import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Download, Trash2, Edit2, LogOut, Menu, X, ChevronLeft, ChevronRight, Loader } from 'lucide-react';

const Dashboard = ({ navigateTo, logout }) => {
    const [images, setImages] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showTransformModal, setShowTransformModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [transformData, setTransformData] = useState({
        type: 'resize',
        resize: { width: 300, height: 300 },
        crop: { x: 0, y: 0, width: 100, height: 100 },
        rotate: 45,
        filters: { grayscale: false, sepia: false },
        format: 'png'
    });
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const name = localStorage.getItem('userName');
        const email = localStorage.getItem('email');
        const role = localStorage.getItem('role');
        setUser({ name, email, role });
    }, []);

    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL;

    const loadImages = useCallback(async (page = 0) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(
                `${apiUrl}/api/v1/images/user/all?page=${page}&size=10`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Error al cargar las imágenes');
            }

            const data = await response.json();
            setImages(data.data?.content || []);
            setTotalPages(data.data?.totalPages || 0);
            setCurrentPage(page);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token, apiUrl]);

    useEffect(() => {
        loadImages(0);
    }, [loadImages]);

    const handleUpload = async () => {
        if (!uploadFile) {
            setError('Por favor selecciona un archivo');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', uploadFile);

            const response = await fetch(`${apiUrl}/api/v1/images/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Error al subir la imagen');
            }

            setSuccess('Imagen subida exitosamente');
            setUploadFile(null);
            setShowUploadModal(false);
            loadImages(0);

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTransform = async (autoDownload = false) => {
        if (!selectedImage) {
            setError('Selecciona una imagen');
            return;
        }

        setLoading(true);
        setError('');

        try {
            let transformBody = {};

            if (transformData.type === 'resize') {
                transformBody = { resize: transformData.resize };
            } else if (transformData.type === 'crop') {
                transformBody = { crop: transformData.crop };
            } else if (transformData.type === 'rotate') {
                transformBody = { rotate: transformData.rotate };
            } else if (transformData.type === 'filters') {
                transformBody = { filters: transformData.filters };
            } else if (transformData.type === 'format') {
                transformBody = { format: transformData.format };
            }

            const response = await fetch(
                `${apiUrl}/api/v1/images/${selectedImage.id}/transform`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(transformBody)
                }
            );

            if (!response.ok) {
                throw new Error('Error al transformar la imagen');
            }

            setSuccess('Imagen transformada exitosamente');

            if (autoDownload) {
                setTimeout(() => {
                    handleDownload(selectedImage.id, 'transform');
                }, 500);
            }

            setShowTransformModal(false);
            loadImages(currentPage);

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (imageId, type = 'input') => {
        try {
            const response = await fetch(
                `${apiUrl}/api/v1/images/${imageId}/download?type=${type}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Error al descargar');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `image_${type}_${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (imageId) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta imagen?')) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${apiUrl}/api/v1/images/${imageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al eliminar la imagen');
            }

            setSuccess('Imagen eliminada exitosamente');
            loadImages(currentPage);

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('name');
        localStorage.removeItem('role');
        if (logout) logout();
        if (navigateTo) navigateTo('login');
    };

    return (
        <div className="flex h-screen bg-slate-900">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-black text-white transition-all duration-300 flex flex-col border-r border-gray-600`}>
                <div className="p-4 border-b border-gray-600 flex items-center justify-between">
                    {sidebarOpen && <h1 className="text-xl font-bold">ImageHub</h1>}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-1 hover:bg-gray-800 rounded transition"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <div className="flex-1 p-4 space-y-4">
                    {user && sidebarOpen && (
                        <div className="bg-gray-800 p-3 rounded-lg border border-gray-600">
                            <p className="text-sm text-gray-400">Usuario</p>
                            <p className="font-semibold truncate text-white">{user.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            {user.role === 'ADMIN' && (
                                <span className="inline-block mt-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                    Admin
                                </span>
                            )}
                        </div>
                    )}

                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                    >
                        <Upload size={20} />
                        {sidebarOpen && 'Subir Imagen'}
                    </button>

                    <div className="pt-4 border-t border-gray-600 space-y-2">
                        {sidebarOpen && <p className="text-xs text-gray-400 uppercase font-semibold">Opciones</p>}
                        <button
                            onClick={handleLogout}
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                        >
                            <LogOut size={20} />
                            {sidebarOpen && 'Cerrar Sesión'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-gray-800 border-b border-gray-600 px-8 py-4 shadow-sm">
                    <h2 className="text-2xl font-bold text-white">Mis Imágenes</h2>
                    <p className="text-gray-400 text-sm">Gestiona y transforma tus imágenes</p>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-8">
                    {error && (
                        <div className="mb-4 p-4 bg-red-900 border border-red-600 text-red-200 rounded-lg flex items-start gap-2">
                            <span className="font-bold">✕</span>
                            <div>
                                <p className="font-semibold">Error</p>
                                <p>{error}</p>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-4 bg-green-900 border border-green-600 text-green-200 rounded-lg flex items-start gap-2">
                            <span className="font-bold">✓</span>
                            <div>
                                <p className="font-semibold">Éxito</p>
                                <p>{success}</p>
                            </div>
                        </div>
                    )}

                    {loading && images.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <Loader size={40} className="animate-spin mx-auto mb-4 text-blue-600" />
                                <p className="text-gray-400">Cargando imágenes...</p>
                            </div>
                        </div>
                    ) : images.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <Upload size={64} className="text-gray-600 mb-4" />
                            <p className="text-gray-400 text-lg mb-4">No tienes imágenes aún</p>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition"
                            >
                                Sube tu primera imagen
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Image Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {images.map((img) => (
                                    <div
                                        key={img.id}
                                        className="bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition transform hover:scale-105 border border-gray-600"
                                    >
                                        <div className="bg-gradient-to-br from-slate-700 to-slate-800 h-48 flex items-center justify-center">
                                            <div className="text-center">
                                                <Upload size={48} className="mx-auto text-gray-500 mb-2" />
                                                <p className="text-sm text-gray-400">{img.imageName}</p>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <h3 className="font-semibold text-white truncate mb-2">
                                                {img.imageName}
                                            </h3>
                                            <p className="text-xs text-gray-400 mb-3">
                                                {new Date(img.registrationDate).toLocaleDateString()}
                                            </p>

                                            {img.hasTransformation && (
                                                <div className="mb-3 bg-blue-900 border border-blue-600 rounded px-2 py-1">
                                                    <p className="text-xs text-blue-200 font-semibold">
                                                        ✓ Transformación disponible
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex gap-2 flex-wrap">
                                                <button
                                                    onClick={() => handleDownload(img.id, 'input')}
                                                    className="flex-1 min-w-24 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm flex items-center justify-center gap-1 transition"
                                                    title="Descargar original"
                                                >
                                                    <Download size={16} />
                                                    Original
                                                </button>

                                                {img.hasTransformation && (
                                                    <button
                                                        onClick={() => handleDownload(img.id, 'transform')}
                                                        className="flex-1 min-w-24 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded text-sm flex items-center justify-center gap-1 transition"
                                                        title="Descargar transformada"
                                                    >
                                                        <Download size={16} />
                                                        Trans
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => {
                                                        setSelectedImage(img);
                                                        setShowTransformModal(true);
                                                    }}
                                                    className="flex-1 min-w-24 bg-amber-600 hover:bg-amber-700 text-white py-2 px-3 rounded text-sm flex items-center justify-center gap-1 transition"
                                                    title="Transformar"
                                                >
                                                    <Edit2 size={16} />
                                                    Editar
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(img.id)}
                                                    className="flex-1 min-w-24 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm flex items-center justify-center gap-1 transition"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                    Borrar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-8">
                                    <button
                                        onClick={() => loadImages(currentPage - 1)}
                                        disabled={currentPage === 0}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition border border-gray-600"
                                    >
                                        <ChevronLeft size={20} />
                                        Anterior
                                    </button>

                                    <div className="text-gray-300">
                                        Página {currentPage + 1} de {totalPages}
                                    </div>

                                    <button
                                        onClick={() => loadImages(currentPage + 1)}
                                        disabled={currentPage >= totalPages - 1}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition border border-gray-600"
                                    >
                                        Siguiente
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4 p-6 border border-gray-600">
                        <h3 className="text-lg font-bold text-white mb-4">Subir Nueva Imagen</h3>

                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition">
                                <input
                                    type="file"
                                    id="file-input"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => setUploadFile(e.target.files[0])}
                                />
                                <label htmlFor="file-input" className="cursor-pointer block">
                                    <Upload size={32} className="mx-auto mb-2 text-gray-500" />
                                    <p className="text-gray-400">
                                        {uploadFile ? uploadFile.name : 'Selecciona una imagen o arrastra aquí'}
                                    </p>
                                </label>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleUpload}
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg font-semibold transition"
                                >
                                    {loading ? 'Subiendo...' : 'Subir'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        setUploadFile(null);
                                    }}
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 rounded-lg font-semibold transition"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Transform Modal */}
            {showTransformModal && selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4 p-6 my-8 border border-gray-600">
                        <h3 className="text-lg font-bold text-white mb-4">Transformar: {selectedImage.imageName}</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-white mb-2">Tipo de Transformación</label>
                                <select
                                    value={transformData.type}
                                    onChange={(e) => setTransformData({ ...transformData, type: e.target.value })}
                                    className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-white"
                                >
                                    <option value="resize">Redimensionar</option>
                                    <option value="crop">Recortar</option>
                                    <option value="rotate">Rotar</option>
                                    <option value="filters">Filtros</option>
                                    <option value="format">Cambiar Formato</option>
                                </select>
                            </div>

                            {transformData.type === 'resize' && (
                                <div className="space-y-3 bg-gray-700 p-3 rounded border border-gray-600">
                                    <div>
                                        <label className="block text-sm font-semibold text-white mb-1">Ancho</label>
                                        <input
                                            type="number"
                                            value={transformData.resize.width}
                                            onChange={(e) => setTransformData({
                                                ...transformData,
                                                resize: { ...transformData.resize, width: parseInt(e.target.value) }
                                            })}
                                            className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-600 text-white"
                                            min="10"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-white mb-1">Alto</label>
                                        <input
                                            type="number"
                                            value={transformData.resize.height}
                                            onChange={(e) => setTransformData({
                                                ...transformData,
                                                resize: { ...transformData.resize, height: parseInt(e.target.value) }
                                            })}
                                            className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-600 text-white"
                                            min="10"
                                        />
                                    </div>
                                </div>
                            )}

                            {transformData.type === 'crop' && (
                                <div className="space-y-3 bg-gray-700 p-3 rounded border border-gray-600 text-sm">
                                    <div>
                                        <label className="block font-semibold text-white mb-1">X</label>
                                        <input type="number" value={transformData.crop.x} onChange={(e) => setTransformData({ ...transformData, crop: { ...transformData.crop, x: parseInt(e.target.value) } })} className="w-full border border-gray-600 rounded px-2 py-1 bg-gray-600 text-white" />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-white mb-1">Y</label>
                                        <input type="number" value={transformData.crop.y} onChange={(e) => setTransformData({ ...transformData, crop: { ...transformData.crop, y: parseInt(e.target.value) } })} className="w-full border border-gray-600 rounded px-2 py-1 bg-gray-600 text-white" />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-white mb-1">Ancho</label>
                                        <input type="number" value={transformData.crop.width} onChange={(e) => setTransformData({ ...transformData, crop: { ...transformData.crop, width: parseInt(e.target.value) } })} className="w-full border border-gray-600 rounded px-2 py-1 bg-gray-600 text-white" min="10" />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-white mb-1">Alto</label>
                                        <input type="number" value={transformData.crop.height} onChange={(e) => setTransformData({ ...transformData, crop: { ...transformData.crop, height: parseInt(e.target.value) } })} className="w-full border border-gray-600 rounded px-2 py-1 bg-gray-600 text-white" min="10" />
                                    </div>
                                </div>
                            )}

                            {transformData.type === 'rotate' && (
                                <div className="bg-gray-700 p-3 rounded border border-gray-600">
                                    <label className="block text-sm font-semibold text-white mb-1">Grados</label>
                                    <input
                                        type="number"
                                        value={transformData.rotate}
                                        onChange={(e) => setTransformData({ ...transformData, rotate: parseInt(e.target.value) })}
                                        className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-600 text-white"
                                    />
                                </div>
                            )}

                            {transformData.type === 'filters' && (
                                <div className="space-y-3 bg-gray-700 p-3 rounded border border-gray-600">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={transformData.filters.grayscale}
                                            onChange={(e) => setTransformData({
                                                ...transformData,
                                                filters: { ...transformData.filters, grayscale: e.target.checked }
                                            })}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm font-semibold text-white">Escala de Grises</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={transformData.filters.sepia}
                                            onChange={(e) => setTransformData({
                                                ...transformData,
                                                filters: { ...transformData.filters, sepia: e.target.checked }
                                            })}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm font-semibold text-white">Sepia</span>
                                    </label>
                                </div>
                            )}

                            {transformData.type === 'format' && (
                                <div className="bg-gray-700 p-3 rounded border border-gray-600">
                                    <label className="block text-sm font-semibold text-white mb-2">Formato</label>
                                    <select
                                        value={transformData.format}
                                        onChange={(e) => setTransformData({ ...transformData, format: e.target.value })}
                                        className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-gray-600 text-white"
                                    >
                                        <option value="png">PNG</option>
                                        <option value="jpg">JPG</option>
                                        <option value="jpeg">JPEG</option>
                                        <option value="gif">GIF</option>
                                        <option value="bmp">BMP</option>
                                        <option value="webp">WebP</option>
                                    </select>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => handleTransform(false)}
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg font-semibold transition"
                                >
                                    {loading ? 'Transformando...' : 'Transformar'}
                                </button>
                                <button
                                    onClick={() => handleTransform(true)}
                                    disabled={loading}
                                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center gap-1"
                                    title="Transforma y descarga automáticamente"
                                >
                                    <Download size={16} />
                                    {loading ? 'Desc...' : 'T & D'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowTransformModal(false);
                                        setSelectedImage(null);
                                    }}
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 rounded-lg font-semibold transition"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;