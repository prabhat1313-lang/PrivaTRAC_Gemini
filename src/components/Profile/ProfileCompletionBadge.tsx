import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { User, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { ProfileWizardModal } from './ProfileWizardModal';

interface ProfileCompletionBadgeProps {
  className?: string;
  compact?: boolean;
}

export const ProfileCompletionBadge: React.FC<ProfileCompletionBadgeProps> = ({
  className = '',
  compact = false,
}) => {
  const { currentUser } = useCrm();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isCompleted = !!currentUser.profileCompleted;
  const percentage = currentUser.profileDetails?.profileCompletionPercentage || (isCompleted ? 100 : 60);

  if (compact) {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
            isCompleted
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              : 'bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100'
          } ${className}`}
          title="Click to view or complete your operational profile"
        >
          {isCompleted ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          ) : (
            <User className="w-3 h-3 text-indigo-600" />
          )}
          <span>{isCompleted ? 'Profile Complete' : 'Complete Profile'}</span>
          <ArrowRight className="w-2.5 h-2.5 opacity-60" />
        </button>

        <ProfileWizardModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs ${
          isCompleted
            ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
            : 'bg-indigo-50/40 border-indigo-200 hover:border-indigo-300'
        } ${className}`}
        title="Click to open guided profile setup wizard"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              isCompleted
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 text-white'
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <User className="w-4 h-4" />
            )}
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs text-slate-900 truncate">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                ({currentUser.profileDetails?.designation || currentUser.role})
              </span>
            </div>
            <div className="text-[11px] text-slate-600 flex items-center gap-1.5 mt-0.5">
              <span>Profile Setup: <strong>{percentage}%</strong></span>
              <span className="text-slate-300">·</span>
              <span className="text-indigo-700 font-medium">
                {isCompleted ? 'Verified' : 'Action Recommended'}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
            isCompleted
              ? 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xs'
          }`}
        >
          <span>{isCompleted ? 'Edit Profile' : 'Complete Profile'}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <ProfileWizardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
