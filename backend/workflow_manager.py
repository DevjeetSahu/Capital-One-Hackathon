# workflow_manager.py

import logging
import uuid
from datetime import datetime
from typing import Optional, Dict, List, Any

logger = logging.getLogger(__name__)

class WorkflowManager:
    """Manages workflow processing and state for complex agricultural queries"""
    
    def __init__(self, classifier, retriever, llm_client):
        """
        Initialize workflow manager with required components
        
        Args:
            classifier: Intent classifier instance
            retriever: Context retriever instance  
            llm_client: LLM client instance
        """
        self.classifier = classifier
        self.retriever = retriever
        self.llm_client = llm_client
        self.active_workflows = {}  # Store active workflow states
        
        logger.info("Workflow Manager initialized")
    
    def process_workflow_query(self, original_query: str, intent_result, top_k: int, start_time) -> dict:
        """
        Process complex workflow queries by executing subtasks
        """
        # Generate workflow ID
        workflow_id = str(uuid.uuid4())
        
        logger.info(f"Processing workflow {workflow_id} with {len(intent_result.subtasks)} subtasks")
        
        # Initialize workflow state
        workflow_state = {
            "original_query": original_query,
            "subtasks": intent_result.subtasks,
            "completed_subtasks": [],
            "current_subtask": None,
            "status": "processing",
            "progress": 0,
            "total_subtasks": len(intent_result.subtasks),
            "start_time": start_time,
            "summary": None,
            "error": None
        }
        
        # Store workflow state
        self.active_workflows[workflow_id] = workflow_state
        
        # Execute all subtasks
        subtask_results = []
        for i, subtask in enumerate(intent_result.subtasks):
            logger.info(f"Processing subtask {i+1}/{len(intent_result.subtasks)}: {subtask['description']}")
            
            # Update current subtask
            workflow_state["current_subtask"] = i + 1
            
            # Process each subtask as a regular query but with context awareness
            subtask_result = self._process_subtask(subtask, original_query, top_k)
            subtask_results.append(subtask_result)
            
            # Update workflow state
            workflow_state["completed_subtasks"].append(subtask_result)
            workflow_state["progress"] = i + 1
            
        # Generate comprehensive summary
        summary = self._generate_workflow_summary(original_query, subtask_results)
        workflow_state["summary"] = summary
        workflow_state["status"] = "completed"
        
        # Calculate total processing time
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "query": original_query,
            "response": summary,
            "intent": intent_result.intent.value,
            "confidence": intent_result.confidence,
            "crop": intent_result.crop,
            "location": intent_result.location,
            "bucket_used": "workflow_multiple",
            "context_count": sum(r.get('context_count', 0) for r in subtask_results),
            "processing_time": processing_time,
            "status": "success",
            "intent_model": intent_result.model,
            "intent_provider": intent_result.provider,
            "llm_model": "workflow_engine",
            "llm_provider": "workflow_engine",
            "is_workflow": True,
            "workflow_id": workflow_id,
            "subtasks": subtask_results
        }

    def _process_subtask(self, subtask: dict, original_query: str, top_k: int) -> dict:
        """
        Process individual subtask with context awareness
        """
        # Create enhanced query that maintains connection to original query
        enhanced_query = self._enhance_subtask_query(subtask, original_query)
        
        # Classify intent for subtask
        subtask_intent = self.classifier.classify_intent(enhanced_query)
        
        # Retrieve context
        context_result = self.retriever.retrieve_context(enhanced_query, subtask_intent, top_k)
        
        # Generate response with original query context
        llm_result = self.llm_client.generate_response(
            enhanced_query, subtask_intent, context_result['context']
        )
        
        return {
            "subtask_id": subtask.get('priority', 0),
            "description": subtask['description'],
            "intent_type": subtask['intent_type'],
            "query": enhanced_query,
            "response": llm_result['response'],
            "context_count": context_result['total_results'],
            "bucket_used": context_result['bucket_used'],
            "status": llm_result['status']
        }

    def _enhance_subtask_query(self, subtask: dict, original_query: str) -> str:
        """
        Enhance subtask query to maintain connection with original query
        """
        return f"{subtask['query']} (This is part of a larger query: '{original_query}'. Please provide specific, actionable advice that contributes to the overall solution.)"

    def _generate_workflow_summary(self, original_query: str, subtask_results: list) -> str:
        """
        Generate comprehensive summary from all subtask results
        """
        # Collect all responses
        responses = []
        for result in subtask_results:
            if result.get('response'):
                responses.append(f"• {result['description']}: {result['response']}")
        
        # Create summary prompt
        summary_prompt = f"""
        Create a comprehensive summary for this complex agricultural query based on the individual subtask results.
        
        Original Query: "{original_query}"
        
        Individual Results:
        {chr(10).join(responses)}
        
        Provide a well-structured summary that:
        1. Addresses the original complex query
        2. Integrates insights from all subtasks
        3. Provides actionable recommendations
        4. Is organized and easy to understand
        
        Format the response with clear sections and bullet points where appropriate.
        """
        
        try:
            # Use LLM to generate summary
            result = self.llm_client.call_llm(
                "You are an agricultural expert creating comprehensive summaries for complex farming queries. Provide well-structured, actionable summaries.",
                summary_prompt,
                max_tokens=800
            )
            
            if result['status'] == 'success':
                return result['response']
            else:
                return "Summary generation failed. Please review individual subtask results."
                
        except Exception as e:
            logger.error(f"Failed to generate workflow summary: {e}")
            return "Summary generation failed. Please review individual subtask results."

    def get_workflow_status(self, workflow_id: str) -> dict:
        """
        Get current status of a workflow
        """
        if workflow_id not in self.active_workflows:
            return {"error": "Workflow not found"}
        
        workflow = self.active_workflows[workflow_id]
        
        try:
            # Calculate processing time safely
            processing_time = 0
            if workflow.get("start_time") and isinstance(workflow["start_time"], datetime):
                processing_time = (datetime.now() - workflow["start_time"]).total_seconds()
            
            return {
                "workflow_id": workflow_id,
                "original_query": workflow.get("original_query", "Unknown query"),
                "status": workflow.get("status", "unknown"),
                "progress": workflow.get("progress", 0),
                "total_subtasks": workflow.get("total_subtasks", 0),
                "current_subtask": workflow.get("current_subtask"),
                "completed_subtasks": workflow.get("completed_subtasks", []),
                "processing_time": processing_time,
                "summary": workflow.get("summary"),
                "error": workflow.get("error")
            }
        except Exception as e:
            logger.error(f"Error getting workflow status for {workflow_id}: {e}")
            return {"error": f"Error retrieving workflow status: {str(e)}"}

    def get_workflow_result(self, workflow_id: str) -> dict:
        """
        Get final result of a completed workflow
        """
        if workflow_id not in self.active_workflows:
            return {"error": "Workflow not found"}
        
        workflow = self.active_workflows[workflow_id]
        
        if workflow.get("status") != "completed":
            return {"error": "Workflow not completed yet"}
        
        try:
            # Calculate total processing time safely
            processing_time = 0
            if workflow.get("start_time") and isinstance(workflow["start_time"], datetime):
                processing_time = (datetime.now() - workflow["start_time"]).total_seconds()
        
            return {
                "workflow_id": workflow_id,
                "query": workflow.get("original_query", "Unknown query"),
                "response": workflow.get("summary", "No summary available"),
                "intent": "workflow_complex",
                "confidence": 1.0,
                "crop": None,
                "location": None,
                "bucket_used": "workflow_multiple",
                "context_count": sum(r.get('context_count', 0) for r in workflow.get("completed_subtasks", [])),
                "processing_time": processing_time,
                "status": "success",
                "intent_model": "workflow_engine",
                "intent_provider": "workflow_engine",
                "llm_model": "workflow_engine",
                "llm_provider": "workflow_engine",
                "is_workflow": True,
                "subtasks": workflow.get("completed_subtasks", [])
            }
        except Exception as e:
            logger.error(f"Error getting workflow result for {workflow_id}: {e}")
            return {"error": f"Error retrieving workflow result: {str(e)}"}

    def cleanup_workflow(self, workflow_id: str) -> bool:
        """
        Clean up workflow from memory
        """
        if workflow_id in self.active_workflows:
            workflow = self.active_workflows[workflow_id]
            # For SSE approach, allow immediate cleanup of completed workflows
            # or any workflow that's been completed for at least 5 seconds
            if workflow.get("status") == "completed":
                if "completion_time" not in workflow:
                    # If no completion time set, allow immediate cleanup
                    del self.active_workflows[workflow_id]
                    return True
                elif (datetime.now() - workflow["completion_time"]).total_seconds() > 5:
                    # Allow cleanup after 5 seconds (reduced from 30 for SSE)
                    del self.active_workflows[workflow_id]
                    return True
                else:
                    return False  # Not ready for cleanup yet
            else:
                # For non-completed workflows, allow cleanup
                del self.active_workflows[workflow_id]
                return True
        return False
