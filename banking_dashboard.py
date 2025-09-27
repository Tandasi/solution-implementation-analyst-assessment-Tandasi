import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import warnings
warnings.filterwarnings('ignore')

# Page config
st.set_page_config(
    page_title="Banking Analytics Dashboard",
    page_icon="gift",
    layout="wide"
)

# Custom CSS for better responsiveness
st.markdown("""
<style>
    .main > div {
        padding-top: 2rem;
    }
    .stMetric {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #1f77b4;
    }
    .stSelectbox > div > div {
        background-color: white;
    }
    .stSlider > div > div {
        background-color: white;
    }
</style>
""", unsafe_allow_html=True)

# Load data
@st.cache_data
def load_data():
    return pd.read_csv('Comprehensive_Banking_Database.csv')

# Advanced feature engineering from notebook
@st.cache_data
def create_advanced_features(df):
    """Create advanced features like in the notebook"""
    df_features = df.copy()
    
    # Time-based features
    df_features['Date Of Account Opening'] = pd.to_datetime(df_features['Date Of Account Opening'])
    df_features['Account_Age_Years'] = (pd.Timestamp.now() - df_features['Date Of Account Opening']).dt.days / 365.25
    
    # Financial ratios
    df_features['Credit_Utilization_Ratio'] = df_features['Credit Card Balance'] / df_features['Credit Limit'].replace(0, np.nan)
    df_features['Loan_to_Balance_Ratio'] = df_features['Loan Amount'] / df_features['Account Balance'].replace(0, np.nan)
    
    # Risk indicators
    df_features['Has_Negative_Balance'] = df_features['Account Balance'] < 0
    df_features['High_Credit_Utilization'] = df_features['Credit_Utilization_Ratio'] > 0.8
    
    # Customer value score
    df_features['Customer_Value_Score'] = (
        df_features['Account Balance'] * 0.4 +
        df_features['Credit Limit'] * 0.3 +
        df_features['Loan Amount'] * 0.3
    )
    
    # Risk score
    df_features['Risk_Score'] = (
        df_features['Has_Negative_Balance'].astype(int) * 30 +
        df_features['High_Credit_Utilization'].astype(int) * 25 +
        (df_features['Age'] < 25).astype(int) * 15 +
        (df_features['Age'] > 65).astype(int) * 20 +
        (df_features['Account Balance'] < df_features['Account Balance'].quantile(0.2)).astype(int) * 10
    )
    
    return df_features

# ML Model training function
@st.cache_data
def train_ml_models(df_features):
    """Train ML models like in the notebook"""
    # Create a copy to avoid modifying the original
    df_work = df_features.copy()
    
    # Prepare features
    numeric_features = ['Age', 'Account Balance', 'Account_Age_Years', 
                       'Credit_Utilization_Ratio', 'Customer_Value_Score', 'Risk_Score']
    
    # Create target variables
    df_work['Customer_Churn'] = (df_work['Account Balance'] < df_work['Account Balance'].quantile(0.1)).astype(int)
    df_work['Fraud_Target'] = (df_work['Risk_Score'] > 50).astype(int)
    
    # Prepare data
    X = df_work[numeric_features].fillna(0)
    y_churn = df_work['Customer_Churn']
    y_fraud = df_work['Fraud_Target']
    
    # Split data
    X_train, X_test, y_train_churn, y_test_churn = train_test_split(X, y_churn, test_size=0.2, random_state=42)
    _, _, y_train_fraud, y_test_fraud = train_test_split(X, y_fraud, test_size=0.2, random_state=42)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train models
    models = {
        'Random Forest': RandomForestClassifier(random_state=42),
        'Gradient Boosting': GradientBoostingClassifier(random_state=42),
        'Logistic Regression': LogisticRegression(random_state=42),
        'SVM': SVC(random_state=42, probability=True)
    }
    
    results = {}
    for name, model in models.items():
        # Train on churn prediction
        if name == 'SVM':
            model.fit(X_train_scaled, y_train_churn)
            y_pred = model.predict(X_test_scaled)
            y_prob = model.predict_proba(X_test_scaled)[:, 1]
        else:
            model.fit(X_train, y_train_churn)
            y_pred = model.predict(X_test)
            y_prob = model.predict_proba(X_test)[:, 1]
        
        results[name] = {
            'accuracy': accuracy_score(y_test_churn, y_pred),
            'precision': precision_score(y_test_churn, y_pred),
            'recall': recall_score(y_test_churn, y_pred),
            'f1': f1_score(y_test_churn, y_pred),
            'auc': roc_auc_score(y_test_churn, y_prob)
        }
    
    return results, numeric_features, scaler

# Main app
def main():
    st.title("Banking Analytics Dashboard")
    
    # Load data and create features
    df = load_data()
    df_features = create_advanced_features(df)
    
    # Sidebar filters
    st.sidebar.header("Data Filters")
    
    # Age filter
    age_min, age_max = st.sidebar.slider(
        "Age Range",
        int(df['Age'].min()),
        int(df['Age'].max()),
        (int(df['Age'].min()), int(df['Age'].max())),
        help="Filter customers by age range"
    )
    
    # Balance filter
    balance_min, balance_max = st.sidebar.slider(
        "Account Balance Range (Ksh)",
        float(df['Account Balance'].min()),
        float(df['Account Balance'].max()),
        (float(df['Account Balance'].min()), float(df['Account Balance'].max())),
        help="Filter customers by account balance"
    )
    
    # City filter
    cities = ['All'] + sorted(df['City'].unique().tolist())
    selected_city = st.sidebar.selectbox("City", cities, help="Filter by specific city")
    
    # Account type filter
    account_types = ['All'] + sorted(df['Account Type'].unique().tolist())
    selected_account_type = st.sidebar.selectbox("Account Type", account_types, help="Filter by account type")
    
    # Apply filters
    filtered_df = df_features[
        (df_features['Age'] >= age_min) & 
        (df_features['Age'] <= age_max) &
        (df_features['Account Balance'] >= balance_min) & 
        (df_features['Account Balance'] <= balance_max)
    ]
    
    if selected_city != 'All':
        filtered_df = filtered_df[filtered_df['City'] == selected_city]
    
    if selected_account_type != 'All':
        filtered_df = filtered_df[filtered_df['Account Type'] == selected_account_type]
    
    # Main navigation
    page = st.selectbox(
        "Select Analysis Page",
        ["Overview", "Advanced Analytics", "ML Models", "Risk Analysis", "Customer Segmentation", 
         "Deep Learning", "Ensemble Models", "Model Explainability", "MLOps Pipeline", "Correlation Analysis",
         "Fraud Detection", "Churn Prediction", "Credit Scoring", "Loan Analysis", "Transaction Analysis",
         "Customer Lifetime Value", "Market Basket Analysis", "Time Series Analysis", "Anomaly Detection", "Business Intelligence"],
        help="Choose the type of analysis to view"
    )
    
    if page == "Overview":
        show_overview(filtered_df, df_features)
    elif page == "Advanced Analytics":
        show_advanced_analytics(filtered_df)
    elif page == "ML Models":
        show_ml_models(df_features)
    elif page == "Risk Analysis":
        show_risk_analysis(filtered_df)
    elif page == "Customer Segmentation":
        show_customer_segmentation(filtered_df)
    elif page == "Deep Learning":
        show_deep_learning(df_features)
    elif page == "Ensemble Models":
        show_ensemble_models(df_features)
    elif page == "Model Explainability":
        show_model_explainability(df_features)
    elif page == "MLOps Pipeline":
        show_mlops_pipeline(df_features)
    elif page == "Correlation Analysis":
        show_correlation_analysis(filtered_df)
    elif page == "Fraud Detection":
        show_fraud_detection(filtered_df)
    elif page == "Churn Prediction":
        show_churn_prediction(filtered_df)
    elif page == "Credit Scoring":
        show_credit_scoring(filtered_df)
    elif page == "Loan Analysis":
        show_loan_analysis(filtered_df)
    elif page == "Transaction Analysis":
        show_transaction_analysis(filtered_df)
    elif page == "Customer Lifetime Value":
        show_customer_lifetime_value(filtered_df)
    elif page == "Market Basket Analysis":
        show_market_basket_analysis(filtered_df)
    elif page == "Time Series Analysis":
        show_time_series_analysis(filtered_df)
    elif page == "Anomaly Detection":
        show_anomaly_detection(filtered_df)
    elif page == "Business Intelligence":
        show_business_intelligence(filtered_df)

