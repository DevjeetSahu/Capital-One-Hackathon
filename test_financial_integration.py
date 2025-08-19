#!/usr/bin/env python3
"""
Test script for financial analysis integration
"""

import requests
import json

# Test the financial analysis endpoint
def test_financial_analysis():
    """Test the financial analysis endpoint"""
    
    # Test data
    test_data = {
        "crop_name": "paddy",
        "land_area_acres": 5.0,
        "farmer_savings": 100000
    }
    
    print("🧪 Testing Financial Analysis Integration")
    print("=" * 50)
    
    # Test 1: Financial Workflow Query
    print("\n1️⃣ Testing Financial Workflow Query")
    financial_query = f"I want to grow {test_data['crop_name']} on {test_data['land_area_acres']} acres. How much money do I need and should I take a loan?"
    print(f"Query: {financial_query}")
    
    try:
        response = requests.post(
            "http://localhost:8080/query",
            json={"query": financial_query},
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            
            print("✅ Financial Workflow Query Successful!")
            print(f"🎯 Intent: {result['intent']}")
            print(f"📊 Confidence: {result['confidence']:.2f}")
            print(f"🔄 Is Workflow: {result['is_workflow']}")
            
            if result.get('is_workflow'):
                print(f"📋 Subtasks: {len(result.get('subtasks', []))}")
                for i, subtask in enumerate(result.get('subtasks', []), 1):
                    print(f"   {i}. {subtask['description']}")
                    print(f"      Type: {subtask.get('subtask_type', 'general')}")
                    print(f"      Priority: {subtask.get('priority', 'N/A')}")
                
                print(f"\n📄 Response Preview:")
                response_text = result.get('response', '')[:200] + "..." if len(result.get('response', '')) > 200 else result.get('response', '')
                print(response_text)
            else:
                print("❌ Query was not detected as a workflow")
                
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2: Loan Products
    print("\n2️⃣ Testing Loan Products Endpoint")
    
    try:
        response = requests.get(
            "http://localhost:8080/financial/loan-products",
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            products = result["loan_products"]
            
            print("✅ Loan Products Retrieved Successfully!")
            for product in products:
                print(f"🏦 {product['name']}: Up to ₹{product['max_amount']:,.0f} at {product['interest_rate']}%")
                
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 3: Planning Query with Financial Analysis
    print("\n3️⃣ Testing Planning Query with Financial Analysis")
    
    planning_query = "I want to plan my farming for this season. Which crops should I grow on 3 acres and what will be the financial investment?"
    
    try:
        response = requests.post(
            "http://localhost:8080/query",
            json={"query": planning_query},
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            
            print("✅ Planning Query with Financial Analysis Successful!")
            print(f"🎯 Intent: {result['intent']}")
            print(f"📊 Confidence: {result['confidence']:.2f}")
            print(f"🔄 Is Workflow: {result['is_workflow']}")
            
            if result.get('is_workflow'):
                print(f"📋 Subtasks: {len(result.get('subtasks', []))}")
                for i, subtask in enumerate(result.get('subtasks', []), 1):
                    print(f"   {i}. {subtask['description']}")
                    print(f"      Type: {subtask.get('subtask_type', 'general')}")
                
                print(f"\n📄 Response Preview:")
                response_text = result.get('response', '')[:200] + "..." if len(result.get('response', '')) > 200 else result.get('response', '')
                print(response_text)
            else:
                print("❌ Query was not detected as a workflow")
                
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_financial_analysis()
