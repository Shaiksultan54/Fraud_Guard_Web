# Fraud Detection API

A machine learning-powered fraud detection system built with Flask and scikit-learn. This API provides real-time fraud detection for financial transactions with both single transaction and batch processing capabilities.

## Features

- **Real-time Fraud Detection**: Analyze individual transactions for fraud probability
- **Batch Processing**: Upload CSV files to analyze multiple transactions at once
- **Transaction Logging**: Comprehensive logging system with risk analysis
- **Risk Assessment**: Automatic risk factor calculation and merchant scoring
- **RESTful API**: Clean, documented API endpoints
- **CORS Support**: Cross-origin resource sharing enabled

## Project Structure

```
fraud-detection/
├── app.py                 # Main Flask application
├── model/
│   └── model.py          # Machine learning model creation and training
├── services/
│   └── logger.py         # Transaction logging and risk analysis
├── utils/
│   ├── __init__.py
│   └── preprocess.py     # Data preprocessing utilities
├── transactions.csv      # Sample transaction data
├── requirements.txt      # Project dependencies
└── README.md            # This file
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd fraud-detection
```

### 2. Create Virtual Environment

#### For Windows:
```bash
python -m venv venv
venv\Scripts\activate
```

#### For macOS/Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Application

```bash
python app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### 1. Single Transaction Prediction

**POST** `/api/predict`

Analyze a single transaction for fraud detection.

#### Request Body:
```json
{
  "type": "TRANSFER",
  "amount": 5000,
  "time": 14,
  "merchantId": "M001",
  "customerId": "C123"
}
```

#### Response:
```json
{
  "isFraud": 1,
  "confidence": 0.85,
  "prediction": "Fraudulent",
  "transaction": {
    "type": "TRANSFER",
    "amount": 5000,
    "time": 14,
    "merchantId": "M001",
    "customerId": "C123"
  }
}
```

### 2. Batch Processing

**POST** `/api/bulk-predict`

Upload a CSV file to analyze multiple transactions.

#### Request:
- Form data with file upload
- CSV must contain columns: `type`, `amount`
- Optional columns: `oldbalanceOrg`, `newbalanceOrig`, `oldbalanceDest`, `newbalanceDest`

#### Response:
```json
[
  {
    "type": "TRANSFER",
    "amount": 5000,
    "isFraud": 1,
    "confidence": 0.85,
    "prediction": "Fraudulent"
  },
  ...
]
```

### 3. Transaction Logs

**GET** `/api/logs`

Retrieve all transaction logs.

**GET** `/api/logs/<customer_id>`

Retrieve logs for a specific customer.

### 4. Example Data

**GET** `/api/example-data`

Get sample predictions for testing.

## Supported Transaction Types

- `CASH_OUT`: Cash withdrawal
- `TRANSFER`: Money transfer
- `CASH_IN`: Cash deposit
- `DEBIT`: Debit transaction

## CSV Upload Format

Your CSV file should contain the following columns:

### Required Columns:
- `type`: Transaction type (CASH_OUT, TRANSFER, CASH_IN, DEBIT)
- `amount`: Transaction amount (positive number)

### Optional Columns:
- `oldbalanceOrg`: Original account balance before transaction
- `newbalanceOrig`: Original account balance after transaction
- `oldbalanceDest`: Destination account balance before transaction
- `newbalanceDest`: Destination account balance after transaction

### Example CSV:
```csv
type,amount,oldbalanceOrg,newbalanceOrig,oldbalanceDest,newbalanceDest
CASH_OUT,9800.5,10000.0,199.5,0.0,0.0
TRANSFER,2500.0,2500.0,0.0,0.0,0.0
CASH_IN,3000.0,1500.0,4500.0,0.0,0.0
```

## Model Information

The fraud detection model uses:
- **Algorithm**: Random Forest Classifier
- **Features**: Transaction type, amount, account balances
- **Training**: Synthetic data with realistic transaction patterns
- **Performance**: Optimized for fraud detection with class weight balancing

### Risk Factors Analyzed:
- High amount transactions (>$5000)
- Late night transactions (11 PM - 4 AM)
- Suspicious merchant patterns
- Large withdrawals
- Complete balance depletion

## Development

### Running in Development Mode

```bash
export FLASK_ENV=development  # Linux/macOS
set FLASK_ENV=development     # Windows
python app.py
```

### Testing with cURL

```bash
# Single transaction prediction
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"type": "TRANSFER", "amount": 5000, "time": 14, "merchantId": "M001", "customerId": "C123"}'

# Get all logs
curl http://localhost:5000/api/logs

# Get example data
curl http://localhost:5000/api/example-data
```

## Production Deployment

### Using Gunicorn

```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Environment Variables

For production, consider setting:
- `FLASK_ENV=production`
- `SECRET_KEY=your-secret-key`
- Configure proper logging levels

## Troubleshooting

### Common Issues:

1. **Import Errors**: Ensure virtual environment is activated
2. **CSV Upload Errors**: Check file format and required columns
3. **Model Loading Issues**: Verify all dependencies are installed
4. **CORS Issues**: CORS is enabled for all origins in development

### Logging

Transaction logs are stored in `transaction_logs.json` in the project root. Each log entry includes:
- Timestamp
- Transaction details
- Prediction result
- Confidence score
- Risk analysis
- Unique transaction ID

## License

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions, please open an issue in the GitHub repository.