import axios from 'axios';

// Mock data for fallback when API is unavailable
const MOCK_EXAMPLE_DATA = [
  {
    amount: 1500,
    time: 14,
    type: "Pay",
    merchantId: "M001",
    customerId: "C123",
    isFraud: 0
  },
  {
    amount: 9500,
    time: 3,
    type: "Withdraw",
    merchantId: "M999",
    customerId: "C88888",
    isFraud: 1
  },
  {
    amount: 181.0,
    time: 8,
    type: "Transfer",
    merchantId: "M234",
    customerId: "C1305486145",
    isFraud: 1
  },
  {
    amount: 5337.77,
    time: 11,
    type: "Deposit",
    merchantId: "M567",
    customerId: "C840083671",
    isFraud: 0
  },
  {
    amount: 9839.64,
    time: 19,
    type: "Pay",
    merchantId: "M789",
    customerId: "C1231006815",
    isFraud: 0
  }
];

// Mock single prediction response
const MOCK_PREDICTION = {
  prediction: "Genuine",
  confidence: 1.0,
  amount: 1500,
  time: 14,
  type: "Pay",
  merchantId: "M001",
  customerId: "C123"
};

// Mock bulk prediction response
const MOCK_BULK_PREDICTION = MOCK_EXAMPLE_DATA.map(item => ({
  prediction: item.isFraud === 0 ? "Genuine" : "Fraudulent",
  confidence: item.isFraud === 0 ? 0.95 : 0.88,
  amount: item.amount,
  time: item.time,
  type: item.type,
  merchantId: item.merchantId,
  customerId: item.customerId
}));

// Use environment variable for API URL with a fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data?.error || error.message);
    return Promise.reject(error.response?.data || error);
  }
);

// Single prediction
export const predictTransaction = async (transactionData: any) => {
  // Validate required fields
  const requiredFields = ['amount', 'time', 'type', 'merchantId', 'customerId'];
  const missingFields = requiredFields.filter(field => !transactionData[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Convert numeric fields
  const processedData = {
    ...transactionData,
    amount: Number(transactionData.amount),
    time: Number(transactionData.time)
  };

  const response = await axiosInstance.post('/predict', processedData);
  return response.data;
};

// Bulk prediction with CSV file
export const bulkPredict = async (file: File) => {
  if (!file) {
    throw new Error('No file provided');
  }

  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axiosInstance.post('/bulk-predict', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Get logs data
export const getExampleData = async () => {
  try {
    const response = await axiosInstance.get('/logs');
    const logs = response.data.logs || [];

    return logs.map((log: any) => ({
      amount: log.transaction.amount,
      time: log.transaction.time,
      type: log.transaction.type,
      nameOrig: log.transaction.customerId,
      nameDest: log.transaction.merchantId,
      oldbalanceOrg: 0,
      newbalanceOrig: 0,
      oldbalanceDest: 0,
      newbalanceDest: 0,
      isFraud: log.prediction === 'Fraudulent' ? 1 : 0,
      confidence: log.confidence,
      timestamp: log.timestamp
    }));
  } catch (error) {
    console.error('Error fetching logs:', error);
    throw error;
  }
};

export default {
  predictTransaction,
  bulkPredict,
  getExampleData,
};