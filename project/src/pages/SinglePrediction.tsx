import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { predictTransaction } from '../services/api';
import { toast } from '../components/ui/Toaster';

// Sample transaction structure
const defaultTransaction = {
  amount: '',
  time: '',
  type: 'Pay',
  merchantId: '',
  customerId: ''
};

const transactionTypes = ["Pay", "Transfer", "Withdraw", "Deposit"];

const SinglePrediction = () => {
  const [transaction, setTransaction] = useState(defaultTransaction);
  const [result, setResult] = useState<{ isFraud: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Convert numeric values
    const parsedValue = name !== 'type' && name !== 'merchantId' && name !== 'customerId' 
      ? parseFloat(value) || ''
      : value;
    
    setTransaction({
      ...transaction,
      [name]: parsedValue,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setResult(null);
      
      const response = await predictTransaction(transaction);
      setResult(response);
      
      if (response.isFraud === 1) {
        toast({
          title: "Fraud Detected",
          description: "This transaction has been identified as potentially fraudulent.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Transaction Legitimate",
          description: "This transaction appears to be legitimate.",
          variant: "success"
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to process transaction. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTransaction(defaultTransaction);
    setResult(null);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-center">Single Transaction Prediction</h1>
      
      <div className="card mb-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="amount">Transaction Amount</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={transaction.amount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <label htmlFor="type">Transaction Type</label>
              <select
                id="type"
                name="type"
                value={transaction.type}
                onChange={handleInputChange}
                required
                className="mt-1"
              >
                {transactionTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="time">Transaction Time (Hour)</label>
              <input
                type="number"
                id="time"
                name="time"
                value={transaction.time}
                onChange={handleInputChange}
                step="1"
                min="0"
                max="23"
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <label htmlFor="customerId">Customer ID</label>
              <input
                type="text"
                id="customerId"
                name="customerId"
                value={transaction.customerId}
                onChange={handleInputChange}
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <label htmlFor="merchantId">Merchant ID</label>
              <input
                type="text"
                id="merchantId"
                name="merchantId"
                value={transaction.merchantId}
                onChange={handleInputChange}
                required
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-4">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : "Analyze Transaction"}
            </button>
            
            <button 
              type="button" 
              onClick={resetForm}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>
      
      {result && (
        <div className={`card mb-6 border-2 ${
          result.isFraud === 1 
            ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
            : 'border-green-500 bg-green-50 dark:bg-green-900/20'
        }`}>
          <div className="flex items-center justify-center">
            {result.isFraud === 1 ? (
              <>
                <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400 mr-3" />
                <div>
                  <h2 className={result.isFraud === 1 ? 'text-red-700 dark:text-red-400' : ''}>Fraudulent Transaction Detected</h2>
                  <p className={result.isFraud === 1 ? 'text-red-600 dark:text-red-300' : ''}>
                    This transaction has been flagged as potentially fraudulent. We recommend reviewing it carefully.
                  </p>
                </div>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400 mr-3" />
                <div>
                  <h2 className="text-green-700 dark:text-green-400">Legitimate Transaction</h2>
                  <p className="text-green-600 dark:text-green-300">
                    Our system has classified this transaction as legitimate. No suspicious activity detected.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      <div className="card bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-medium mb-3">How It Works</h3>
        <p className="mb-4">
          Our fraud detection model analyzes various transaction features to identify patterns associated with fraudulent activities. 
          The model evaluates:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300 mb-4">
          <li>Transaction amount and type</li>
          <li>Time of transaction</li>
          <li>Customer and merchant identifiers</li>
          <li>Transaction patterns and anomalies</li>
        </ul>
        <p>
          The model returns a prediction indicating whether the transaction is likely fraudulent or legitimate based on these factors.
        </p>
      </div>
    </div>
  );
};

export default SinglePrediction;