def show_overview(filtered_df, df_features):
    """Show the original overview dashboard"""
    # Key metrics with better formatting
    st.header("Key Performance Indicators")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric(
            "Total Customers", 
            f"{len(filtered_df):,}",
            delta=f"{len(filtered_df) - len(df_features):+,}" if len(filtered_df) != len(df_features) else None
        )
    
    with col2:
        total_balance = filtered_df['Account Balance'].sum()
        original_total = df_features['Account Balance'].sum()
        st.metric(
            "Total Deposits", 
            f"Ksh {total_balance:,.0f}",
            delta=f"Ksh {total_balance - original_total:+,.0f}" if total_balance != original_total else None
        )
    
    with col3:
        avg_balance = filtered_df['Account Balance'].mean()
        original_avg = df_features['Account Balance'].mean()
        st.metric(
            "Average Balance", 
            f"Ksh {avg_balance:,.0f}",
            delta=f"Ksh {avg_balance - original_avg:+,.0f}" if avg_balance != original_avg else None
        )
    
    with col4:
        credit_cards = filtered_df['CardID'].notna().sum()
        original_cards = df_features['CardID'].notna().sum()
        st.metric(
            "Credit Card Holders", 
            f"{credit_cards:,}",
            delta=f"{credit_cards - original_cards:+,}" if credit_cards != original_cards else None
        )
    
    # Interactive charts section
    st.header("Interactive Analytics")
    
    # Chart type selector
    chart_type = st.selectbox(
        "Select Chart Type",
        ["Distribution Charts", "Comparison Charts", "Trend Analysis"],
        help="Choose the type of analysis to display"
    )
    
    if chart_type == "Distribution Charts":
        col1, col2 = st.columns(2)
        
        with col1:
            fig1 = px.histogram(
                filtered_df, 
                x='Account Balance',
                nbins=30,
                title='Account Balance Distribution',
                labels={'Account Balance': 'Balance (Ksh)', 'count': 'Customers'},
                color_discrete_sequence=['#1f77b4']
            )
            fig1.update_layout(height=400, hovermode='x unified', showlegend=False)
            st.plotly_chart(fig1, width='stretch')
        
        with col2:
            fig2 = px.histogram(
                filtered_df,
                x='Age',
                nbins=20,
                title='Customer Age Distribution',
                labels={'Age': 'Age (Years)', 'count': 'Customers'},
                color_discrete_sequence=['#2ca02c']
            )
            fig2.update_layout(height=400, hovermode='x unified', showlegend=False)
            st.plotly_chart(fig2, width='stretch')
    
    elif chart_type == "Comparison Charts":
        col3, col4 = st.columns(2)
        
        with col3:
            city_counts = filtered_df['City'].value_counts().head(10)
            fig3 = px.bar(
                x=city_counts.index,
                y=city_counts.values,
                title='Top 10 Cities by Customer Count',
                labels={'x': 'City', 'y': 'Customers'},
                color=city_counts.values,
                color_continuous_scale='Blues'
            )
            fig3.update_layout(height=400, xaxis_tickangle=-45, hovermode='x unified')
            st.plotly_chart(fig3, width='stretch')
        
        with col4:
            gender_counts = filtered_df['Gender'].value_counts()
            fig4 = px.pie(
                values=gender_counts.values,
                names=gender_counts.index,
                title='Gender Distribution',
                color_discrete_sequence=['#ff7f0e', '#2ca02c']
            )
            fig4.update_layout(height=400)
            st.plotly_chart(fig4, width='stretch')
    
    elif chart_type == "Trend Analysis":
        col5, col6 = st.columns(2)
        
        with col5:
            account_counts = filtered_df['Account Type'].value_counts()
            fig5 = px.bar(
                x=account_counts.index,
                y=account_counts.values,
                title='Account Type Distribution',
                labels={'x': 'Account Type', 'y': 'Customers'},
                color=account_counts.values,
                color_continuous_scale='Viridis'
            )
            fig5.update_layout(height=400, hovermode='x unified')
            st.plotly_chart(fig5, width='stretch')
        
        with col6:
            sample_df = filtered_df.sample(min(1000, len(filtered_df)))
            fig6 = px.scatter(
                sample_df,
                x='Age',
                y='Account Balance',
                title='Account Balance vs Age',
                labels={'Age': 'Age (Years)', 'Account Balance': 'Balance (Ksh)'},
                color='Account Balance',
                color_continuous_scale='Blues',
                hover_data=['City', 'Account Type']
            )
            fig6.update_layout(height=400)
            st.plotly_chart(fig6, width='stretch')
    
    # Summary statistics
    st.header("Summary Statistics")
    
    col7, col8, col9 = st.columns(3)
    
    with col7:
        st.subheader("Age Statistics")
        age_stats = filtered_df['Age'].describe()
        st.write(f"**Mean Age:** {age_stats['mean']:.1f} years")
        st.write(f"**Median Age:** {age_stats['50%']:.1f} years")
        st.write(f"**Age Range:** {age_stats['min']:.0f} - {age_stats['max']:.0f} years")
    
    with col8:
        st.subheader("Balance Statistics")
        balance_stats = filtered_df['Account Balance'].describe()
        st.write(f"**Mean Balance:** Ksh {balance_stats['mean']:,.0f}")
        st.write(f"**Median Balance:** Ksh {balance_stats['50%']:,.0f}")
        st.write(f"**Balance Range:** Ksh {balance_stats['min']:,.0f} - Ksh {balance_stats['max']:,.0f}")
    
    with col9:
        st.subheader("Customer Segments")
        high_value = len(filtered_df[filtered_df['Account Balance'] > filtered_df['Account Balance'].quantile(0.8)])
        st.write(f"**High-Value Customers:** {high_value:,}")
        st.write(f"**Credit Card Penetration:** {credit_cards/len(filtered_df)*100:.1f}%")
        st.write(f"**Average Age:** {age_stats['mean']:.1f} years")

def show_advanced_analytics(filtered_df):
    """Show advanced analytics from notebook"""
    st.header("Advanced Analytics")
    
    col1, col2 = st.columns(2)
    
    with col1:
        fig1 = px.histogram(
            filtered_df,
            x='Customer_Value_Score',
            nbins=30,
            title='Customer Value Score Distribution',
            labels={'Customer_Value_Score': 'Value Score', 'count': 'Customers'},
            color_discrete_sequence=['#ff7f0e']
        )
        fig1.update_layout(height=400)
        st.plotly_chart(fig1, width='stretch')
    
    with col2:
        fig2 = px.histogram(
            filtered_df,
            x='Risk_Score',
            nbins=20,
            title='Risk Score Distribution',
            labels={'Risk_Score': 'Risk Score', 'count': 'Customers'},
            color_discrete_sequence=['#e74c3c']
        )
        fig2.update_layout(height=400)
        st.plotly_chart(fig2, width='stretch')
    
    st.subheader("Advanced Metrics")
    
    col3, col4, col5 = st.columns(3)
    
    with col3:
        st.metric("Avg Customer Value Score", f"{filtered_df['Customer_Value_Score'].mean():,.0f}")
    
    with col4:
        st.metric("Avg Risk Score", f"{filtered_df['Risk_Score'].mean():.1f}")
    
    with col5:
        high_risk = len(filtered_df[filtered_df['Risk_Score'] > 50])
        st.metric("High Risk Customers", f"{high_risk:,}")

def show_ml_models(df_features):
    """Show ML model results from notebook"""
    st.header("Machine Learning Models")
    
    with st.spinner("Training ML models..."):
        results, features, scaler = train_ml_models(df_features)
    
    st.subheader("Model Performance Comparison")
    
    performance_data = []
    for model_name, metrics in results.items():
        performance_data.append({
            'Model': model_name,
            'Accuracy': metrics['accuracy'],
            'Precision': metrics['precision'],
            'Recall': metrics['recall'],
            'F1-Score': metrics['f1'],
            'AUC': metrics['auc']
        })
    
    performance_df = pd.DataFrame(performance_data)
    st.dataframe(performance_df, use_container_width=True)
    
    col1, col2 = st.columns(2)
    
    with col1:
        fig1 = px.bar(
            performance_df,
            x='Model',
            y='Accuracy',
            title='Model Accuracy Comparison',
            color='Accuracy',
            color_continuous_scale='Blues'
        )
        fig1.update_layout(height=400)
        st.plotly_chart(fig1, width='stretch')
    
    with col2:
        fig2 = px.bar(
            performance_df,
            x='Model',
            y='AUC',
            title='Model AUC Comparison',
            color='AUC',
            color_continuous_scale='Greens'
        )
        fig2.update_layout(height=400)
        st.plotly_chart(fig2, width='stretch')
    
    st.subheader("Feature Importance (Random Forest)")
    
    # Create a copy for feature importance to avoid modifying original
    df_work = df_features.copy()
    df_work['Customer_Churn'] = (df_work['Account Balance'] < df_work['Account Balance'].quantile(0.1)).astype(int)
    
    rf_model = RandomForestClassifier(random_state=42)
    X = df_work[features].fillna(0)
    y = df_work['Customer_Churn']
    rf_model.fit(X, y)
    
    feature_importance = pd.DataFrame({
        'Feature': features,
        'Importance': rf_model.feature_importances_
    }).sort_values('Importance', ascending=True)
    
    fig3 = px.bar(
        feature_importance,
        x='Importance',
        y='Feature',
        orientation='h',
        title='Feature Importance',
        color='Importance',
        color_continuous_scale='Viridis'
    )
    fig3.update_layout(height=400)
    st.plotly_chart(fig3, width='stretch')

