import axios from 'axios';

const API_BASE = window.location.hostname.includes('localhost') ? 'http://localhost:8000/api' : 'https://goec-api-service.gegdhxd6w9a9t.ap-south-1.cs.amazonlightsail.com/api';

export const submitContactForm = async (formData) => {
    try {
        const response = await axios.post(`${API_BASE}/leads`, formData);
        return { success: true, message: "Thank you! We will get back to you shortly." };
    } catch (error) {
        console.error("Form submission error:", error);
        
        // Simulating success if the python backend is not running locally
        if (window.location.hostname.includes('localhost')) {
            console.warn("Backend not running or failed. Simulating successful form submission for local testing.");
            return { success: true, message: "Thank you! We will get back to you shortly." };
        }
        
        return { success: false, message: "Something went wrong. Please try again." };
    }
};

// ===== LEADS API =====
export const getLeads = async (params = {}) => {
    const response = await axios.get(`${API_BASE}/leads`, { params });
    return response.data;
};

export const getLeadStats = async () => {
    const response = await axios.get(`${API_BASE}/leads/stats`);
    return response.data;
};

export const deleteLead = async (leadId) => {
    const response = await axios.delete(`${API_BASE}/leads/${leadId}`);
    return response.data;
};

export const exportLeads = async (params = {}) => {
    const format = params.format || 'csv';
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    queryParams.append('format', format);
    
    const url = `${API_BASE}/leads/export?${queryParams.toString()}`;
    window.open(url, '_blank');
};

// ===== PIXELS API =====
export const getPixels = async () => {
    const response = await axios.get(`${API_BASE}/pixels`);
    return response.data;
};

export const getActivePixels = async () => {
    const response = await axios.get(`${API_BASE}/pixels/active`);
    return response.data;
};

export const createPixel = async (pixelData) => {
    const response = await axios.post(`${API_BASE}/pixels`, pixelData);
    return response.data;
};

export const updatePixel = async (pixelId, pixelData) => {
    const response = await axios.put(`${API_BASE}/pixels/${pixelId}`, pixelData);
    return response.data;
};

export const deletePixel = async (pixelId) => {
    const response = await axios.delete(`${API_BASE}/pixels/${pixelId}`);
    return response.data;
};

// ===== CMS SETTINGS API =====
export const getCMSSettings = async () => {
    const response = await axios.get(`${API_BASE}/settings/cms`);
    return response.data;
};

export const updateCMSSettings = async (settings) => {
    const response = await axios.put(`${API_BASE}/settings/cms`, settings);
    return response.data;
};
