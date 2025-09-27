# Banking Analytics - Technical Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation & Setup](#installation--setup)
4. [API Documentation](#api-documentation)
5. [Data Pipeline](#data-pipeline)
6. [Model Development](#model-development)
7. [Deployment Guide](#deployment-guide)
8. [Monitoring & Logging](#monitoring--logging)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)
11. [Contributing](#contributing)

## Overview

The Banking Analytics platform is a comprehensive solution for analyzing banking data, predicting customer behavior, and managing risk. It combines traditional machine learning with deep learning techniques to provide actionable insights for banking operations.

### Key Features
- **Data Processing**: Automated ETL pipelines with quality monitoring
- **Machine Learning**: Multiple algorithms including ensemble methods
- **Deep Learning**: TensorFlow/Keras neural networks
- **Real-time Analytics**: Live dashboards and monitoring
- **Model Management**: MLflow integration for model versioning
- **API Services**: RESTful APIs for model inference
- **Monitoring**: Prometheus/Grafana integration

### Technology Stack
- **Backend**: Python 3.9+, FastAPI, Streamlit
- **ML Libraries**: Scikit-learn, TensorFlow, XGBoost, LightGBM
- **Database**: PostgreSQL, Redis
- **Containerization**: Docker, Kubernetes
- **Monitoring**: Prometheus, Grafana, MLflow
- **CI/CD**: GitHub Actions, Docker Registry

## Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Dashboard │    │   API Gateway   │    │   Mobile App    │
│   (Streamlit)    │    │   (FastAPI)     │    │   (Future)      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │     Load Balancer        │
                    │      (Nginx)              │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │   Application Services   │
                    │  ┌─────────────────────┐ │
                    │  │   Dashboard Service  │ │
                    │  │   Model Service      │ │
                    │  │   Data Service       │ │
                    │  └─────────────────────┘ │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │      Data Layer           │
                    │  ┌─────────────────────┐ │
                    │  │   PostgreSQL         │ │
                    │  │   Redis Cache        │ │
                    │  │   MLflow Store       │ │
                    │  └─────────────────────┘ │
                    └───────────────────────────┘
```

### Data Flow Architecture
```
Raw Data Sources → ETL Pipeline → Data Lake → Feature Store → ML Pipeline → Model Registry → Production API
     ↓              ↓             ↓           ↓              ↓             ↓              ↓
  Banking        Data         PostgreSQL   Feature        Training      MLflow        FastAPI
  Systems        Quality      Database     Engineering   Pipeline      Tracking      Services
                 Checks
```

## Installation & Setup

### Prerequisites
- Python 3.9 or higher
- Docker and Docker Compose
- PostgreSQL 13+
- Redis 6+
- Git

### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/your-org/banking-analytics.git
cd banking-analytics
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Initialize database**
```bash
python scripts/init_database.py
```

6. **Run the application**
```bash
# Start all services with Docker Compose
docker-compose up -d

# Or run individual components
streamlit run banking_analytics_dashboard.py
```

### Environment Variables
```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/banking_analytics
REDIS_URL=redis://localhost:6379/0

# MLflow Configuration
MLFLOW_TRACKING_URI=http://localhost:5000
MLFLOW_EXPERIMENT_NAME=banking_analytics

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=4

# Security
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key

# Monitoring
PROMETHEUS_ENDPOINT=http://localhost:9090
GRAFANA_ENDPOINT=http://localhost:3000
```

## API Documentation

### Authentication
All API endpoints require authentication using JWT tokens.

```bash
# Login to get token
curl -X POST "http://localhost:8000/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"username": "your_username", "password": "your_password"}'

# Use token in subsequent requests
curl -H "Authorization: Bearer <your_token>" \
     "http://localhost:8000/api/v1/models/predict"
```

### Core Endpoints

#### Model Prediction
```http
POST /api/v1/models/predict
Content-Type: application/json
Authorization: Bearer <token>

{
  "customer_id": "12345",
  "features": {
    "account_balance": 5000.0,
    "credit_limit": 10000.0,
    "age": 35,
    "transaction_amount": 250.0
  },
  "model_type": "churn_prediction"
}
```

#### Model Performance
```http
GET /api/v1/models/performance/{model_id}
Authorization: Bearer <token>
```

#### Data Quality Check
```http
POST /api/v1/data/quality-check
Content-Type: application/json
Authorization: Bearer <token>

{
  "data_source": "customer_transactions",
  "check_type": "completeness"
}
```

### API Response Format
```json
{
  "status": "success",
  "data": {
    "prediction": 0.85,
    "confidence": 0.92,
    "model_version": "v1.2.0",
    "timestamp": "2024-12-24T10:30:00Z"
  },
  "metadata": {
    "request_id": "req_123456",
    "processing_time_ms": 45
  }
}
```

## Data Pipeline

### Data Sources
- **Customer Demographics**: Age, location, account types
- **Transaction Data**: Amounts, frequencies, patterns
- **Credit Information**: Limits, utilization, payment history
- **Risk Indicators**: Derived features for predictive modeling

### ETL Process

#### Extract
```python
def extract_data(source_config):
    """Extract data from various sources"""
    if source_config['type'] == 'database':
        return extract_from_database(source_config)
    elif source_config['type'] == 'api':
        return extract_from_api(source_config)
    elif source_config['type'] == 'file':
        return extract_from_file(source_config)
```

#### Transform
```python
def transform_data(raw_data):
    """Transform raw data into features"""
    # Data cleaning
    cleaned_data = clean_data(raw_data)
    
    # Feature engineering
    features = create_features(cleaned_data)
    
    # Data validation
    validated_data = validate_data(features)
    
    return validated_data
```

#### Load
```python
def load_data(transformed_data, target_config):
    """Load transformed data to target system"""
    if target_config['type'] == 'database':
        load_to_database(transformed_data, target_config)
    elif target_config['type'] == 'feature_store':
        load_to_feature_store(transformed_data, target_config)
```

### Data Quality Framework
- **Completeness**: Check for missing values
- **Accuracy**: Validate data ranges and formats
- **Consistency**: Ensure data consistency across sources
- **Timeliness**: Monitor data freshness
- **Validity**: Verify business rules

## Model Development

### Model Types
1. **Churn Prediction**: Predict customer churn probability
2. **Fraud Detection**: Identify fraudulent transactions
3. **Credit Scoring**: Assess credit risk
4. **Next Best Product**: Recommend products to customers
5. **Risk Assessment**: Calculate customer risk scores

### Model Development Workflow
```python
# 1. Data Preparation
X_train, X_test, y_train, y_test = prepare_data()

# 2. Feature Engineering
features = create_advanced_features(X_train)

# 3. Model Training
model = train_model(features, y_train)

# 4. Model Validation
performance = validate_model(model, X_test, y_test)

# 5. Model Deployment
deploy_model(model, performance)
```

### Model Registry
Models are versioned and tracked using MLflow:

```python
import mlflow
import mlflow.sklearn

# Start MLflow run
with mlflow.start_run():
    # Log parameters
    mlflow.log_param("algorithm", "RandomForest")
    mlflow.log_param("max_depth", 10)
    
    # Train model
    model = train_model()
    
    # Log metrics
    mlflow.log_metric("accuracy", accuracy)
    mlflow.log_metric("precision", precision)
    
    # Log model
    mlflow.sklearn.log_model(model, "model")
```

## Deployment Guide

### Docker Deployment
```bash
# Build image
docker build -t banking-analytics:latest .

# Run container
docker run -p 8501:8501 banking-analytics:latest
```

### Kubernetes Deployment
```bash
# Apply Kubernetes configuration
kubectl apply -f k8s-deployment.yaml

# Check deployment status
kubectl get pods -n banking-analytics

# Access the application
kubectl port-forward svc/dashboard-service 8501:8501 -n banking-analytics
```

### Production Deployment
```bash
# Run deployment script
./deploy.sh v1.0.0 production deploy

# Monitor deployment
kubectl logs -f deployment/banking-analytics-dashboard -n banking-analytics
```

## Monitoring & Logging

### Application Metrics
- **Performance**: Response time, throughput, error rate
- **Business**: Customer satisfaction, conversion rate, revenue
- **Technical**: CPU usage, memory usage, disk usage
- **Model**: Accuracy, precision, recall, drift

### Logging Configuration
```python
import logging
import structlog

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)
```

### Alerting Rules
```yaml
# Prometheus alerting rules
groups:
- name: banking-analytics
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      
  - alert: ModelDrift
    expr: model_drift_score > 0.1
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "Model drift detected"
```

## Testing

### Unit Tests
```python
import pytest
from src.models.churn_predictor import ChurnPredictor

def test_churn_predictor():
    """Test churn prediction model"""
    predictor = ChurnPredictor()
    
    # Test data
    test_data = {
        'account_balance': 5000,
        'credit_limit': 10000,
        'age': 35,
        'transaction_amount': 250
    }
    
    # Test prediction
    prediction = predictor.predict(test_data)
    
    # Assertions
    assert 0 <= prediction <= 1
    assert isinstance(prediction, float)
```

### Integration Tests
```python
def test_api_endpoint():
    """Test API endpoint integration"""
    response = client.post(
        "/api/v1/models/predict",
        json={
            "customer_id": "12345",
            "features": test_features,
            "model_type": "churn_prediction"
        }
    )
    
    assert response.status_code == 200
    assert "prediction" in response.json()
```

### Performance Tests
```python
def test_model_performance():
    """Test model performance benchmarks"""
    model = load_model("churn_model_v1")
    test_data = load_test_dataset()
    
    # Measure prediction time
    start_time = time.time()
    predictions = model.predict(test_data)
    end_time = time.time()
    
    # Assert performance requirements
    assert (end_time - start_time) < 1.0  # Less than 1 second
    assert len(predictions) == len(test_data)
```

### Running Tests
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/test_models.py

# Run with verbose output
pytest -v
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check database status
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
python scripts/test_db_connection.py
```

#### 2. Model Loading Errors
```python
# Check model file exists
import os
model_path = "models/churn_model.pkl"
if not os.path.exists(model_path):
    print(f"Model file not found: {model_path}")

# Check model compatibility
import joblib
try:
    model = joblib.load(model_path)
    print("Model loaded successfully")
except Exception as e:
    print(f"Model loading error: {e}")
```

#### 3. Memory Issues
```python
# Monitor memory usage
import psutil
memory_usage = psutil.virtual_memory()
print(f"Memory usage: {memory_usage.percent}%")

# Optimize data loading
import pandas as pd
df = pd.read_csv("data.csv", chunksize=1000)  # Load in chunks
```

### Performance Optimization

#### 1. Database Optimization
```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_customer_id ON transactions(customer_id);
CREATE INDEX idx_transaction_date ON transactions(transaction_date);

-- Optimize queries
EXPLAIN ANALYZE SELECT * FROM customers WHERE age > 30;
```

#### 2. Model Optimization
```python
# Use model compression
import joblib
from sklearn.decomposition import PCA

# Compress model
pca = PCA(n_components=0.95)
compressed_features = pca.fit_transform(features)

# Save compressed model
joblib.dump((model, pca), "compressed_model.pkl")
```

#### 3. Caching
```python
from functools import lru_cache
import redis

# Redis caching
redis_client = redis.Redis(host='localhost', port=6379, db=0)

def get_cached_prediction(customer_id):
    """Get prediction from cache"""
    cache_key = f"prediction:{customer_id}"
    cached_result = redis_client.get(cache_key)
    
    if cached_result:
        return json.loads(cached_result)
    
    return None

def cache_prediction(customer_id, prediction):
    """Cache prediction result"""
    cache_key = f"prediction:{customer_id}"
    redis_client.setex(cache_key, 3600, json.dumps(prediction))  # 1 hour TTL
```

## Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

### Code Standards
- Follow PEP 8 style guide
- Use type hints for function parameters and return values
- Write comprehensive docstrings
- Maintain test coverage above 80%

### Pre-commit Hooks
```bash
# Install pre-commit hooks
pre-commit install

# Run hooks manually
pre-commit run --all-files
```

### Pull Request Process
1. Ensure all tests pass
2. Update documentation if needed
3. Add appropriate labels
4. Request review from team members
5. Address feedback and merge

---

## Support

For technical support or questions:
- **Email**: tech-support@banking-analytics.com
- **Slack**: #banking-analytics-support
- **Documentation**: https://docs.banking-analytics.com
- **Issues**: https://github.com/your-org/banking-analytics/issues

---

*Last updated: December 2024*
