import React, { useState, useEffect } from 'react';
import { LogOut, Upload, Download, Edit3, Trash2, Loader, Plus, X, Check } from 'lucide-react';

function Dashboard({ navigateTo }) {
    const [user, setUser] = useState(null);
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [isUploading, setIsUploading] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);

    const [selectedImage, setSelectedImage] = useState(null);
    const [showTransformModal, setShowTransformModal] = useState(false);
    const [isTransforming, setIsTransforming] = useState(false);
    const [transformType, setTransformType] = useState('resize');
    const [transformParams, setTransformParams] = useState({
        width: 200,
        height: 200,
        x: 0,
        y: 0,
        cropWidth: 300,
        cropHeight: 300,
        rotation: 45,
        format: 'png'
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('email');
        const name = localStorage.getItem('name');
        const role = localStorage.getItem('role');

        if (!token || role !== 'USER') {
            navigateTo('login');
            return;
        }

        setUser({ email, name, token });
        fetchImages(token);
    }, []);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const getToken = () => localStorage.getItem('token');

    const fetchImages = async (token) => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/images/user/all?page=0&size=50`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Images response:', data);
                // El API devuelve { success, message, data: { content, totalElements, totalPages } }
                setImages(data.data?.content || []);
            } else if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                localStorage.removeItem('email');
                localStorage.removeItem('name');
                localStorage.removeItem('role');
                navigateTo('login');
            } else if (response.status === 404) {
                setImages([]);
            } else {
                setError('Error al cargar las imágenes');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error de conexión al servidor');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const validFormats = ['image/png', 'image/jpeg', 'image/gif', 'image/bmp'];
            if (!validFormats.includes(file.type)) {
                setError('Formato de imagen no válido. Use PNG, JPG, GIF o BMP');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setError('El archivo excede el tamaño máximo de 10MB');
                return;
            }
            setUploadFile(file);
            setError('');
        }
    };

    const handleUploadSubmit = async () => {
        if (!uploadFile) {
            setError('Por favor selecciona una imagen');
            return;
        }

        setIsUploading(true);
        setError('');
        const formData = new FormData();
        formData.append('file', uploadFile);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/images/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                },
                body: formData,
            });

            if (response.ok) {
                setSuccessMessage('Imagen subida correctamente');
                setUploadFile(null);
                // Limpiar input file
                const fileInput = document.getElementById('fileInput');
                if (fileInput) fileInput.value = '';
                fetchImages(getToken());
                setTimeout(() => setSuccessMessage(''), 3000);
            } else if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                navigateTo('login');
            } else {
                const data = await response.json();
                setError(data.message || 'Error al subir la imagen');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error de conexión al servidor');
        } finally {
            setIsUploading(false);
        }
    };

    const handleTransform = async () => {
        if (!selectedImage) return;

        setIsTransforming(true);
        setError('');

        let transformBody = {};

        if (transformType === 'resize') {
            transformBody = {
                resize: {
                    width: parseInt(transformParams.width),
                    height: parseInt(transformParams.height)
                }
            };
        } else if (transformType === 'crop') {
            transformBody = {
                crop: {
                    x: parseInt(transformParams.x),
                    y: parseInt(transformParams.y),
                    width: parseInt(transformParams.cropWidth),
                    height: parseInt(transformParams.cropHeight)
                }
            };
        } else if (transformType === 'rotate') {
            transformBody = {
                rotate: parseInt(transformParams.rotation)
            };
        } else if (transformType === 'grayscale') {
            transformBody = {
                filters: {
                    grayscale: true
                }
            };
        } else if (transformType === 'sepia') {
            transformBody = {
                filters: {
                    sepia: true
                }
            };
        } else if (transformType === 'format') {
            transformBody = {
                format: transformParams.format
            };
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/images/${selectedImage.id}/transform`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(transformBody),
            });

            if (response.ok) {
                const data = await response.json();
                setSuccessMessage('Transformación aplicada correctamente');
                fetchImages(getToken());
                setShowTransformModal(false);
                setTimeout(() => setSuccessMessage(''), 3000);
            } else if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                navigateTo('login');
            } else {
                const data = await response.json();
                setError(data.message || 'Error al transformar la imagen');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error de conexión al servidor');
        } finally {
            setIsTransforming(false);
        }
    };

    const handleDownload = async (image, type = 'input') => {
        try {
            // Determinar la ruta según el tipo de descarga
            let downloadPath = type === 'transform' ? image.transformPath : image.inputPath;

            if (!downloadPath) {
                setError(`No hay versión ${type === 'transform' ? 'transformada' : 'original'} disponible`);
                return;
            }

            // Obtener el nombre del archivo original
            const fileName = type === 'transform'
                ? image.imageName.replace(/\.[^/.]+$/, '_transform.' + (image.imageName.split('.').pop() || 'png'))
                : image.imageName;

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/v1/images/${image.id}/download?type=${type}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${getToken()}`
                    }
                }
            );

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                setSuccessMessage(`Imagen ${type === 'transform' ? 'transformada' : 'original'} descargada correctamente`);
                setTimeout(() => setSuccessMessage(''), 3000);
            } else if (response.status === 404) {
                setError(`La imagen ${type === 'transform' ? 'transformada' : 'original'} no se encontró`);
            } else {
                setError('Error al descargar la imagen');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error de conexión al descargar la imagen');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('name');
        localStorage.removeItem('role');
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
                        <h1 className="text-2xl font-bold text-white">ImageHub</h1>
                        <p className="text-gray-400 text-sm">Bienvenido, {user?.name || user?.email}</p>
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
                        <div className="bg-red-900 border-l-4 border-red-500 text-red-100 p-4 rounded mb-6 flex justify-between items-center">
                            <p className="text-sm">{error}</p>
                            <button onClick={() => setError('')} className="text-red-100 hover:text-red-200">
                                <X size={18} />
                            </button>
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-green-900 border-l-4 border-green-500 text-green-100 p-4 rounded mb-6 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Check size={18} />
                                <p className="text-sm">{successMessage}</p>
                            </div>
                            <button onClick={() => setSuccessMessage('')} className="text-green-100 hover:text-green-200">
                                <X size={18} />
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Panel de Upload */}
                        <div className="bg-black rounded-lg border border-gray-700 shadow-lg p-6 h-fit">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Upload size={20} />
                                Subir Imagen
                            </h2>
                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleUploadChange}
                                        className="hidden"
                                        id="fileInput"
                                    />
                                    <label htmlFor="fileInput" className="cursor-pointer block">
                                        <Plus size={32} className="mx-auto text-gray-400 mb-2" />
                                        <p className="text-gray-300 text-sm">
                                            {uploadFile ? uploadFile.name : 'Haz clic para seleccionar'}
                                        </p>
                                        <p className="text-gray-500 text-xs mt-1">
                                            PNG, JPG, GIF, BMP (máx 10MB)
                                        </p>
                                    </label>
                                </div>
                                <button
                                    onClick={handleUploadSubmit}
                                    disabled={!uploadFile || isUploading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader size={18} className="animate-spin" />
                                            Subiendo...
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={18} />
                                            Subir
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Galería de Imágenes */}
                        <div className="lg:col-span-3 bg-black rounded-lg border border-gray-700 shadow-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-700">
                                <h2 className="text-xl font-bold text-white">Mis Imágenes ({images.length})</h2>
                            </div>

                            {images.length === 0 ? (
                                <div className="px-6 py-12 text-center">
                                    <p className="text-gray-400">No tienes imágenes subidas aún</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                                    {images.map((image) => (
                                        <div key={image.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition flex flex-col">
                                            <div className="aspect-square bg-gray-900 flex items-center justify-center overflow-hidden">
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL}${image.inputPath}`}
                                                    alt={image.imageName}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                                <div style={{ display: 'none' }} className="w-full h-full bg-gray-700 flex items-center justify-center">
                                                    <p className="text-gray-400">No preview</p>
                                                </div>
                                            </div>
                                            <div className="p-4 space-y-3 flex-1 flex flex-col">
                                                <div>
                                                    <p className="text-white font-medium text-sm truncate">{image.imageName}</p>
                                                    <p className="text-gray-400 text-xs">
                                                        {new Date(image.registrationDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2 text-xs">
                                                    {image.hasTransformation && (
                                                        <span className="bg-green-900 text-green-200 px-2 py-1 rounded">
                                                            ✓ Transformada
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 flex-col">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleDownload(image, 'input')}
                                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 rounded text-sm flex items-center justify-center gap-1 transition"
                                                            title="Descargar original"
                                                        >
                                                            <Download size={14} />
                                                            Original
                                                        </button>
                                                        {image.hasTransformation && (
                                                            <button
                                                                onClick={() => handleDownload(image, 'transform')}
                                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 rounded text-sm flex items-center justify-center gap-1 transition"
                                                                title="Descargar transformada"
                                                            >
                                                                <Download size={14} />
                                                                Trans.
                                                            </button>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedImage(image);
                                                            setShowTransformModal(true);
                                                        }}
                                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-1 rounded text-sm flex items-center justify-center gap-1 transition"
                                                    >
                                                        <Edit3 size={14} />
                                                        Editar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Transformación */}
            {showTransformModal && selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-black rounded-lg border border-gray-700 shadow-lg max-w-md w-full max-h-96 overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Transformar Imagen</h3>
                            <button onClick={() => setShowTransformModal(false)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-6 py-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Transformación</label>
                                <select
                                    value={transformType}
                                    onChange={(e) => setTransformType(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                                >
                                    <option value="resize">Redimensionar</option>
                                    <option value="crop">Recortar</option>
                                    <option value="rotate">Rotar</option>
                                    <option value="grayscale">Escala de Grises</option>
                                    <option value="sepia">Sepia</option>
                                    <option value="format">Convertir Formato</option>
                                </select>
                            </div>

                            {transformType === 'resize' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Ancho (px)</label>
                                        <input
                                            type="number"
                                            value={transformParams.width}
                                            onChange={(e) => setTransformParams({...transformParams, width: e.target.value})}
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Alto (px)</label>
                                        <input
                                            type="number"
                                            value={transformParams.height}
                                            onChange={(e) => setTransformParams({...transformParams, height: e.target.value})}
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                                        />
                                    </div>
                                </>
                            )}

                            {transformType === 'crop' && (
                                <>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">X</label>
                                            <input
                                                type="number"
                                                value={transformParams.x}
                                                onChange={(e) => setTransformParams({...transformParams, x: e.target.value})}
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Y</label>
                                            <input
                                                type="number"
                                                value={transformParams.y}
                                                onChange={(e) => setTransformParams({...transformParams, y: e.target.value})}
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Ancho</label>
                                            <input
                                                type="number"
                                                value={transformParams.cropWidth}
                                                onChange={(e) => setTransformParams({...transformParams, cropWidth: e.target.value})}
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Alto</label>
                                            <input
                                                type="number"
                                                value={transformParams.cropHeight}
                                                onChange={(e) => setTransformParams({...transformParams, cropHeight: e.target.value})}
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {transformType === 'rotate' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Grados</label>
                                    <input
                                        type="number"
                                        value={transformParams.rotation}
                                        onChange={(e) => setTransformParams({...transformParams, rotation: e.target.value})}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                                    />
                                </div>
                            )}

                            {transformType === 'format' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Nuevo Formato</label>
                                    <select
                                        value={transformParams.format}
                                        onChange={(e) => setTransformParams({...transformParams, format: e.target.value})}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                                    >
                                        <option value="jpg">JPG</option>
                                        <option value="png">PNG</option>
                                        <option value="gif">GIF</option>
                                        <option value="bmp">BMP</option>
                                        <option value="webp">WebP</option>
                                    </select>
                                </div>
                            )}

                            <div className="flex gap-2 pt-4 border-t border-gray-600">
                                <button
                                    onClick={handleTransform}
                                    disabled={isTransforming}
                                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 rounded font-medium transition flex items-center justify-center gap-2"
                                >
                                    {isTransforming ? (
                                        <>
                                            <Loader size={16} className="animate-spin" />
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <Edit3 size={16} />
                                            Aplicar
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowTransformModal(false)}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded font-medium transition"
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
}

export default Dashboard;