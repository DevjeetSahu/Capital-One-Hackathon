import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  CheckCircle, 
  Clock, 
  Loader2, 
  AlertCircle, 
  ChevronRight,
  Sparkles,
  Brain,
  Zap,
  MessageSquare,
  ChevronDown,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface Subtask {
  description: string;
  intent_type: string;
  status: string;
  response?: string;
}

interface SubtaskResult {
  subtask_id: number;
  completed: boolean;
  result: any;
  error?: string;
}

interface WorkflowSummary {
  workflow_id: string;
  summary: string;
  summary_hindi?: string;
  completed: boolean;
  error?: string;
}

interface WorkflowProgressProps {
  workflowId: string;
  originalQuery: string;
  subtasks: Subtask[];
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

export function WorkflowProgress({ 
  workflowId, 
  originalQuery, 
  subtasks,
  onComplete, 
  onError 
}: WorkflowProgressProps) {
  const [completedSubtasks, setCompletedSubtasks] = useState<SubtaskResult[]>([]);
  const [currentSubtask, setCurrentSubtask] = useState<number>(0);
  const [summary, setSummary] = useState<string>('');
  const [status, setStatus] = useState<'processing' | 'completed' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [expandedSubtasks, setExpandedSubtasks] = useState<Set<number>>(new Set());
  const [hasStarted, setHasStarted] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const allCompletedSubtasksRef = useRef<SubtaskResult[]>([]);
  const workflowCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const executeSubtasksSequentially = async () => {
      if (hasStarted || isExecuting || status === 'completed' || status === 'error') return;
      
      setHasStarted(true);
      setIsExecuting(true);
      console.log(`🚀 Starting sequential execution of ${subtasks.length} subtasks`);
      
      // Scroll to workflow section when workflow starts
      setTimeout(() => {
        workflowCardRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);

      try {
        // Execute subtasks one by one
        for (let i = 0; i < subtasks.length; i++) {
          console.log(`📋 Executing subtask ${i + 1}/${subtasks.length}`);
          setCurrentSubtask(i + 1);

          // Execute subtask
          const response = await fetch('https://jai-kissan-service-945629796480.asia-south1.run.app/workflow/execute', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              workflow_id: workflowId,
              subtask_index: i
            })
          });

          if (!response.ok) {
            throw new Error(`Failed to execute subtask ${i + 1}: ${response.statusText}`);
          }

          const subtaskResult: SubtaskResult = await response.json();
          console.log(`✅ Subtask ${i + 1} completed:`, subtaskResult);

          // Update completed subtasks
          setCompletedSubtasks(prev => [...prev, subtaskResult]);
          
          // Also update the ref to track all completed subtasks
          allCompletedSubtasksRef.current = [...allCompletedSubtasksRef.current, subtaskResult];

          // Small delay between subtasks to avoid overwhelming the backend
          if (i < subtasks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        // Generate final summary
        console.log('📝 Generating final summary...');
        setIsGeneratingSummary(true);
        const summaryResponse = await fetch('https://jai-kissan-service-945629796480.asia-south1.run.app/workflow/summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workflow_id: workflowId
          })
        });

        if (!summaryResponse.ok) {
          throw new Error(`Failed to generate summary: ${summaryResponse.statusText}`);
        }

        const summaryResult: WorkflowSummary = await summaryResponse.json();
        console.log('🎉 Summary generated:', summaryResult);

        setSummary(summaryResult.summary);
        setStatus('completed');
        setIsGeneratingSummary(false);
        
