const BASE_URL = '/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const handleResponse = async (res) => {
    if (res.status === 401) {
        localStorage.removeItem('token');
        if (window.location.pathname !== '/') {
             window.location.reload();
        }
        throw new Error('Invalid credentials or session expired.');
    }
    
    const text = await res.text();
    let data;
    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = { message: text };
    }

    if (!res.ok) {
        throw new Error(data.message || 'Request failed');
    }
    return data;
};

export const login = async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
};

export const register = async (email, password, role = 'USER') => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
    });
    return handleResponse(res);
};

export const getVehicles = async () => {
    const res = await fetch(`${BASE_URL}/vehicles`, { headers: getHeaders() });
    return handleResponse(res);
};

export const searchVehicles = async (make, category, minPrice, maxPrice) => {
    const params = new URLSearchParams();
    if (make) params.append('make', make);
    if (category) params.append('category', category);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${BASE_URL}/vehicles/search${query}`, { headers: getHeaders() });
    return handleResponse(res);
};

export const addVehicle = async (vehicle) => {
    const res = await fetch(`${BASE_URL}/vehicles`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(vehicle)
    });
    return handleResponse(res);
};

export const purchaseVehicle = async (id) => {
    const res = await fetch(`${BASE_URL}/vehicles/${id}/purchase`, {
        method: 'POST',
        headers: getHeaders()
    });
    return handleResponse(res);
};

export const restockVehicle = async (id, amount) => {
    const res = await fetch(`${BASE_URL}/vehicles/${id}/restock?amount=${amount}`, {
        method: 'POST',
        headers: getHeaders()
    });
    return handleResponse(res);
};
