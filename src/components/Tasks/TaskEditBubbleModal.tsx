import React from 'react';
import { Task } from '../../types/crm';
import { TaskBubbleEditor } from './TaskBubbleEditor';

interface TaskEditBubbleModalProps {
  task: Task;
  onClose: () => void;
}

export const TaskEditBubbleModal: React.FC<TaskEditBubbleModalProps> = ({
  task,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Visual Speech-Bubble Pointer Arrow */}
        <div className="hidden sm:block absolute -top-3 left-10 w-6 h-6 bg-slate-50 border-t border-l border-slate-300 transform rotate-45 z-20" />
        
        <TaskBubbleEditor
          task={task}
          onClose={onClose}
          isInline={false}
        />
      </div>
    </div>
  );
};
