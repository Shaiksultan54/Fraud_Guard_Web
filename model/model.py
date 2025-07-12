import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

def create_model():
    """
    Create and train a fraud detection model using synthetic data that matches
    the real transaction patterns.
    """
    np.random.seed(42)
    n_samples = 10000  # Increased sample size

    # Generate realistic transaction data
    data = []
    transaction_types = ['CASH_OUT', 'TRANSFER', 'CASH_IN', 'DEBIT']
    type_weights = [0.3, 0.3, 0.2, 0.2]  # Probability distribution for transaction types

    for _ in range(n_samples):
        # Generate transaction type
        tx_type = np.random.choice(transaction_types, p=type_weights)
        
        # Generate amount based on transaction type
        if tx_type in ['CASH_OUT', 'TRANSFER']:
            amount = np.random.exponential(5000)  # Higher amounts for these types
        else:
            amount = np.random.exponential(1000)  # Lower amounts for other types
        
        # Generate balances
        oldbalanceOrg = max(amount + np.random.exponential(1000), amount)  # Ensure sufficient balance
        newbalanceOrig = max(oldbalanceOrg - amount, 0)
        oldbalanceDest = np.random.exponential(2000)
        newbalanceDest = oldbalanceDest + amount if tx_type not in ['CASH_OUT', 'DEBIT'] else oldbalanceDest

        # Determine if transaction is fraudulent based on rules
        is_fraud = False
        
        # Rule 1: Large amount withdrawals or transfers
        if amount > 5000 and tx_type in ['CASH_OUT', 'TRANSFER']:
            fraud_prob = 0.7
            is_fraud = np.random.random() < fraud_prob

        # Rule 2: Complete balance depletion
        elif newbalanceOrig == 0 and oldbalanceOrg > 1000:
            fraud_prob = 0.8
            is_fraud = np.random.random() < fraud_prob

        # Rule 3: Multiple high-value transactions
        elif amount > 3000 and tx_type in ['TRANSFER', 'CASH_OUT']:
            fraud_prob = 0.5
            is_fraud = np.random.random() < fraud_prob

        # Small chance of fraud for other transactions
        elif np.random.random() < 0.01:
            is_fraud = True

        data.append({
            'type': tx_type,
            'amount': amount,
            'oldbalanceOrg': oldbalanceOrg,
            'newbalanceOrig': newbalanceOrig,
            'oldbalanceDest': oldbalanceDest,
            'newbalanceDest': newbalanceDest,
            'isFraud': int(is_fraud)
        })

    # Convert to DataFrame
    df = pd.DataFrame(data)

    # Define feature preprocessing
    numeric_features = ['amount', 'oldbalanceOrg', 'newbalanceOrig', 
                       'oldbalanceDest', 'newbalanceDest']
    categorical_features = ['type']

    # Create preprocessing pipeline
    preprocessor = ColumnTransformer([
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ])

    # Create and train the model
    model = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            class_weight={0: 1, 1: 3},  # Give more weight to fraud cases
            random_state=42
        ))
    ])

    # Prepare features and target
    X = df[numeric_features + categorical_features]
    y = df['isFraud']

    # Train the model
    model.fit(X, y)

    return model
