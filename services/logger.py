import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional
import threading

LOGS_PATH = "transaction_logs.json"
lock = threading.Lock()  # Thread-safe logging

def initialize_logs():
    """Initialize the logs file if it doesn't exist."""
    if not os.path.exists(LOGS_PATH):
        with open(LOGS_PATH, "w") as f:
            json.dump([], f)

def calculate_risk_factors(transaction: Dict[str, Any], prediction: str, confidence: float) -> Dict[str, Any]:
    """Calculate risk factors for the transaction."""
    risk_factors = []
    
    # Check amount
    amount = float(transaction['amount'])
    if amount > 5000:
        risk_factors.append("High amount transaction")
    
    # Check time
    time = int(transaction['time'])
    if time >= 23 or time <= 4:
        risk_factors.append("Late night transaction")
    
    # Check merchant
    if transaction['merchantId'].startswith('M00'):
        risk_factors.append("Suspicious merchant")
    
    # Check transaction type and amount combination
    if transaction['type'] == 'Withdraw' and amount > 3000:
        risk_factors.append("Large withdrawal")
    
    return {
        "risk_factors": risk_factors,
        "risk_level": "High" if len(risk_factors) >= 2 else "Medium" if risk_factors else "Low"
    }

def log_transaction(transaction: Dict[str, Any], prediction: str, confidence: float) -> bool:
    """
    Log a transaction with enhanced details and thread safety.
    
    Args:
        transaction: Transaction data
        prediction: Fraud prediction result
        confidence: Model confidence score
        
    Returns:
        bool: True if logging was successful, False otherwise
    """
    try:
        # Calculate risk factors
        risk_analysis = calculate_risk_factors(transaction, prediction, confidence)
        
        # Prepare log entry
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "transaction": transaction,
            "prediction": prediction,
            "confidence": confidence,
            "risk_analysis": risk_analysis,
            "transaction_id": f"TX-{datetime.now().strftime('%Y%m%d-%H%M%S')}-{abs(hash(str(transaction)))%10000:04d}"
        }
        
        # Thread-safe logging
        with lock:
            initialize_logs()
            with open(LOGS_PATH, "r") as f:
                logs = json.load(f)
            
            logs.append(log_entry)
            
            with open(LOGS_PATH, "w") as f:
                json.dump(logs, f, indent=2)
        
        return True

    except Exception as e:
        print(f"Error logging transaction: {str(e)}")
        return False

def get_all_logs() -> List[Dict[str, Any]]:
    """
    Get all transaction logs.
    
    Returns:
        List of all logged transactions
    """
    try:
        initialize_logs()
        with open(LOGS_PATH, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading logs: {str(e)}")
        return []

def get_logs_by_customer(customer_id: str) -> List[Dict[str, Any]]:
    """
    Get all transactions for a specific customer.
    
    Args:
        customer_id: Customer ID to filter by
        
    Returns:
        List of customer's transactions
    """
    try:
        logs = get_all_logs()
        return [log for log in logs if log["transaction"].get("customerId") == customer_id]
    except Exception as e:
        print(f"Error filtering logs: {str(e)}")
        return []

def get_merchant_risk_score(merchant_id: str) -> Optional[Dict[str, Any]]:
    """
    Calculate risk score for a merchant based on their transaction history.
    
    Args:
        merchant_id: Merchant ID to analyze
        
    Returns:
        Dictionary containing merchant risk analysis or None if error
    """
    try:
        logs = get_all_logs()
        merchant_transactions = [
            log for log in logs 
            if log["transaction"].get("merchantId") == merchant_id
        ]
        
        if not merchant_transactions:
            return None
            
        total_transactions = len(merchant_transactions)
        fraudulent_transactions = sum(
            1 for tx in merchant_transactions 
            if tx["prediction"] == "Fraudulent"
        )
        
        return {
            "merchant_id": merchant_id,
            "total_transactions": total_transactions,
            "fraudulent_transactions": fraudulent_transactions,
            "fraud_rate": fraudulent_transactions / total_transactions if total_transactions > 0 else 0,
            "risk_level": "High" if fraudulent_transactions / total_transactions > 0.1 else "Medium" if fraudulent_transactions > 0 else "Low"
        }
        
    except Exception as e:
        print(f"Error calculating merchant risk: {str(e)}")
        return None
