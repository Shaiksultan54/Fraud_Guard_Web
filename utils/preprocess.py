import pandas as pd
import numpy as np
from typing import Dict, Any, Union

def validate_transaction(transaction: Dict[str, Any]) -> None:
    """Validate transaction data and raise appropriate errors."""
    # Required fields (only amount and type are strictly required)
    required_fields = ['type', 'amount']
    missing_fields = [field for field in required_fields if field not in transaction]
    if missing_fields:
        raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")

    # Validate amount
    try:
        amount = float(transaction['amount'])
        if amount <= 0:
            raise ValueError("Amount must be positive")
    except (TypeError, ValueError):
        raise ValueError("Invalid amount value")

    # Validate transaction type
    valid_types = {'CASH_OUT', 'TRANSFER', 'CASH_IN', 'DEBIT'}
    if transaction['type'] not in valid_types:
        raise ValueError(f"Invalid transaction type. Must be one of: {', '.join(valid_types)}")

    # Validate balances if present
    balance_fields = ['oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest']
    for field in balance_fields:
        if field in transaction:
            try:
                value = float(transaction[field])
                if value < 0:
                    raise ValueError(f"{field} cannot be negative")
            except (TypeError, ValueError):
                raise ValueError(f"Invalid {field} value")

def add_missing_balance_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Add missing balance columns with default values."""
    # Calculate default values based on amount
    if 'oldbalanceOrg' not in df.columns:
        df['oldbalanceOrg'] = df['amount'] * 1.5  # Assume balance is 1.5x the transaction amount

    if 'newbalanceOrig' not in df.columns:
        df['newbalanceOrig'] = df.apply(
            lambda row: max(row['oldbalanceOrg'] - row['amount'], 0),
            axis=1
        )

    if 'oldbalanceDest' not in df.columns:
        df['oldbalanceDest'] = 0.0

    if 'newbalanceDest' not in df.columns:
        df['newbalanceDest'] = df.apply(
            lambda row: (row['oldbalanceDest'] + row['amount'] 
                       if row['type'] not in ['CASH_OUT', 'DEBIT']
                       else row['oldbalanceDest']),
            axis=1
        )

    return df

def preprocess_transaction(transaction: Dict[str, Any]) -> pd.DataFrame:
    """
    Preprocess a single transaction for fraud detection.
    
    Args:
        transaction: Dictionary containing transaction data
        
    Returns:
        pd.DataFrame: Preprocessed transaction data
    """
    # Validate transaction data
    validate_transaction(transaction)
    
    # Create DataFrame with basic required fields
    df = pd.DataFrame([{
        'type': str(transaction['type']),
        'amount': float(transaction['amount'])
    }])
    
    # Add balance fields if present
    balance_fields = ['oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest']
    for field in balance_fields:
        if field in transaction:
            df[field] = float(transaction[field])
    
    # Add missing balance columns with default values
    df = add_missing_balance_columns(df)
    
    return df

def preprocess_transaction_batch(transactions: Union[pd.DataFrame, list]) -> pd.DataFrame:
    """
    Preprocess a batch of transactions for fraud detection.
    
    Args:
        transactions: DataFrame or list of transaction dictionaries
        
    Returns:
        pd.DataFrame: Preprocessed transactions data
    """
    if isinstance(transactions, list):
        # Validate all transactions
        for transaction in transactions:
            validate_transaction(transaction)
        df = pd.DataFrame(transactions)
    else:
        df = transactions.copy()
    
    # Ensure required columns exist
    required_columns = ['type', 'amount']
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise ValueError(f"Missing required columns: {', '.join(missing_columns)}")
    
    # Convert data types for required columns
    df['type'] = df['type'].astype(str)
    df['amount'] = df['amount'].astype(float)
    
    # Add missing balance columns with default values
    df = add_missing_balance_columns(df)
    
    # Convert balance column types
    balance_columns = ['oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest']
    for col in balance_columns:
        df[col] = df[col].astype(float)
    
    # Return all required columns in correct order
    return df[['type', 'amount', 'oldbalanceOrg', 'newbalanceOrig', 
               'oldbalanceDest', 'newbalanceDest']]
