import React, { createContext, useState, useContext, useEffect } from 'react';
import AuthService from '../services/AuthService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Verificar autenticación al cargar la app
    useEffect(() => {
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('email');
        const name = localStorage.getItem('name');
        const role = localStorage.getItem('role');

        if (token && email && name && role) {
            setUser({
                email,
                name,
                role,
                token,
            });
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const login = (userData) => {
        const { token, email, name, role } = userData;
        AuthService.login(token, email, name, role);
        setUser({
            email,
            name,
            role,
            token,
        });
        setIsAuthenticated(true);
    };

    const logout = () => {
        AuthService.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    const value = {
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    return context;
};