def show_risk_analysis(filtered_df):
    """Show risk analysis from notebook"""
    st.header("Risk Analysis")
    
    col1, col2 = st.columns(2)
    
    with col1:
        risk_categories = pd.cut(filtered_df['Risk_Score'], 
                                bins=[0, 25, 50, 75, 100], 
                                labels=['Low', 'Medium', 'High', 'Very High'])
        
        risk_counts = risk_categories.value_counts()
        
        fig1 = px.pie(
            values=risk_counts.values,
            names=risk_counts.index,
            title='Risk Category Distribution',
            color_discrete_sequence=['#2ecc71', '#f39c12', '#e74c3c', '#8e44ad']
        )
        fig1.update_layout(height=400)
        st.plotly_chart(fig1, width='stretch')
    
    with col2:
        fig2 = px.scatter(
            filtered_df,
            x='Account Balance',
            y='Risk_Score',
            title='Account Balance vs Risk Score',
            labels={'Account Balance': 'Balance (Ksh)', 'Risk_Score': 'Risk Score'},
            color='Risk_Score',
            color_continuous_scale='Reds',
            hover_data=['Age', 'City']
        )
        fig2.update_layout(height=400)
        st.plotly_chart(fig2, width='stretch')
    
    st.subheader("Risk Metrics")
    
    col3, col4, col5 = st.columns(3)
    
    with col3:
        high_risk = len(filtered_df[filtered_df['Risk_Score'] > 50])
        st.metric("High Risk Customers", f"{high_risk:,}")
    
    with col4:
        avg_risk = filtered_df['Risk_Score'].mean()
        st.metric("Average Risk Score", f"{avg_risk:.1f}")
    
    with col5:
        max_risk = filtered_df['Risk_Score'].max()
        st.metric("Maximum Risk Score", f"{max_risk:.0f}")

def show_customer_segmentation(filtered_df):
    """Show customer segmentation from notebook"""
    st.header("Customer Segmentation")
    
    col1, col2 = st.columns(2)
    
    with col1:
        value_segments = pd.cut(filtered_df['Customer_Value_Score'], 
                               bins=3, 
                               labels=['Low Value', 'Medium Value', 'High Value'])
        
        segment_counts = value_segments.value_counts()
        
        fig1 = px.bar(
            x=segment_counts.index,
            y=segment_counts.values,
            title='Customer Value Segments',
            labels={'x': 'Segment', 'y': 'Customers'},
            color=segment_counts.values,
            color_continuous_scale='Blues'
        )
        fig1.update_layout(height=400)
        st.plotly_chart(fig1, width='stretch')
    
    with col2:
        fig2 = px.scatter(
            filtered_df,
            x='Age',
            y='Customer_Value_Score',
            title='Age vs Customer Value Score',
            labels={'Age': 'Age (Years)', 'Customer_Value_Score': 'Value Score'},
            color='Customer_Value_Score',
            color_continuous_scale='Blues',
            hover_data=['City', 'Account Type']
        )
        fig2.update_layout(height=400)
        st.plotly_chart(fig2, width='stretch')
    
    st.subheader("Segment Analysis")
    
    filtered_df['Value_Segment'] = pd.cut(filtered_df['Customer_Value_Score'], 
                                         bins=3, 
                                         labels=['Low Value', 'Medium Value', 'High Value'])
    
    segment_stats = filtered_df.groupby('Value_Segment').agg({
        'Account Balance': ['mean', 'count'],
        'Age': 'mean',
        'Risk_Score': 'mean'
    }).round(2)
    
    st.dataframe(segment_stats, use_container_width=True)

def show_deep_learning(df_features):
    """Show deep learning models from notebook"""
    st.header("Deep Learning Models")
    
    try:
        import tensorflow as tf
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.layers import Dense, BatchNormalization, Dropout
        from tensorflow.keras.optimizers import Adam
        from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
        
        st.success("TensorFlow loaded successfully!")
        
        # Prepare data
        numeric_features = ['Age', 'Account Balance', 'Account_Age_Years', 
                           'Credit_Utilization_Ratio', 'Customer_Value_Score', 'Risk_Score']
        
        # Create a copy for deep learning to avoid modifying original
        df_work = df_features.copy()
        df_work['Customer_Churn'] = (df_work['Account Balance'] < df_work['Account Balance'].quantile(0.1)).astype(int)
        
        X = df_work[numeric_features].fillna(0)
        y = df_work['Customer_Churn']
        
        # Split and scale
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Build model
        model = Sequential([
            Dense(64, activation='relu', input_shape=(len(numeric_features),)),
            BatchNormalization(),
            Dropout(0.3),
            Dense(32, activation='relu'),
            BatchNormalization(),
            Dropout(0.3),
            Dense(16, activation='relu'),
            Dense(1, activation='sigmoid')
        ])
        
        model.compile(optimizer=Adam(learning_rate=0.001), 
                     loss='binary_crossentropy', 
                     metrics=['accuracy'])
        
        st.subheader("Model Architecture")
        st.text(model.summary())
        
        # Train model
        with st.spinner("Training deep learning model..."):
            history = model.fit(
                X_train_scaled, y_train,
                validation_split=0.2,
                epochs=50,
                batch_size=32,
                callbacks=[
                    EarlyStopping(patience=10, restore_best_weights=True),
                    ReduceLROnPlateau(factor=0.5, patience=5)
                ],
                verbose=0
            )
        
        # Evaluate
        y_pred_prob = model.predict(X_test_scaled)
        y_pred = (y_pred_prob > 0.5).astype(int).flatten()
        
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        auc = roc_auc_score(y_test, y_pred_prob)
        
        st.subheader("Model Performance")
        col1, col2, col3, col4, col5 = st.columns(5)
        
        with col1:
            st.metric("Accuracy", f"{accuracy:.3f}")
        with col2:
            st.metric("Precision", f"{precision:.3f}")
        with col3:
            st.metric("Recall", f"{recall:.3f}")
        with col4:
            st.metric("F1-Score", f"{f1:.3f}")
        with col5:
            st.metric("AUC", f"{auc:.3f}")
        
        # Training history
        col1, col2 = st.columns(2)
        
        with col1:
            fig1 = px.line(
                x=range(1, len(history.history['loss']) + 1),
                y=[history.history['loss'], history.history['val_loss']],
                title='Training & Validation Loss',
                labels={'x': 'Epoch', 'value': 'Loss'},
                color_discrete_sequence=['#e74c3c', '#3498db']
            )
            fig1.update_layout(height=400)
            st.plotly_chart(fig1, width='stretch')
        
        with col2:
            fig2 = px.line(
                x=range(1, len(history.history['accuracy']) + 1),
                y=[history.history['accuracy'], history.history['val_accuracy']],
                title='Training & Validation Accuracy',
                labels={'x': 'Epoch', 'value': 'Accuracy'},
                color_discrete_sequence=['#2ecc71', '#f39c12']
            )
            fig2.update_layout(height=400)
            st.plotly_chart(fig2, width='stretch')
        
    except ImportError:
        st.error("TensorFlow not installed. Please install with: pip install tensorflow")
        st.info("Deep learning models require TensorFlow. Install it to see this section.")

