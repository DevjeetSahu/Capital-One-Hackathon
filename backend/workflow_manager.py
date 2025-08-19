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
        Process individual subtask with context awareness and financial analysis support
        """
        # Create enhanced query that maintains connection to original query
        enhanced_query = self._enhance_subtask_query(subtask, original_query)
        
        # Classify intent for subtask
        subtask_intent = self.classifier.classify_intent(enhanced_query)
        
        # Retrieve context
        context_result = self.retriever.retrieve_context(enhanced_query, subtask_intent, top_k)
        
        # For financial analysis subtasks, enhance the prompt with comprehensive financial calculation instructions
        if subtask.get('subtask_type') in ['cost_analysis', 'market_analysis', 'government_schemes', 'loan_analysis', 'final_recommendation']:
            enhanced_query = self._enhance_financial_subtask_query(subtask, original_query, context_result['context'])
        
        # Generate response with original query context
        llm_result = self.llm_client.generate_response(
            enhanced_query, subtask_intent, context_result['context']
        )
        
        return {
            "subtask_id": subtask.get('priority', 0),
            "description": subtask['description'],
            "intent_type": subtask['intent_type'],
            "subtask_type": subtask.get('subtask_type', 'general'),
            "query": enhanced_query,
            "response": llm_result['response'],
            "context_count": context_result['total_results'],
            "bucket_used": context_result['bucket_used'],
            "status": llm_result['status']
        }

    def _enhance_financial_subtask_query(self, subtask: dict, original_query: str, context: list) -> str:
        """
        Enhance financial subtask queries with specific calculation instructions
        """
        subtask_type = subtask.get('subtask_type', 'general')
        
        if subtask_type == 'cost_analysis':
            return f"""
            {subtask['query']}
            
            This is part of a financial analysis for: '{original_query}'
            
            Using the provided context data, calculate the total investment required including:
            - Seeds cost per acre
            - Fertilizers cost per acre  
            - Pesticides cost per acre
            - Labor cost per acre
            - Machinery/equipment cost per acre
            - Irrigation cost per acre
            - Miscellaneous costs per acre
            
            Extract specific amounts from the context data and provide a detailed cost breakdown.
            If exact amounts are not available, use the closest available data from Bargarh district.
            """
        
        elif subtask_type == 'market_analysis':
            return f"""
            {subtask['query']}
            
            This is part of a financial analysis for: '{original_query}'
            
            Using the provided context data, analyze:
            - Current market prices in Bargarh mandi
            - Expected yield per acre
            - Total revenue calculation
            - Market trends and seasonal variations
            
            Extract specific prices and yield data from the context.
            Calculate total expected revenue based on land area mentioned in the original query.
            """
        
        elif subtask_type == 'government_schemes':
            return f"""
            {subtask['query']}
            
            This is part of a financial analysis for: '{original_query}'
            
            Using the provided context data, analyze available government schemes and subsidies including:
            - PM-KISAN benefits and eligibility
            - KALIA scheme benefits for Odisha farmers
            - PMFBY (crop insurance) coverage and premiums
            - Fertilizer subsidies and input support
            - Other relevant schemes for Bargarh district farmers
            
            Extract specific subsidy amounts, eligibility criteria, and application processes.
            Calculate total government support available for this farming venture.
            """
        
        elif subtask_type == 'loan_analysis':
            return f"""
            {subtask['query']}
            
            This is part of a financial analysis for: '{original_query}'
            
            Based on the cost analysis, market analysis, and government schemes results, determine:
            - Total investment required
            - Expected returns
            - ROI calculation
            - Government subsidy benefits
            - Net investment after subsidies
            - Whether loan is needed
            - Recommended loan amount
            - Suitable loan products (Kisan Credit Card, Crop Loan, etc.)
            - Interest rates and repayment terms
            
            Provide specific amounts and clear recommendations.
            """
        
        elif subtask_type == 'final_recommendation':
            return f"""
            {subtask['query']}
            
            This is part of a comprehensive financial analysis for: '{original_query}'
            
            Based on all previous analysis (cost analysis, market analysis, government schemes, loan analysis), provide a comprehensive financial recommendation including:
            
            📊 **INVESTMENT ANALYSIS**
            - Total investment required (specific amount)
            - Cost breakdown by category (seeds, fertilizers, labor, etc.)
            - Government subsidy benefits (specific amounts)
            - Net investment after subsidies
            
            💰 **RETURN ANALYSIS**
            - Expected revenue (specific amount)
            - Expected profit/loss
            - ROI percentage
            - Break-even analysis
            
            🏦 **LOAN RECOMMENDATIONS**
            - Whether loan is needed
            - Recommended loan amount
            - Suitable loan products (Kisan Credit Card, Crop Loan, etc.)
            - Interest rates and repayment terms
            
            📋 **GOVERNMENT SCHEMES**
            - Available subsidies and benefits
            - Application process and eligibility
            
            ✅ **FINAL RECOMMENDATION**
            - Go/No-go decision with clear reasoning
            - Risk assessment and mitigation strategies
            - Next steps and timeline
            
            Provide specific amounts, clear calculations, and actionable advice for Bargarh district farmers.
            """
        
        else:
            return self._enhance_subtask_query(subtask, original_query)

    def _enhance_subtask_query(self, subtask: dict, original_query: str) -> str:
        """
        Enhance subtask query to maintain connection with original query
        """
        return f"{subtask['query']} (This is part of a larger query: '{original_query}'. Please provide specific, actionable advice that contributes to the overall solution.)"

    def _generate_workflow_summary(self, original_query: str, subtask_results: list) -> str:
        """
        Generate comprehensive summary from all subtask results with financial analysis support
        """
        # Check if this is a financial analysis workflow
        is_financial_workflow = any(
            result.get('subtask_type') in ['cost_analysis', 'market_analysis', 'loan_analysis', 'final_recommendation']
            for result in subtask_results
        )
        
        # Collect all responses
        responses = []
        for result in subtask_results:
            if result.get('response'):
                responses.append(f"• {result['description']}: {result['response']}")
        
        if is_financial_workflow:
            # Create financial analysis summary prompt
            summary_prompt = f"""
            Create a comprehensive financial analysis summary for this farming query based on the individual subtask results.
            
            Original Query: "{original_query}"
            
            Individual Analysis Results:
            {chr(10).join(responses)}
            
            Provide a well-structured financial summary that includes:
            
            📊 **INVESTMENT ANALYSIS**
            - Total investment required (specific amount)
            - Cost breakdown by category
            - Land area considerations
            
            💰 **RETURN ANALYSIS**
            - Expected revenue (specific amount)
            - Expected profit/loss
            - ROI percentage
            - Break-even analysis
            
            🏦 **LOAN RECOMMENDATIONS**
            - Whether loan is needed
            - Recommended loan amount
            - Suitable loan products
            - Interest rates and terms
            
            📋 **GOVERNMENT SCHEMES**
            - Available subsidies
            - Eligibility criteria
            - Application process
            
            ✅ **FINAL RECOMMENDATION**
            - Go/No-go decision
            - Risk assessment
            - Next steps
            
            Format with clear sections, specific amounts, and actionable advice.
            Focus on Bargarh district context and current market conditions.
            """
            
            system_prompt = """You are an expert agricultural financial advisor specializing in Bargarh district, Odisha. 
            Create comprehensive financial analysis summaries that provide specific amounts, clear recommendations, and actionable advice for farmers."""
        else:
            # Create regular summary prompt
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
            
            system_prompt = "You are an agricultural expert creating comprehensive summaries for complex farming queries. Provide well-structured, actionable summaries."
        
        # Retry mechanism for summary generation
        max_retries = 2
        for attempt in range(max_retries + 1):  # +1 for initial attempt
            try:
                logger.info(f"Attempting to generate workflow summary (attempt {attempt + 1}/{max_retries + 1})")
                
                # Use LLM to generate summary
                result = self.llm_client.call_llm(
                    system_prompt,
                    summary_prompt,
                    max_tokens=1000
                )
                
                if result['status'] == 'success':
                    logger.info(f"Workflow summary generated successfully on attempt {attempt + 1}")
                    return result['response']
                else:
                    logger.warning(f"LLM call failed on attempt {attempt + 1}: {result.get('error', 'Unknown error')}")
                    if attempt < max_retries:
                        logger.info(f"Retrying summary generation... (attempt {attempt + 2}/{max_retries + 1})")
                        continue
                    else:
                        logger.error("All retry attempts failed for workflow summary generation")
                        return "Summary generation failed after multiple attempts. Please review individual subtask results."
                        
            except Exception as e:
                logger.error(f"Exception during summary generation attempt {attempt + 1}: {e}")
                if attempt < max_retries:
                    logger.info(f"Retrying summary generation after exception... (attempt {attempt + 2}/{max_retries + 1})")
                    continue
                else:
                    logger.error("All retry attempts failed due to exceptions")
                    return "Summary generation failed after multiple attempts due to errors. Please review individual subtask results."
        
        # Fallback if all retries are exhausted
        return "Summary generation failed after all retry attempts. Please review individual subtask results."

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
