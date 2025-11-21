class AuthService {
    static login(token, email, name, role) {
        localStorage.setItem('token', token);
        localStorage.setItem('email', email);
        localStorage.setItem('name', name);
        localStorage.setItem('role', role);
    }

    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('name');
        localStorage.removeItem('role');
    }

    static isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    static getToken() {
        return localStorage.getItem('token');
    }

    static getRole() {
        return localStorage.getItem('role');
    }

    static isAdmin() {
        return this.getRole() === 'ADMIN';
    }

    static isUser() {
        return this.getRole() === 'USER';
    }

    static getAuthHeaders() {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    static handleResponseError(response, navigate) {
        if (response.status === 401 || response.status === 403) {
            this.logout();
            navigate('/login');
            return true;
        }
        return false;
    }
}

export default AuthService;