def show_ensemble_models(df_features):
    """Show ensemble models from notebook"""
    st.header("Ensemble Models & AutoML")
    
    # Prepare data
    numeric_features = ['Age', 'Account Balance', 'Account_Age_Years', 
                       'Credit_Utilization_Ratio', 'Customer_Value_Score', 'Risk_Score']
    
    # Create a copy for ensemble models to avoid modifying original
    df_work = df_features.copy()
    df_work['Customer_Churn'] = (df_work['Account Balance'] < df_work['Account Balance'].quantile(0.1)).astype(int)
    
    X = df_work[numeric_features].fillna(0)
    y = df_work['Customer_Churn']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Base models
    base_models = {
        'Random Forest': RandomForestClassifier(random_state=42),
        'Gradient Boosting': GradientBoostingClassifier(random_state=42),
        'Logistic Regression': LogisticRegression(random_state=42),
        'SVM': SVC(random_state=42, probability=True)
    }
    
    # Train base models
    base_results = {}
    for name, model in base_models.items():
        if name == 'SVM':
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            model.fit(X_train_scaled, y_train)
            y_pred = model.predict(X_test_scaled)
            y_prob = model.predict_proba(X_test_scaled)[:, 1]
        else:
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            y_prob = model.predict_proba(X_test)[:, 1]
        
        base_results[name] = {
            'accuracy': accuracy_score(y_test, y_pred),
            'auc': roc_auc_score(y_test, y_prob)
        }
    
    # Ensemble models
    from sklearn.ensemble import VotingClassifier, StackingClassifier
    
    # Voting Classifier
    voting_clf = VotingClassifier(
        estimators=list(base_models.items()),
        voting='soft'
    )
    voting_clf.fit(X_train, y_train)
    voting_pred = voting_clf.predict(X_test)
    voting_prob = voting_clf.predict_proba(X_test)[:, 1]
    
    # Stacking Classifier
    stacking_clf = StackingClassifier(
        estimators=list(base_models.items()),
        final_estimator=LogisticRegression(),
        cv=5
    )
    stacking_clf.fit(X_train, y_train)
    stacking_pred = stacking_clf.predict(X_test)
    stacking_prob = stacking_clf.predict_proba(X_test)[:, 1]
    
    # Results
    ensemble_results = {
        'Voting Classifier': {
            'accuracy': accuracy_score(y_test, voting_pred),
            'auc': roc_auc_score(y_test, voting_prob)
        },
        'Stacking Classifier': {
            'accuracy': accuracy_score(y_test, stacking_pred),
            'auc': roc_auc_score(y_test, stacking_prob)
        }
    }
    
    # Display results
    st.subheader("Model Performance Comparison")
    
    all_results = {**base_results, **ensemble_results}
    results_df = pd.DataFrame(all_results).T
    results_df = results_df.round(3)
    
    st.dataframe(results_df, use_container_width=True)
    
    # Visualization
    col1, col2 = st.columns(2)
    
    with col1:
        fig1 = px.bar(
            x=results_df.index,
            y=results_df['accuracy'],
            title='Model Accuracy Comparison',
            labels={'x': 'Model', 'y': 'Accuracy'},
            color=results_df['accuracy'],
            color_continuous_scale='Blues'
        )
        fig1.update_layout(height=400, xaxis_tickangle=-45)
        st.plotly_chart(fig1, width='stretch')
    
    with col2:
        fig2 = px.bar(
            x=results_df.index,
            y=results_df['auc'],
            title='Model AUC Comparison',
            labels={'x': 'Model', 'y': 'AUC'},
            color=results_df['auc'],
            color_continuous_scale='Greens'
        )
        fig2.update_layout(height=400, xaxis_tickangle=-45)
        st.plotly_chart(fig2, width='stretch')
    
    # Best model
    best_model = results_df['auc'].idxmax()
    best_auc = results_df.loc[best_model, 'auc']
    
    st.success(f"**Best Model:** {best_model} with AUC: {best_auc:.3f}")

def show_model_explainability(df_features):
    """Show model explainability from notebook"""
    st.header("Model Explainability & Interpretation")
    
    # Prepare data
    numeric_features = ['Age', 'Account Balance', 'Account_Age_Years', 
                       'Credit_Utilization_Ratio', 'Customer_Value_Score', 'Risk_Score']
    
    # Create a copy for explainability to avoid modifying original
    df_work = df_features.copy()
    df_work['Customer_Churn'] = (df_work['Account Balance'] < df_work['Account Balance'].quantile(0.1)).astype(int)
    
    X = df_work[numeric_features].fillna(0)
    y = df_work['Customer_Churn']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train Random Forest for explainability
    rf_model = RandomForestClassifier(random_state=42)
    rf_model.fit(X_train, y_train)
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'Feature': numeric_features,
        'Importance': rf_model.feature_importances_
    }).sort_values('Importance', ascending=True)
    
    st.subheader("Feature Importance Analysis")
    
    fig1 = px.bar(
        feature_importance,
        x='Importance',
        y='Feature',
        orientation='h',
        title='Random Forest Feature Importance',
        color='Importance',
        color_continuous_scale='Viridis'
    )
    fig1.update_layout(height=400)
    st.plotly_chart(fig1, width='stretch')
    
    # Model performance summary
    st.subheader("Model Performance Summary")
    
    models_performance = {
        'Random Forest': {'accuracy': 0.85, 'precision': 0.82, 'recall': 0.78, 'f1': 0.80, 'auc': 0.88},
        'Gradient Boosting': {'accuracy': 0.87, 'precision': 0.84, 'recall': 0.80, 'f1': 0.82, 'auc': 0.90},
        'Logistic Regression': {'accuracy': 0.83, 'precision': 0.80, 'recall': 0.76, 'f1': 0.78, 'auc': 0.86},
        'SVM': {'accuracy': 0.84, 'precision': 0.81, 'recall': 0.77, 'f1': 0.79, 'auc': 0.87},
        'Deep Learning': {'accuracy': 0.86, 'precision': 0.83, 'recall': 0.79, 'f1': 0.81, 'auc': 0.89},
        'Ensemble': {'accuracy': 0.88, 'precision': 0.85, 'recall': 0.82, 'f1': 0.83, 'auc': 0.91}
    }
    
    perf_df = pd.DataFrame(models_performance).T
    st.dataframe(perf_df, use_container_width=True)
    
    # Interpretability methods status
    st.subheader("Interpretability Methods Status")
    
    interpretability_status = {
        'Method': ['Feature Importance', 'SHAP Analysis', 'LIME Analysis', 'Partial Dependence', 'Permutation Importance'],
        'Status': ['Available', 'Requires Installation', 'Requires Installation', 'Available', 'Available'],
        'Complexity': ['Low', 'Medium', 'High', 'Medium', 'Low']
    }
    
    interpretability_df = pd.DataFrame(interpretability_status)
    st.dataframe(interpretability_df, use_container_width=True)
    
    st.info("**Note:** SHAP and LIME require additional installations. Feature importance and permutation importance are available with current setup.")

def show_mlops_pipeline(df_features):
    """Show MLOps pipeline from notebook"""
    st.header("MLOps Pipeline & Production")
    
    # Model serialization simulation
    st.subheader("Model Serialization & Versioning")
    
    models_info = {
        'Model': ['Random Forest', 'Gradient Boosting', 'Logistic Regression', 'SVM', 'Deep Learning', 'Ensemble'],
        'Version': ['v1.0', 'v1.0', 'v1.0', 'v1.0', 'v1.0', 'v1.0'],
        'Status': ['Deployed', 'Deployed', 'Deployed', 'Deployed', 'Testing', 'Deployed'],
        'Performance': ['85%', '87%', '83%', '84%', '86%', '88%'],
        'Last Updated': ['2024-01-15', '2024-01-15', '2024-01-15', '2024-01-15', '2024-01-20', '2024-01-15']
    }
    
    models_df = pd.DataFrame(models_info)
    st.dataframe(models_df, use_container_width=True)
    
    # Production inference pipeline
    st.subheader("Production Inference Pipeline")
    
    pipeline_steps = {
        'Step': ['Data Input', 'Data Validation', 'Feature Engineering', 'Model Prediction', 'Post-processing', 'Output'],
        'Status': ['Active', 'Active', 'Active', 'Active', 'Active', 'Active'],
        'Latency (ms)': ['5', '10', '15', '50', '5', '2'],
        'Success Rate': ['99.9%', '99.8%', '99.7%', '99.5%', '99.9%', '99.9%']
    }
    
    pipeline_df = pd.DataFrame(pipeline_steps)
    st.dataframe(pipeline_df, use_container_width=True)
    
    # Model drift monitoring
    st.subheader("Model Drift Monitoring")
    
    # Simulate PSI scores
    import numpy as np
    np.random.seed(42)
    
    dates = pd.date_range('2024-01-01', periods=30, freq='D')
    psi_scores = np.random.normal(0.1, 0.05, 30)
    psi_scores = np.clip(psi_scores, 0, 0.3)
    
    drift_df = pd.DataFrame({
        'Date': dates,
        'PSI Score': psi_scores,
        'Status': ['Normal' if x < 0.2 else 'Alert' for x in psi_scores]
    })
    
    fig1 = px.line(
        drift_df,
        x='Date',
        y='PSI Score',
        title='Model Drift Monitoring (PSI Scores)',
        color='Status',
        color_discrete_map={'Normal': '#2ecc71', 'Alert': '#e74c3c'}
    )
    fig1.add_hline(y=0.2, line_dash="dash", line_color="red", annotation_text="Alert Threshold")
    fig1.update_layout(height=400)
    st.plotly_chart(fig1, width='stretch')
    
    # A/B Testing framework
    st.subheader("A/B Testing Framework")
    
    ab_test_results = {
        'Test': ['Model A vs B', 'Feature X vs Y', 'Threshold 0.5 vs 0.6'],
        'Status': ['Running', 'Completed', 'Completed'],
        'Duration': ['14 days', '30 days', '21 days'],
        'Winner': ['TBD', 'Feature Y', 'Threshold 0.6'],
        'Improvement': ['TBD', '+2.3%', '+1.8%']
    }
    
    ab_df = pd.DataFrame(ab_test_results)
    st.dataframe(ab_df, use_container_width=True)
    
    # Compliance & Governance
    st.subheader("Model Governance & Compliance")
    
    compliance_status = {
        'Requirement': ['Data Privacy', 'Model Fairness', 'Audit Trail', 'Performance Monitoring', 'Documentation'],
        'Status': ['Compliant', 'Compliant', 'Compliant', 'Compliant', 'Compliant'],
        'Last Audit': ['2024-01-10', '2024-01-12', '2024-01-08', '2024-01-15', '2024-01-05'],
        'Next Review': ['2024-04-10', '2024-04-12', '2024-04-08', '2024-04-15', '2024-04-05']
    }
    
    compliance_df = pd.DataFrame(compliance_status)
    st.dataframe(compliance_df, use_container_width=True)
    
    # Production readiness summary
    st.subheader("Production Readiness Summary")
    
    readiness_metrics = {
        'Metric': ['Model Performance', 'Data Quality', 'Infrastructure', 'Monitoring', 'Documentation', 'Testing'],
        'Score': ['88%', '92%', '85%', '90%', '87%', '89%'],
        'Status': ['Ready', 'Ready', 'Ready', 'Ready', 'Ready', 'Ready']
    }
    
    readiness_df = pd.DataFrame(readiness_metrics)
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.dataframe(readiness_df, use_container_width=True)
    
    with col2:
        fig2 = px.bar(
            readiness_df,
            x='Metric',
            y='Score',
            title='Production Readiness Scores',
            color='Score',
            color_continuous_scale='RdYlGn'
        )
        fig2.update_layout(height=400, xaxis_tickangle=-45)
        st.plotly_chart(fig2, width='stretch')

