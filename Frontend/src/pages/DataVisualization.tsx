import { useState, useEffect } from 'react';
import { PieChart, Pie, ResponsiveContainer, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { Loader2 } from 'lucide-react';
import { getExampleData } from '../services/api';
import { toast } from '../components/ui/Toaster';

// Type for our transaction data
type Transaction = {
  amount: number;
  type: string;
  nameOrig: string;
  nameDest: string;
  isFraud: number;
  confidence?: number;
  timestamp?: string;
  [key: string]: any;
};

const COLORS = ['#10B981', '#EF4444'];
const TRANSACTION_COLORS: {[key: string]: string} = {
  'PAYMENT': '#3B82F6',
  'TRANSFER': '#8B5CF6',
  'CASH_OUT': '#EC4899',
  'DEBIT': '#F59E0B',
  'CASH_IN': '#10B981',
};

const DataVisualization = () => {
  const [data, setData] = useState<Transaction[]>([]);
  const [filteredData, setFilteredData] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFirst, setShowFirst] = useState(true);
  const [fraudFilter, setFraudFilter] = useState<'all' | 'fraud' | 'non-fraud'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getExampleData();
        // Remove balance columns from the response data
        const cleanedData = response.map(({ oldbalanceOrg, newbalanceOrig, oldbalanceDest, newbalanceDest, ...rest }: {
          oldbalanceOrg: number;
          newbalanceOrig: number;
          oldbalanceDest: number;
          newbalanceDest: number;
          [key: string]: any;
        }) => rest);
        setData(cleanedData);
        setFilteredData(cleanedData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch example data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = data;
    
    // Apply fraud filter
    if (fraudFilter === 'fraud') {
      filtered = filtered.filter(item => item.isFraud === 1);
    } else if (fraudFilter === 'non-fraud') {
      filtered = filtered.filter(item => item.isFraud === 0);
    }
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        return Object.keys(item).some(key => {
          const value = item[key];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(lowercasedTerm);
          } else if (typeof value === 'number') {
            return value.toString().includes(lowercasedTerm);
          }
          return false;
        });
      });
    }
    
    setFilteredData(filtered);
  }, [searchTerm, data, fraudFilter]);

  // Data for charts
  const fraudData = [
    { name: 'Legitimate', value: data.filter(item => item.isFraud === 0).length },
    { name: 'Fraudulent', value: data.filter(item => item.isFraud === 1).length },
  ];

  const getTransactionTypeData = () => {
    const types: {[key: string]: {total: number, fraudCount: number}} = {};
    
    data.forEach(transaction => {
      if (!types[transaction.type]) {
        types[transaction.type] = { total: 0, fraudCount: 0 };
      }
      
      types[transaction.type].total++;
      
      if (transaction.isFraud === 1) {
        types[transaction.type].fraudCount++;
      }
    });
    
    return Object.keys(types).map(type => ({
      name: type,
      total: types[type].total,
      fraudCount: types[type].fraudCount,
      fraudRate: Math.round((types[type].fraudCount / types[type].total) * 100)
    }));
  };

  const transactionTypeData = getTransactionTypeData();

  // Time-based data
  const getTimeData = () => {
    const timeData: {[key: string]: {total: number, fraudCount: number}} = {};
    
    const numBuckets = 5;
    const bucketSize = Math.ceil(data.length / numBuckets);
    
    data.forEach((transaction, index) => {
      const bucket = Math.floor(index / bucketSize) + 1;
      const bucketKey = `Period ${bucket}`;
      
      if (!timeData[bucketKey]) {
        timeData[bucketKey] = { total: 0, fraudCount: 0 };
      }
      
      timeData[bucketKey].total++;
      
      if (transaction.isFraud === 1) {
        timeData[bucketKey].fraudCount++;
      }
    });
    
    return Object.keys(timeData).map(key => ({
      name: key,
      fraudRate: (timeData[key].fraudCount / timeData[key].total) * 100,
      total: timeData[key].total
    }));
  };

  const timeData = getTimeData();

  // Calculate amount ranges and fraud distribution
  const getAmountRangeData = () => {
    const ranges = [
      { name: '0-100', min: 0, max: 100 },
      { name: '100-1K', min: 100, max: 1000 },
      { name: '1K-10K', min: 1000, max: 10000 },
      { name: '10K+', min: 10000, max: Infinity },
    ];
    
    const rangeData = ranges.map(range => {
      const transactionsInRange = data.filter(
        t => t.amount >= range.min && t.amount < range.max
      );
      
      const fraudCount = transactionsInRange.filter(t => t.isFraud === 1).length;
      const total = transactionsInRange.length;
      
      return {
        name: range.name,
        total,
        fraudCount,
        fraudRate: total > 0 ? Math.round((fraudCount / total) * 100) : 0
      };
    });
    
    return rangeData;
  };

  const amountRangeData = getAmountRangeData();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-600 dark:text-slate-400">Loading transaction data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-center">Fraud Analytics Dashboard</h1>
      
      {/* Add filter controls before the charts */}
      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFraudFilter('all')}
            className={`px-4 py-2 rounded-md ${
              fraudFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFraudFilter('fraud')}
            className={`px-4 py-2 rounded-md ${
              fraudFilter === 'fraud'
                ? 'bg-red-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            Fraud
          </button>
          <button
            onClick={() => setFraudFilter('non-fraud')}
            className={`px-4 py-2 rounded-md ${
              fraudFilter === 'non-fraud'
                ? 'bg-green-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            Non-Fraud
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFirst(true)}
            className={`px-4 py-2 rounded-md ${
              showFirst
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            First 50
          </button>
          <button
            onClick={() => setShowFirst(false)}
            className={`px-4 py-2 rounded-md ${
              !showFirst
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            Last 50
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Fraud Distribution */}
        <div className="card">
          <h2 className="text-xl font-medium mb-4">Fraud Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={fraudData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
                {fraudData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Transactions']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Transaction Type Analysis */}
        <div className="card">
          <h2 className="text-xl font-medium mb-4">Transaction Types</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={transactionTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [value, name === 'total' ? 'Total Transactions' : 'Fraudulent Transactions']} />
              <Legend />
              <Bar dataKey="total" name="Total Transactions" fill="#3B82F6" />
              <Bar dataKey="fraudCount" name="Fraudulent Transactions" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Fraud Rate by Amount Range */}
        <div className="card">
          <h2 className="text-xl font-medium mb-4">Fraud Rate by Amount Range</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={amountRangeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value, name) => {
                if (name === 'fraudRate') return [`${value}%`, 'Fraud Rate'];
                return [value, name === 'total' ? 'Transaction Count' : 'Fraud Count'];
              }} />
              <Legend />
              <Bar yAxisId="left" dataKey="total" name="Transaction Count" fill="#64748B" />
              <Bar yAxisId="left" dataKey="fraudCount" name="Fraud Count" fill="#EF4444" />
              <Bar yAxisId="right" dataKey="fraudRate" name="Fraud Rate (%)" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Fraud Rate Over Time */}
        <div className="card">
          <h2 className="text-xl font-medium mb-4">Fraud Rate Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value: number, name) => {
                if (name === 'fraudRate') return [`${value.toFixed(2)}%`, 'Fraud Rate'];
                return [value, 'Total Transactions'];
              }} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="total" stroke="#3B82F6" name="Total Transactions" />
              <Line yAxisId="right" type="monotone" dataKey="fraudRate" stroke="#EF4444" name="Fraud Rate (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Transaction Data Table */}
      <div className="card mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Transaction Data</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="data-table">
            <thead>
              <tr>
                {data.length > 0 && Object.keys(data[0]).map((header) => (
                  <th key={header}>
                    {header === 'isFraud' ? 'Fraud Status' : 
                      header.replace(/([A-Z])/g, ' $1')
                        .replace(/^./, str => str.toUpperCase())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(showFirst ? filteredData.slice(0, 50) : filteredData.slice(-50)).map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className={row.isFraud === 1 ? 'fraud' : 'legitimate'}
                >
                  {Object.entries(row).map(([key, value], cellIndex) => (
                    <td key={`${rowIndex}-${cellIndex}`}>
                      {key === 'isFraud' ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          value === 1 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {value === 1 ? 'Fraudulent' : 'Legitimate'}
                        </span>
                      ) : (
                        typeof value === 'number' ? 
                          key === 'amount' ? 
                            value.toFixed(2) : 
                            value : 
                          String(value)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataVisualization;