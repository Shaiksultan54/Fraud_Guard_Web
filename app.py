from flask import Flask, request, jsonify
from flask_cors import CORS
from model.model import create_model
from utils.preprocess import preprocess_transaction, preprocess_transaction_batch
from services.logger import log_transaction, get_all_logs, get_logs_by_customer
import pandas as pd
from werkzeug.utils import secure_filename
import os
from io import StringIO

app = Flask(__name__)
CORS(app)

# Initialize the model
MODEL = create_model()

# Allowed extensions for upload
ALLOWED_EXTENSIONS = {'csv'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/bulk-predict', methods=['POST'])
def bulk_predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400

    try:
        # Read CSV into pandas DataFrame
        stream = StringIO(file.stream.read().decode("UTF8"), newline=None)
        df = pd.read_csv(stream)

        # Ensure required columns exist
        required_columns = ['type', 'amount']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            return jsonify({'error': f'Missing required columns: {", ".join(missing_columns)}'}), 400

        # Remove any existing prediction columns
        columns_to_drop = ['isFraud', 'confidence', 'prediction']
        df = df.drop(columns=[col for col in columns_to_drop if col in df.columns])

        # Preprocess the data
        try:
            preprocessed_df = preprocess_transaction_batch(df)
        except Exception as e:
            return jsonify({'error': f'Preprocessing error: {str(e)}'}), 400

        # Make predictions
        try:
            predictions = MODEL.predict(preprocessed_df)
            probabilities = MODEL.predict_proba(preprocessed_df)
        except Exception as e:
            return jsonify({'error': f'Prediction error: {str(e)}'}), 500

        # Add predictions and confidence to original dataframe
        df['isFraud'] = predictions
        df['confidence'] = [max(prob) for prob in probabilities]
        df['prediction'] = ['Fraudulent' if p == 1 else 'Genuine' for p in predictions]

        # Log each transaction
        for idx, row in df.iterrows():
            transaction = row.to_dict()
            log_transaction(
                transaction,
                'Fraudulent' if predictions[idx] == 1 else 'Genuine',
                float(max(probabilities[idx]))
            )

        # Convert to dict for response
        result = df.to_dict(orient='records')
        return jsonify(result)

    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        transaction = request.json
        if not transaction:
            return jsonify({"error": "No transaction data provided"}), 400

        # Add default balance values if not provided
        if 'oldbalanceOrg' not in transaction:
            transaction['oldbalanceOrg'] = transaction.get('amount', 0) * 1.5
        if 'newbalanceOrig' not in transaction:
            transaction['newbalanceOrig'] = max(
                transaction.get('oldbalanceOrg', 0) - transaction.get('amount', 0),
                0
            )
        if 'oldbalanceDest' not in transaction:
            transaction['oldbalanceDest'] = 0
        if 'newbalanceDest' not in transaction:
            transaction['newbalanceDest'] = (
                transaction.get('oldbalanceDest', 0) + transaction.get('amount', 0)
                if transaction.get('type') not in ['CASH_OUT', 'DEBIT']
                else transaction.get('oldbalanceDest', 0)
            )

        # Convert transaction type if needed
        type_mapping = {
            'Pay': 'TRANSFER',
            'Transfer': 'TRANSFER',
            'Withdraw': 'CASH_OUT',
            'Deposit': 'CASH_IN'
        }
        if transaction.get('type') in type_mapping:
            transaction['type'] = type_mapping[transaction['type']]
            
        df = preprocess_transaction(transaction)
        prediction = MODEL.predict(df)[0]
        probabilities = MODEL.predict_proba(df)[0]
        confidence = float(max(probabilities))
        
        # Log the transaction
        prediction_label = "Fraudulent" if prediction == 1 else "Genuine"
        log_transaction(transaction, prediction_label, confidence)
        
        # Return response
        return jsonify({
            "isFraud": int(prediction),
            "confidence": confidence,
            "prediction": prediction_label,
            "transaction": transaction
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/logs', methods=['GET'])
def logs():
    return jsonify({"logs": get_all_logs()})

@app.route('/api/logs/<customer_id>', methods=['GET'])
def logs_by_customer(customer_id):
    return jsonify({"logs": get_logs_by_customer(customer_id)})

@app.route('/api/example-data', methods=['GET'])
def example_data():
    examples = [
        {"amount": 1500, "time": 14, "type": "Pay", "merchantId": "M001", "customerId": "C123"},
        {"amount": 8000, "time": 2, "type": "Withdraw", "merchantId": "M009", "customerId": "C456"},
    ]
    results = []
    for transaction in examples:
        df = preprocess_transaction(transaction)
        prediction = MODEL.predict(df)[0]
        probabilities = MODEL.predict_proba(df)[0]
        confidence = float(max(probabilities))
        prediction_label = "Fraudulent" if prediction == 1 else "Genuine"
        results.append({
            **transaction, 
            "isFraud": int(prediction),
            "prediction": prediction_label,
            "confidence": confidence
        })
    return jsonify({"predictions": results})

if __name__ == '__main__':
    app.run(debug=True)