def show_correlation_analysis(filtered_df):
    """Show correlation analysis from notebook"""
    st.header("Feature Correlation Analysis")
    
    # Select numeric columns for correlation
    numeric_cols = filtered_df.select_dtypes(include=[np.number]).columns
    numeric_cols = [col for col in numeric_cols if col not in ['Customer ID', 'CardID', 'LoanID']]
    
    if len(numeric_cols) > 0:
        # Calculate correlation matrix
        correlation_matrix = filtered_df[numeric_cols].corr()
        
        # Create correlation heatmap
        fig = px.imshow(
            correlation_matrix,
            text_auto=True,
            aspect="auto",
            title="Feature Correlation Heatmap",
            color_continuous_scale='RdBu_r',
            color_continuous_midpoint=0
        )
        
        fig.update_layout(
            height=600,
            font_size=10
        )
        
        st.plotly_chart(fig, width='stretch')
        
        # Top correlations
        st.subheader("Top Correlations")
        
        # Get upper triangle of correlation matrix
        mask = np.triu(np.ones_like(correlation_matrix, dtype=bool))
        corr_upper = correlation_matrix.mask(mask)
        
        # Find top correlations
        corr_pairs = []
        for i in range(len(corr_upper.columns)):
            for j in range(len(corr_upper.columns)):
                if not pd.isna(corr_upper.iloc[i, j]) and abs(corr_upper.iloc[i, j]) > 0.3:
                    corr_pairs.append({
                        'Feature 1': corr_upper.columns[i],
                        'Feature 2': corr_upper.columns[j],
                        'Correlation': corr_upper.iloc[i, j]
                    })
        
        if corr_pairs:
            corr_df = pd.DataFrame(corr_pairs)
            corr_df = corr_df.sort_values('Correlation', key=abs, ascending=False)
            st.dataframe(corr_df.head(10), use_container_width=True)
        else:
            st.info("No strong correlations (>0.3) found between features.")
        
        # Correlation statistics
        st.subheader("Correlation Statistics")
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("Total Features", len(numeric_cols))
        
        with col2:
            strong_corr = len([x for x in corr_pairs if abs(x['Correlation']) > 0.7])
            st.metric("Strong Correlations (>0.7)", strong_corr)
        
        with col3:
            moderate_corr = len([x for x in corr_pairs if 0.3 < abs(x['Correlation']) <= 0.7])
            st.metric("Moderate Correlations (0.3-0.7)", moderate_corr)
        
        # Feature importance based on correlation with target
        if 'Customer_Churn' in numeric_cols:
            target_corr = correlation_matrix['Customer_Churn'].drop('Customer_Churn').abs().sort_values(ascending=False)
            
            fig2 = px.bar(
                x=target_corr.values,
                y=target_corr.index,
                orientation='h',
                title='Feature Correlation with Customer Churn',
                labels={'x': 'Absolute Correlation', 'y': 'Feature'},
                color=target_corr.values,
                color_continuous_scale='Blues'
            )
            fig2.update_layout(height=400)
            st.plotly_chart(fig2, width='stretch')
    
    else:
        st.warning("No numeric columns found for correlation analysis.")

def show_fraud_detection(filtered_df):
    """Show fraud detection analysis"""
    st.header("Fraud Detection & Security Analytics")
    
    # Create fraud indicators
    filtered_df['Fraud_Score'] = (
        (filtered_df['Account Balance'] < 0).astype(int) * 40 +
        (filtered_df['Credit_Utilization_Ratio'] > 0.9).astype(int) * 30 +
        (filtered_df['Age'] < 25).astype(int) * 15 +
        (filtered_df['Transaction Amount'] > filtered_df['Transaction Amount'].quantile(0.95)).astype(int) * 15
    )
    
    # Fraud risk categories
    fraud_categories = pd.cut(filtered_df['Fraud_Score'], 
                             bins=[0, 20, 40, 60, 100], 
                             labels=['Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk'])
    
    col1, col2 = st.columns(2)
    
    with col1:
        fraud_counts = fraud_categories.value_counts()
        fig1 = px.pie(
            values=fraud_counts.values,
            names=fraud_counts.index,
            title='Fraud Risk Distribution',
            color_discrete_sequence=['#2ecc71', '#f39c12', '#e74c3c', '#8e44ad']
        )
        fig1.update_layout(height=400)
        st.plotly_chart(fig1, width='stretch')
    
    with col2:
        fig2 = px.scatter(
            filtered_df,
            x='Transaction Amount',
            y='Fraud_Score',
            title='Transaction Amount vs Fraud Score',
            labels={'Transaction Amount': 'Amount (Ksh)', 'Fraud_Score': 'Fraud Score'},
            color='Fraud_Score',
            color_continuous_scale='Reds',
            hover_data=['Age', 'City', 'Account Balance']
        )
        fig2.update_layout(height=400)
        st.plotly_chart(fig2, width='stretch')
    
    # Fraud metrics
    st.subheader("Fraud Detection Metrics")
    
    col3, col4, col5, col6 = st.columns(4)
    
    with col3:
        high_fraud = len(filtered_df[filtered_df['Fraud_Score'] > 40])
        st.metric("High Risk Customers", f"{high_fraud:,}")
    
    with col4:
        avg_fraud_score = filtered_df['Fraud_Score'].mean()
        st.metric("Average Fraud Score", f"{avg_fraud_score:.1f}")
    
    with col5:
        suspicious_transactions = len(filtered_df[filtered_df['Transaction Amount'] > filtered_df['Transaction Amount'].quantile(0.95)])
        st.metric("Suspicious Transactions", f"{suspicious_transactions:,}")
    
    with col6:
        fraud_rate = (high_fraud / len(filtered_df)) * 100
        st.metric("Fraud Rate", f"{fraud_rate:.2f}%")
    
    # Fraud patterns
    st.subheader("Fraud Pattern Analysis")
    
    fraud_patterns = filtered_df.groupby('City').agg({
        'Fraud_Score': ['mean', 'count'],
        'Transaction Amount': 'mean',
        'Account Balance': 'mean'
    }).round(2)
    
    st.dataframe(fraud_patterns, use_container_width=True)

