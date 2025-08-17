#!/usr/bin/env python3
"""
Test script to verify the new simple workflow implementation
"""

import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_simple_workflow():
    """Test the new simple workflow implementation"""
    print("🔍 Testing simple workflow implementation...")
    
    # Step 1: Submit complex query
    print("\n1. Submitting complex query...")
    response = requests.post(f"{BASE_URL}/query", json={
        "query": "I want to plan my farming activities for the next 3 months considering market prices, weather, and crop recommendations for Bargarh district",
        "top_k": 5
    })
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Query submitted successfully")
        print(f"   Is workflow: {data.get('is_workflow')}")
        print(f"   Workflow ID: {data.get('workflow_id')}")
        print(f"   Subtasks: {len(data.get('subtasks', []))}")
        
        if data.get('is_workflow') and data.get('workflow_id'):
            workflow_id = data.get('workflow_id')
            subtasks = data.get('subtasks', [])
            
            print(f"\n2. Executing {len(subtasks)} subtasks sequentially...")
            
            # Step 2: Execute subtasks one by one
            for i, subtask in enumerate(subtasks):
                print(f"   📋 Executing subtask {i + 1}/{len(subtasks)}: {subtask.get('description', 'No description')}")
                
                execute_response = requests.post(f"{BASE_URL}/workflow/execute", json={
                    "workflow_id": workflow_id,
                    "subtask_index": i
                })
                
                if execute_response.status_code == 200:
                    result = execute_response.json()
                    print(f"   ✅ Subtask {i + 1} completed successfully")
                else:
                    print(f"   ❌ Subtask {i + 1} failed: {execute_response.status_code}")
                    return False
                
                # Small delay between subtasks
                time.sleep(1)
            
            # Step 3: Generate summary
            print(f"\n3. Generating final summary...")
            summary_response = requests.post(f"{BASE_URL}/workflow/summary", json={
                "workflow_id": workflow_id
            })
            
            if summary_response.status_code == 200:
                summary_data = summary_response.json()
                print(f"   ✅ Summary generated successfully")
                print(f"   📝 Summary: {summary_data.get('summary', '')[:100]}...")
                print(f"   🎉 Workflow completed!")
            else:
                print(f"   ❌ Summary generation failed: {summary_response.status_code}")
                return False
            
            print("\n🎉 Simple workflow test completed successfully!")
            return True
        else:
            print("❌ Query was not identified as a workflow")
            return False
    else:
        print(f"❌ Failed to submit query: {response.status_code}")
        print(f"   Error: {response.text}")
        return False

if __name__ == "__main__":
    print("🚀 Testing simple workflow implementation...\n")
    test_simple_workflow()
    print("\n✨ Test completed!")
