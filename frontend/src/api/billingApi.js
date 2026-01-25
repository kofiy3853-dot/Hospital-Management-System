import axios from './axios';

export const billingApi = {
    // Create a new bill
    createBill: async (billData) => {
        const response = await axios.post('/api/billing', billData);
        return response.data;
    },

    // Update bill status
    updateBillStatus: async (billId, status) => {
        const response = await axios.put(`/api/billing/${billId}/status`, { status });
        return response.data;
    },

    // Get billing history for a patient
    getBillingHistory: async (patientId) => {
        const response = await axios.get(`/api/billing/history/${patientId}`);
        return response.data;
    },

    // Get all bills (for admin/accountant view)
    getAllBills: async () => {
        const response = await axios.get('/api/billing');
        return response.data;
    }
};

export default billingApi;