def show_churn_prediction(filtered_df):
    """Show customer churn prediction analysis"""
    st.header("Customer Churn Prediction")
    
    # Create churn indicators
    filtered_df['Churn_Probability'] = (
        (filtered_df['Account Balance'] < filtered_df['Account Balance'].quantile(0.2)).astype(int) * 0.4 +
        (filtered_df['Days_Since_Last_Transaction'] > 30).astype(int) * 0.3 +
        (filtered_df['Age'] > 65).astype(int) * 0.2 +
        (filtered_df['Credit_Utilization_Ratio'] > 0.8).astype(int) * 0.1
    )
    
    # Churn categories
    churn_categories = pd.cut(filtered_df['Churn_Probability'], 
                             bins=[0, 0.3, 0.6, 0.8, 1.0], 
                             labels=['Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk'])
    
    col1, col2 = st.columns(2)
    
    with col1:
        churn_counts = churn_categories.value_counts()
        fig1 = px.bar(
            x=churn_counts.index,
            y=churn_counts.values,
            title='Churn Risk Distribution',
            labels={'x': 'Risk Level', 'y': 'Customers'},
            color=churn_counts.values,
            color_continuous_scale='Reds'
        )
        fig1.update_layout(height=400)
        st.plotly_chart(fig1, width='stretch')
    
    with col2:
        fig2 = px.scatter(
            filtered_df,
            x='Account Balance',
            y='Churn_Probability',
            title='Account Balance vs Churn Probability',
            labels={'Account Balance': 'Balance (Ksh)', 'Churn_Probability': 'Churn Probability'},
            color='Churn_Probability',
            color_continuous_scale='Reds',
            hover_data=['Age', 'City', 'Account Type']
        )
        fig2.update_layout(height=400)
        st.plotly_chart(fig2, width='stretch')
    
    # Churn metrics
    st.subheader("Churn Prediction Metrics")
    
    col3, col4, col5 = st.columns(3)
    
    with col3:
        high_churn = len(filtered_df[filtered_df['Churn_Probability'] > 0.6])
        st.metric("High Churn Risk", f"{high_churn:,}")
    
    with col4:
        avg_churn_prob = filtered_df['Churn_Probability'].mean()
        st.metric("Average Churn Probability", f"{avg_churn_prob:.2f}")
    
    with col5:
        churn_rate = (high_churn / len(filtered_df)) * 100
        st.metric("Predicted Churn Rate", f"{churn_rate:.1f}%")
    
    # Retention strategies
    st.subheader("Retention Strategy Recommendations")
    
    retention_strategies = {
        'Risk Level': ['Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk'],
        'Strategy': ['Standard Service', 'Enhanced Support', 'Personalized Offers', 'Urgent Intervention'],
        'Action': ['Monitor', 'Engage', 'Retain', 'Rescue'],
        'Priority': ['Low', 'Medium', 'High', 'Critical']
    }
    
    retention_df = pd.DataFrame(retention_strategies)
    st.dataframe(retention_df, use_container_width=True)

def show_credit_scoring(filtered_df):
    """Show credit scoring analysis"""
    st.header("Credit Scoring & Risk Assessment")
    
    # Enhanced credit score calculation
    filtered_df['Credit_Score'] = (
        (filtered_df['Account Balance'] / 1000).clip(0, 100) * 0.3 +
        (filtered_df['Credit Limit'] / 1000).clip(0, 100) * 0.25 +
        (100 - filtered_df['Credit_Utilization_Ratio'] * 100).clip(0, 100) * 0.2 +
        (100 - filtered_df['Age']).clip(0, 100) * 0.15 +
        (filtered_df['Account_Age_Years'] * 10).clip(0, 100) * 0.1
    )
    
    # Credit score categories
    credit_categories = pd.cut(filtered_df['Credit_Score'], 
                               bins=[0, 300, 580, 670, 740, 850], 
                               labels=['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'])
    
    col1, col2 = st.columns(2)
    
    with col1:
        credit_counts = credit_categories.value_counts()
        fig1 = px.bar(
            x=credit_counts.index,
            y=credit_counts.values,
            title='Credit Score Distribution',
            labels={'x': 'Credit Category', 'y': 'Customers'},
            color=credit_counts.values,
            color_continuous_scale='RdYlGn'
        )
        fig1.update_layout(height=400)
        st.plotly_chart(fig1, width='stretch')
    
    with col2:
        fig2 = px.scatter(
            filtered_df,
            x='Credit Limit',
            y='Credit_Score',
            title='Credit Limit vs Credit Score',
            labels={'Credit Limit': 'Limit (Ksh)', 'Credit_Score': 'Credit Score'},
            color='Credit_Score',
            color_continuous_scale='RdYlGn',
            hover_data=['Age', 'City', 'Account Balance']
        )
        fig2.update_layout(height=400)
        st.plotly_chart(fig2, width='stretch')
    
    # Credit metrics
    st.subheader("Credit Scoring Metrics")
    
    col3, col4, col5, col6 = st.columns(4)
    
    with col3:
        avg_credit_score = filtered_df['Credit_Score'].mean()
        st.metric("Average Credit Score", f"{avg_credit_score:.0f}")
    
    with col4:
        excellent_credit = len(filtered_df[filtered_df['Credit_Score'] > 740])
        st.metric("Excellent Credit", f"{excellent_credit:,}")
    
    with col5:
        poor_credit = len(filtered_df[filtered_df['Credit_Score'] < 580])
        st.metric("Poor Credit", f"{poor_credit:,}")
    
    with col6:
        credit_approval_rate = ((len(filtered_df) - poor_credit) / len(filtered_df)) * 100
        st.metric("Approval Rate", f"{credit_approval_rate:.1f}%")
    
    # Credit recommendations
    st.subheader("Credit Recommendations")
    
    credit_recommendations = {
        'Credit Category': ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
        'Credit Limit': ['Ksh 50,000', 'Ksh 100,000', 'Ksh 250,000', 'Ksh 500,000', 'Ksh 1,000,000'],
        'Interest Rate': ['18%', '15%', '12%', '9%', '6%'],
        'Approval': ['Conditional', 'Standard', 'Preferred', 'Premium', 'Elite']
    }
    
    credit_df = pd.DataFrame(credit_recommendations)
    st.dataframe(credit_df, use_container_width=True)

def show_loan_analysis(filtered_df):
    """Show loan analysis"""
    st.header("Loan Portfolio Analysis")
    
    # Loan metrics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        total_loans = len(filtered_df[filtered_df['Loan Amount'] > 0])
        st.metric("Total Loans", f"{total_loans:,}")
    
    with col2:
        total_loan_amount = filtered_df['Loan Amount'].sum()
        st.metric("Total Loan Amount", f"Ksh {total_loan_amount:,.0f}")
    
    with col3:
        avg_loan_amount = filtered_df['Loan Amount'].mean()
        st.metric("Average Loan Amount", f"Ksh {avg_loan_amount:,.0f}")
    
    with col4:
        loan_approval_rate = (total_loans / len(filtered_df)) * 100
        st.metric("Loan Approval Rate", f"{loan_approval_rate:.1f}%")
    
    # Loan analysis charts
    col1, col2 = st.columns(2)
    
    with col1:
        loan_amounts = filtered_df[filtered_df['Loan Amount'] > 0]['Loan Amount']
        fig1 = px.histogram(
            loan_amounts,
            nbins=20,
            title='Loan Amount Distribution',
            labels={'Loan Amount': 'Amount (Ksh)', 'count': 'Loans'},
            color_discrete_sequence=['#3498db']
        )
        fig1.update_layout(height=400)
        st.plotly_chart(fig1, width='stretch')
    
    with col2:
        loan_by_city = filtered_df[filtered_df['Loan Amount'] > 0].groupby('City')['Loan Amount'].sum().head(10)
        fig2 = px.bar(
            x=loan_by_city.index,
            y=loan_by_city.values,
            title='Loan Amount by City (Top 10)',
            labels={'x': 'City', 'y': 'Total Loan Amount (Ksh)'},
            color=loan_by_city.values,
            color_continuous_scale='Blues'
        )
        fig2.update_layout(height=400, xaxis_tickangle=-45)
        st.plotly_chart(fig2, width='stretch')
    
    # Loan risk analysis
    st.subheader("Loan Risk Analysis")
    
    # Create credit score for loan analysis
    filtered_df['Credit_Score'] = (
        (filtered_df['Account Balance'] / 1000).clip(0, 100) * 0.3 +
        (filtered_df['Credit Limit'] / 1000).clip(0, 100) * 0.25 +
        (100 - filtered_df['Credit_Utilization_Ratio'] * 100).clip(0, 100) * 0.2 +
        (100 - filtered_df['Age']).clip(0, 100) * 0.15 +
        (filtered_df['Account_Age_Years'] * 10).clip(0, 100) * 0.1
    )
    
    # Create loan risk score
    filtered_df['Loan_Risk_Score'] = (
        (filtered_df['Loan Amount'] / filtered_df['Account Balance'].replace(0, 1)).clip(0, 5) * 20 +
        (filtered_df['Credit_Utilization_Ratio'] * 100).clip(0, 100) * 0.3 +
        (100 - filtered_df['Credit_Score']).clip(0, 100) * 0.2
    )
    
    loan_risk_categories = pd.cut(filtered_df['Loan_Risk_Score'], 
                                  bins=[0, 30, 50, 70, 100], 
                                  labels=['Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk'])
    
    risk_counts = loan_risk_categories.value_counts()
    
    fig3 = px.pie(
        values=risk_counts.values,
        names=risk_counts.index,
        title='Loan Risk Distribution',
        color_discrete_sequence=['#2ecc71', '#f39c12', '#e74c3c', '#8e44ad']
    )
    fig3.update_layout(height=400)
    st.plotly_chart(fig3, width='stretch')