        // Scroll to question-answer section when summary is completed
        setTimeout(() => {
          // Find the chat container and scroll to it
          const chatContainer = document.querySelector('.chat-container');
          if (chatContainer) {
            chatContainer.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        }, 500);
        
        // Call onComplete with the summary result and all subtasks from ref
        onComplete?.({
          workflow_id: workflowId,
          query: originalQuery,
          response: summaryResult.summary,
          response_hindi: summaryResult.summary_hindi, // Include Hindi translation if available
          subtasks: allCompletedSubtasksRef.current
        });

      } catch (err) {
        console.error('❌ Error during workflow execution:', err);
        setError(err instanceof Error ? err.message : 'Workflow execution failed');
        setStatus('error');
        onError?.(err instanceof Error ? err.message : 'Workflow execution failed');
      } finally {
        setIsExecuting(false);
      }
    };

    // Start execution after a short delay
    const timer = setTimeout(() => {
      executeSubtasksSequentially();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [workflowId, originalQuery, subtasks, onComplete, onError, hasStarted]); // Added hasStarted to prevent re-execution

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            Workflow Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate progress based on subtasks only, not including summary generation
  const progressPercentage = subtasks.length > 0 ? (completedSubtasks.length / subtasks.length) * 100 : 0;

  const toggleSubtaskExpansion = (subtaskId: number) => {
    setExpandedSubtasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subtaskId)) {
        newSet.delete(subtaskId);
      } else {
        newSet.add(subtaskId);
      }
      return newSet;
    });
  };

  return (
    <Card ref={workflowCardRef} className="border-green-200 bg-green-50">
      <CardHeader className="pb-4 pt-8">
        <CardTitle className="flex items-center gap-2 text-green-700">
          <Brain className="w-5 h-5" />
          AI Workflow Processing
          {status === 'processing' && (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}
          {status === 'completed' && (
            <CheckCircle className="w-4 h-4 text-green-600" />
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Enhanced Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-semibold text-green-600">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-6 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-medium text-white drop-shadow-sm">
                {isGeneratingSummary 
                  ? "Generating Summary..." 
                  : `${completedSubtasks.length} of ${subtasks.length} completed`
                }
              </span>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="flex items-center gap-3">
          <Badge variant={status === 'completed' ? 'default' : 'secondary'} className="px-3 py-1">
            {status === 'processing' && (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                In Progress
              </>
            )}
            {status === 'completed' && (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </>
            )}
          </Badge>
          {currentSubtask > 0 && status === 'processing' && (
            <span className="text-sm text-gray-600">
              Working on step {currentSubtask} of {subtasks.length}
            </span>
          )}
        </div>

        {/* Subtasks List */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">Processing Steps:</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
                         {/* Completed subtasks */}
             {completedSubtasks.map((subtask, index) => {
               const isExpanded = expandedSubtasks.has(subtask.subtask_id);
               const subtaskData = subtasks[subtask.subtask_id];
               
               return (
                 <div key={`completed-${subtask.subtask_id}`} className="space-y-2">
                   <div 
                     className="flex items-center gap-2 p-2 bg-green-200 rounded-lg cursor-pointer hover:bg-green-300 transition-colors"
                     onClick={() => toggleSubtaskExpansion(subtask.subtask_id)}
                   >
                     <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                     <div className="flex-1 min-w-0">
                       <div className="text-sm font-medium text-gray-700 truncate">
                         {subtaskData?.description || `Subtask ${subtask.subtask_id + 1}`}
                       </div>
                       <div className="text-xs text-gray-500">
                         {subtaskData?.intent_type || 'Unknown type'}
                       </div>
                     </div>
                     {isExpanded ? (
                       <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                     ) : (
                       <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                     )}
                   </div>
                   
                   {/* Expanded content */}
                   {isExpanded && (
                     <div className="ml-6 p-3 bg-gray-50/80 rounded-lg border border-gray-200">
                       <div>
                         {/* Subtask Result Only */}
                         <div>
                           <div className="flex items-center gap-2 mb-2">
                             <Sparkles className="w-4 h-4 text-yellow-600" />
                             <span className="text-sm font-medium text-gray-700">Result</span>
                           </div>
                           <div className="text-sm text-gray-600 bg-white/50 p-3 rounded border max-h-64 overflow-y-auto">
                             <ReactMarkdown
                               components={{
                                 h1: ({ node, ...props }) => <h1 className="text-lg font-bold text-gray-800 mb-2" {...props} />,
                                 h2: ({ node, ...props }) => <h2 className="text-base font-semibold text-gray-700 mb-2" {...props} />,
                                 h3: ({ node, ...props }) => <h3 className="text-sm font-semibold text-gray-600 mb-1" {...props} />,
                                 p: ({ node, ...props }) => <p className="text-sm mb-2 leading-relaxed" {...props} />,
                                 ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 mb-2" {...props} />,
                                 ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 mb-2" {...props} />,
                                 li: ({ node, ...props }) => <li className="text-sm" {...props} />,
                                 strong: ({ node, ...props }) => <strong className="font-semibold text-gray-800" {...props} />,
                                 em: ({ node, ...props }) => <em className="italic text-gray-700" {...props} />,
                                 code: ({ node, ...props }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono" {...props} />,
                                 pre: ({ node, ...props }) => <pre className="bg-gray-100 p-2 rounded text-xs font-mono overflow-x-auto" {...props} />
                               }}
                             >
                               {subtask.result?.response || subtask.result?.answer || 'No response available'}
                             </ReactMarkdown>
                           </div>
                         </div>
                       </div>
                     </div>
                   )}
                 </div>
               );
             })}
            
                         {/* Currently processing subtask */}
             {status === 'processing' && currentSubtask > 0 && currentSubtask <= subtasks.length && 
              !completedSubtasks.some(subtask => subtask.subtask_id === currentSubtask - 1) && (
               <div key={`processing-${currentSubtask - 1}`} className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                 <Loader2 className="w-4 h-4 text-yellow-600 animate-spin flex-shrink-0" />
                 <div className="flex-1 min-w-0">
                   <div className="text-sm font-medium text-yellow-700">
                     {subtasks[currentSubtask - 1]?.description || `Subtask ${currentSubtask}`}
                   </div>
                   <div className="text-xs text-yellow-600">
                     Processing...
                   </div>
                 </div>
                 <Zap className="w-4 h-4 text-yellow-600 flex-shrink-0" />
               </div>
             )}
            
                         {/* Remaining subtasks */}
             {Array.from({ length: Math.max(0, subtasks.length - completedSubtasks.length - (status === 'processing' ? 1 : 0)) }, (_, i) => {
               const pendingIndex = completedSubtasks.length + (status === 'processing' ? 1 : 0) + i;
               return (
                 <div 
                   key={`pending-${pendingIndex}`} 
                   className="flex items-center gap-2 p-2 bg-gray-100/50 rounded-lg"
                 >
                   <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                   <div className="flex-1 min-w-0">
                     <div className="text-sm font-medium text-gray-500">
                       {subtasks[pendingIndex]?.description || `Subtask ${pendingIndex + 1}`}
                     </div>
                     <div className="text-xs text-gray-400">
                       Pending...
                     </div>
                   </div>
                   <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                 </div>
               );
             })}
          </div>
        </div>

        {/* Generating Summary Status */}
        {isGeneratingSummary && (
          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <Loader2 className="w-4 h-4 text-purple-600 animate-spin flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium text-purple-700">
                Generating Summary
              </div>
              <div className="text-xs text-purple-600">
                Compiling all subtask results into a comprehensive summary...
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
          </div>
        )}

        {/* Final Summary - Collapsible Card */}
        {status === 'completed' && summary && (
          <div className="mt-4">
            <div 
              className="flex items-center gap-2 p-3 bg-purple-100 rounded-lg border border-purple-300 cursor-pointer hover:bg-purple-200 transition-colors"
              onClick={() => setExpandedSubtasks(prev => {
                const newSet = new Set(prev);
                if (newSet.has(-1)) { // Use -1 for summary
                  newSet.delete(-1);
                } else {
                  newSet.add(-1);
                }
                return newSet;
              })}
            >
              <div className="flex items-center gap-2 flex-1">
                <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-purple-700">
                    Final Summary
                  </div>
                  <div className="text-xs text-purple-600">
                    Comprehensive analysis of all subtasks
                  </div>
                </div>
              </div>
              {expandedSubtasks.has(-1) ? (
                <ChevronDown className="w-4 h-4 text-purple-600 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-purple-600 flex-shrink-0" />
              )}
            </div>
            
            {/* Expanded Summary Content */}
            {expandedSubtasks.has(-1) && (
              <div className="ml-6 p-3 bg-purple-50/80 rounded-lg border border-purple-200 mt-2">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Summary</span>
                  </div>
                  <div className="text-sm text-gray-700 bg-white/50 p-3 rounded border max-h-64 overflow-y-auto">
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => <h1 className="text-lg font-bold text-gray-800 mb-2" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-base font-semibold text-gray-700 mb-2" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-sm font-semibold text-gray-600 mb-1" {...props} />,
                        p: ({ node, ...props }) => <p className="text-sm mb-2 leading-relaxed" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 mb-2" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 mb-2" {...props} />,
                        li: ({ node, ...props }) => <li className="text-sm" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-semibold text-gray-800" {...props} />,
                        em: ({ node, ...props }) => <em className="italic text-gray-700" {...props} />,
                        code: ({ node, ...props }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono" {...props} />,
                        pre: ({ node, ...props }) => <pre className="bg-gray-100 p-2 rounded text-xs font-mono overflow-x-auto" {...props} />
                      }}
                    >
                      {summary}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Clean Status Indicator */}
        {status === 'processing' && (
          <div className="flex items-center gap-2 text-xs text-blue-600">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Processing your request...</span>
          </div>
        )}
      </CardContent>
      <div className="pb-4"></div>
    </Card>
  );
}