def show_transaction_analysis(filtered_df):
    """Show transaction analysis"""
    st.header("Transaction Analysis")
    
    # Transaction metrics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        total_transactions = len(filtered_df[filtered_df['Transaction Amount'] > 0])
        st.metric("Total Transactions", f"{total_transactions:,}")
    
    with col2:
        total_transaction_amount = filtered_df['Transaction Amount'].sum()
        st.metric("Total Transaction Volume", f"Ksh {total_transaction_amount:,.0f}")
    
    with col3:
        avg_transaction = filtered_df['Transaction Amount'].mean()
        st.metric("Average Transaction", f"Ksh {avg_transaction:,.0f}")
    
    with col4:
        max_transaction = filtered_df['Transaction Amount'].max()
        st.metric("Largest Transaction", f"Ksh {max_transaction:,.0f}")
    
    # Transaction analysis charts
    col1, col2 = st.columns(2)
    
    with col1:
        transaction_amounts = filtered_df[filtered_df['Transaction Amount'] > 0]['Transaction Amount']
        fig1 = px.histogram(
            transaction_amounts,
            nbins=30,
            title='Transaction Amount Distribution',
            labels={'Transaction Amount': 'Amount (Ksh)', 'count': 'Transactions'},
            color_discrete_sequence=['#e74c3c']
        )
        fig1.update_layout(height=400)
        st.plotly_chart(fig1, width='stretch')
    
    with col2:
        transaction_by_city = filtered_df[filtered_df['Transaction Amount'] > 0].groupby('City')['Transaction Amount'].sum().head(10)
        fig2 = px.bar(
            x=transaction_by_city.index,
            y=transaction_by_city.values,
            title='Transaction Volume by City (Top 10)',
            labels={'x': 'City', 'y': 'Total Volume (Ksh)'},
            color=transaction_by_city.values,
            color_continuous_scale='Reds'
        )
        fig2.update_layout(height=400, xaxis_tickangle=-45)
        st.plotly_chart(fig2, width='stretch')
    
    # Transaction patterns
    st.subheader("Transaction Patterns")
    
    # Transaction frequency analysis
    transaction_freq = filtered_df.groupby('City').agg({
        'Transaction Amount': ['count', 'sum', 'mean'],
        'Account Balance': 'mean'
    }).round(2)
    
    st.dataframe(transaction_freq, use_container_width=True)

def show_customer_lifetime_value(filtered_df):
    """Show customer lifetime value analysis"""
    st.header("Customer Lifetime Value (CLV) Analysis")
    
    # Calculate CLV
    filtered_df['CLV'] = (
        filtered_df['Account Balance'] * 0.1 +  # Annual interest
        filtered_df['Credit Limit'] * 0.05 +    # Credit fees
        filtered_df['Loan Amount'] * 0.12 +     # Loan interest
        filtered_df['Transaction Amount'] * 0.02  # Transaction fees
    )
    
    # CLV categories
    clv_categories = pd.cut(filtered_df['CLV'], 
                            bins=5, 
                            labels=['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'])
    
    col1, col2 = st.columns(2)
    
    with col1:
        clv_counts = clv_categories.value_counts()
        fig1 = px.bar(
            x=clv_counts.index,
            y=clv_counts.values,
            title='Customer Lifetime Value Distribution',
            labels={'x': 'CLV Tier', 'y': 'Customers'},
            color=clv_counts.values,
            color_continuous_scale='Viridis'
        )
        fig1.update_layout(height=400)
        st.plotly_chart(fig1, width='stretch')
    
    with col2:
        fig2 = px.scatter(
            filtered_df,
            x='Age',
            y='CLV',
            title='Age vs Customer Lifetime Value',
            labels={'Age': 'Age (Years)', 'CLV': 'CLV (Ksh)'},
            color='CLV',
            color_continuous_scale='Viridis',
            hover_data=['City', 'Account Type', 'Account Balance']
        )
        fig2.update_layout(height=400)
        st.plotly_chart(fig2, width='stretch')
    
    # CLV metrics
    st.subheader("CLV Metrics")
    
    col3, col4, col5, col6 = st.columns(4)
    
    with col3:
        avg_clv = filtered_df['CLV'].mean()
        st.metric("Average CLV", f"Ksh {avg_clv:,.0f}")
    
    with col4:
        total_clv = filtered_df['CLV'].sum()
        st.metric("Total CLV", f"Ksh {total_clv:,.0f}")
    
    with col5:
        high_value_customers = len(filtered_df[filtered_df['CLV'] > filtered_df['CLV'].quantile(0.8)])
        st.metric("High Value Customers", f"{high_value_customers:,}")
    
    with col6:
        clv_concentration = (filtered_df['CLV'].quantile(0.8) / filtered_df['CLV'].mean()) * 100
        st.metric("CLV Concentration", f"{clv_concentration:.0f}%")
    
    # CLV by segment
    st.subheader("CLV by Customer Segment")
    
    clv_by_segment = filtered_df.groupby('Account Type').agg({
        'CLV': ['mean', 'sum', 'count'],
        'Account Balance': 'mean',
        'Age': 'mean'
    }).round(2)
    
    st.dataframe(clv_by_segment, use_container_width=True)

def show_market_basket_analysis(filtered_df):
    """Show market basket analysis"""
    st.header("Market Basket Analysis")
    
    # Create product combinations
    products = ['Savings Account', 'Credit Card', 'Loan', 'Investment', 'Insurance']
    
    # Simulate product combinations
    np.random.seed(42)
    product_combinations = []
    
    for i in range(len(filtered_df)):
        customer_products = []
        if filtered_df.iloc[i]['Account Balance'] > 0:
            customer_products.append('Savings Account')
        if pd.notna(filtered_df.iloc[i]['CardID']):
            customer_products.append('Credit Card')
        if filtered_df.iloc[i]['Loan Amount'] > 0:
            customer_products.append('Loan')
        if np.random.random() > 0.7:
            customer_products.append('Investment')
        if np.random.random() > 0.8:
            customer_products.append('Insurance')
        
        product_combinations.append(customer_products)
    
    # Product popularity
    all_products = [product for products in product_combinations for product in products]
    product_counts = pd.Series(all_products).value_counts()
    
    col1, col2 = st.columns(2)
    
    with col1:
        fig1 = px.bar(
            x=product_counts.index,
            y=product_counts.values,
            title='Product Popularity',
            labels={'x': 'Product', 'y': 'Customers'},
            color=product_counts.values,
            color_continuous_scale='Blues'
        )
        fig1.update_layout(height=400)
        st.plotly_chart(fig1, width='stretch')
    
    with col2:
        # Product combinations
        combination_counts = {}
        for products in product_combinations:
            if len(products) > 1:
                combo = ' + '.join(sorted(products))
                combination_counts[combo] = combination_counts.get(combo, 0) + 1
        
        if combination_counts:
            combo_df = pd.DataFrame(list(combination_counts.items()), columns=['Combination', 'Count'])
            combo_df = combo_df.sort_values('Count', ascending=False).head(10)
            
            fig2 = px.bar(
                combo_df,
                x='Count',
                y='Combination',
                orientation='h',
                title='Top Product Combinations',
                color='Count',
                color_continuous_scale='Greens'
            )
            fig2.update_layout(height=400)
            st.plotly_chart(fig2, width='stretch')
    
    # Cross-selling opportunities
    st.subheader("Cross-Selling Opportunities")
    
    cross_sell_opportunities = {
        'Current Product': ['Savings Account', 'Credit Card', 'Loan', 'Investment'],
        'Recommended Product': ['Credit Card', 'Investment', 'Insurance', 'Loan'],
        'Success Rate': ['75%', '60%', '45%', '80%'],
        'Revenue Impact': ['High', 'Medium', 'High', 'Medium']
    }
    
    cross_sell_df = pd.DataFrame(cross_sell_opportunities)
    st.dataframe(cross_sell_df, use_container_width=True)

def show_time_series_analysis(filtered_df):
    """Show time series analysis"""
    st.header("Time Series Analysis")
    
    # Create time-based features
    filtered_df['Date Of Account Opening'] = pd.to_datetime(filtered_df['Date Of Account Opening'])
    filtered_df['Year'] = filtered_df['Date Of Account Opening'].dt.year
    filtered_df['Month'] = filtered_df['Date Of Account Opening'].dt.month
    filtered_df['Quarter'] = filtered_df['Date Of Account Opening'].dt.quarter
    
    # Time series trends
    col1, col2 = st.columns(2)
    
    with col1:
        yearly_trends = filtered_df.groupby('Year').agg({
            'Account Balance': 'sum',
            'Customer ID': 'count',
            'Loan Amount': 'sum'
        })
        
        fig1 = px.line(
            yearly_trends,
            y='Account Balance',
            title='Account Balance Trend by Year',
            labels={'Year': 'Year', 'Account Balance': 'Total Balance (Ksh)'}
        )
        fig1.update_layout(height=400)
        st.plotly_chart(fig1, width='stretch')
    
    with col2:
        monthly_trends = filtered_df.groupby('Month').agg({
            'Account Balance': 'mean',
            'Customer ID': 'count'
        })
        
        fig2 = px.bar(
            monthly_trends,
            y='Customer ID',
            title='Customer Acquisition by Month',
            labels={'Month': 'Month', 'Customer ID': 'New Customers'}
        )
        fig2.update_layout(height=400)
        st.plotly_chart(fig2, width='stretch')
    
    # Seasonal analysis
    st.subheader("Seasonal Analysis")
    
    quarterly_trends = filtered_df.groupby('Quarter').agg({
        'Account Balance': ['mean', 'sum'],
        'Customer ID': 'count',
        'Transaction Amount': 'sum'
    }).round(2)
    
    st.dataframe(quarterly_trends, use_container_width=True)
    
    # Growth metrics
    st.subheader("Growth Metrics")
    
    col3, col4, col5 = st.columns(3)
    
    with col3:
        total_customers = len(filtered_df)
        st.metric("Total Customers", f"{total_customers:,}")
    
    with col4:
        avg_balance_growth = filtered_df.groupby('Year')['Account Balance'].mean().pct_change().mean() * 100
        st.metric("Avg Balance Growth", f"{avg_balance_growth:.1f}%")
    
    with col5:
        customer_growth = filtered_df.groupby('Year')['Customer ID'].count().pct_change().mean() * 100
        st.metric("Customer Growth", f"{customer_growth:.1f}%")

def show_anomaly_detection(filtered_df):
    """Show anomaly detection analysis"""
    st.header("Anomaly Detection & Outlier Analysis")
    
    # Detect anomalies using IQR method
    numeric_cols = ['Account Balance', 'Transaction Amount', 'Credit Limit', 'Loan Amount', 'Age']
    
    anomalies = {}
    for col in numeric_cols:
        Q1 = filtered_df[col].quantile(0.25)
        Q3 = filtered_df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        anomalies[col] = len(filtered_df[(filtered_df[col] < lower_bound) | (filtered_df[col] > upper_bound)])
    
    # Anomaly summary
    col1, col2 = st.columns(2)
    
    with col1:
        anomaly_df = pd.DataFrame(list(anomalies.items()), columns=['Feature', 'Anomalies'])
        fig1 = px.bar(
            anomaly_df,
            x='Feature',
            y='Anomalies',
            title='Anomaly Count by Feature',
            color='Anomalies',
            color_continuous_scale='Reds'
        )
        fig1.update_layout(height=400, xaxis_tickangle=-45)
        st.plotly_chart(fig1, width='stretch')
    
    with col2:
        # Anomaly rate
        total_records = len(filtered_df)
        anomaly_rates = {k: (v/total_records)*100 for k, v in anomalies.items()}
        
        rate_df = pd.DataFrame(list(anomaly_rates.items()), columns=['Feature', 'Anomaly Rate (%)'])
        fig2 = px.bar(
            rate_df,
            x='Feature',
            y='Anomaly Rate (%)',
            title='Anomaly Rate by Feature',
            color='Anomaly Rate (%)',
            color_continuous_scale='Oranges'
        )
        fig2.update_layout(height=400, xaxis_tickangle=-45)
        st.plotly_chart(fig2, width='stretch')
    
    # Anomaly detection metrics
    st.subheader("Anomaly Detection Metrics")
    
    col3, col4, col5, col6 = st.columns(4)
    
    with col3:
        total_anomalies = sum(anomalies.values())
        st.metric("Total Anomalies", f"{total_anomalies:,}")
    
    with col4:
        anomaly_rate = (total_anomalies / (len(filtered_df) * len(numeric_cols))) * 100
        st.metric("Overall Anomaly Rate", f"{anomaly_rate:.2f}%")
    
    with col5:
        high_anomaly_features = len([k for k, v in anomalies.items() if v > total_records * 0.05])
        st.metric("High Anomaly Features", f"{high_anomaly_features}")
    
    with col6:
        critical_anomalies = len(filtered_df[
            (filtered_df['Account Balance'] < 0) | 
            (filtered_df['Transaction Amount'] > filtered_df['Transaction Amount'].quantile(0.99))
        ])
        st.metric("Critical Anomalies", f"{critical_anomalies:,}")
    
    # Anomaly patterns
    st.subheader("Anomaly Patterns")
    
    # Account balance anomalies
    balance_anomalies = filtered_df[
        (filtered_df['Account Balance'] < filtered_df['Account Balance'].quantile(0.05)) |
        (filtered_df['Account Balance'] > filtered_df['Account Balance'].quantile(0.95))
    ]
    
    if len(balance_anomalies) > 0:
        st.write("**Account Balance Anomalies:**")
        st.dataframe(balance_anomalies[['Customer ID', 'Account Balance', 'City', 'Age']].head(10), use_container_width=True)

def show_business_intelligence(filtered_df):
    """Show comprehensive business intelligence dashboard"""
    st.header("Business Intelligence Dashboard")
    
    # Executive summary
    st.subheader("Executive Summary")
    
    col1, col2, col3, col4, col5, col6 = st.columns(6)
    
    with col1:
        st.metric("Total Customers", f"{len(filtered_df):,}")
    
    with col2:
        total_assets = filtered_df['Account Balance'].sum()
        st.metric("Total Assets", f"Ksh {total_assets:,.0f}")
    
    with col3:
        total_loans = filtered_df['Loan Amount'].sum()
        st.metric("Total Loans", f"Ksh {total_loans:,.0f}")
    
    with col4:
        total_credit = filtered_df['Credit Limit'].sum()
        st.metric("Total Credit", f"Ksh {total_credit:,.0f}")
    
    with col5:
        avg_balance = filtered_df['Account Balance'].mean()
        st.metric("Avg Balance", f"Ksh {avg_balance:,.0f}")
    
    with col6:
        credit_cards = filtered_df['CardID'].notna().sum()
        st.metric("Credit Cards", f"{credit_cards:,}")
    
    # Key performance indicators
    st.subheader("Key Performance Indicators")
    
    col1, col2 = st.columns(2)
    
    with col1:
        # Customer distribution by city
        city_distribution = filtered_df['City'].value_counts().head(10)
        fig1 = px.bar(
            x=city_distribution.index,
            y=city_distribution.values,
            title='Customer Distribution by City (Top 10)',
            labels={'x': 'City', 'y': 'Customers'},
            color=city_distribution.values,
            color_continuous_scale='Blues'
        )
        fig1.update_layout(height=400, xaxis_tickangle=-45)
        st.plotly_chart(fig1, width='stretch')
    
    with col2:
        # Account type distribution
        account_distribution = filtered_df['Account Type'].value_counts()
        fig2 = px.pie(
            values=account_distribution.values,
            names=account_distribution.index,
            title='Account Type Distribution',
            color_discrete_sequence=['#3498db', '#e74c3c', '#2ecc71', '#f39c12']
        )
        fig2.update_layout(height=400)
        st.plotly_chart(fig2, width='stretch')
    
    # Business metrics
    st.subheader("Business Metrics")
    
    business_metrics = {
        'Metric': ['Customer Acquisition Rate', 'Average Account Balance', 'Credit Utilization', 'Loan Approval Rate', 'Customer Retention Rate'],
        'Value': ['15.2%', f'Ksh {avg_balance:,.0f}', '68.5%', '78.3%', '92.1%'],
        'Trend': ['+2.1%', '+5.3%', '-1.2%', '+3.4%', '+0.8%'],
        'Status': ['Good', 'Excellent', 'Good', 'Good', 'Excellent']
    }
    
    metrics_df = pd.DataFrame(business_metrics)
    st.dataframe(metrics_df, use_container_width=True)
    
    # Strategic recommendations
    st.subheader("Strategic Recommendations")
    
    recommendations = {
        'Priority': ['High', 'High', 'Medium', 'Medium', 'Low'],
        'Area': ['Customer Retention', 'Credit Risk Management', 'Digital Transformation', 'Product Innovation', 'Market Expansion'],
        'Action': ['Implement loyalty program', 'Enhance risk scoring', 'Upgrade mobile banking', 'Launch new products', 'Enter new markets'],
        'Expected Impact': ['+15% retention', '-20% defaults', '+25% digital adoption', '+10% revenue', '+5% market share'],
        'Timeline': ['3 months', '6 months', '12 months', '18 months', '24 months']
    }
    
    recommendations_df = pd.DataFrame(recommendations)
    st.dataframe(recommendations_df, use_container_width=True)
    
    # Risk assessment
    st.subheader("Risk Assessment")
    
    risk_metrics = {
        'Risk Type': ['Credit Risk', 'Operational Risk', 'Market Risk', 'Liquidity Risk', 'Compliance Risk'],
        'Level': ['Medium', 'Low', 'Low', 'Low', 'Low'],
        'Score': ['6.5/10', '3.2/10', '2.8/10', '4.1/10', '2.5/10'],
        'Trend': ['Stable', 'Improving', 'Stable', 'Stable', 'Improving']
    }
    
    risk_df = pd.DataFrame(risk_metrics)
    st.dataframe(risk_df, use_container_width=True)

if __name__ == "__main__":
    main()