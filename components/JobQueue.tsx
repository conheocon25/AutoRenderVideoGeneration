import React from 'react';
import { Job, JobStatus } from '../types';
import JobItem from './JobItem';
import { downloadFile } from '../services/geminiService';
import { PlayIcon, DownloadIcon, TrashIcon } from './icons';

interface JobQueueProps {
  jobs: Job[];
  onRetry: (jobId: string) => void;
  onRemove: (jobId: string) => void;
  onClear: () => void;
  onStartProcessing: () => void;
  isProcessing: boolean;
  canStart: boolean;
}

const JobQueue: React.FC<JobQueueProps> = ({ jobs, onRetry, onRemove, onClear, onStartProcessing, isProcessing, canStart }) => {

  const handleDownloadAll = () => {
    const successfulJobs = jobs.filter(j => j.status === JobStatus.SUCCESS && j.resultUrl);
    successfulJobs.forEach((job, index) => {
      setTimeout(() => {
        if(job.resultUrl) {
          downloadFile(job.resultUrl, `video_${job.id.substring(0, 6)}.mp4`);
        }
      }, index * 300); // Stagger downloads to avoid browser issues
    });
  };

  const pendingCount = jobs.filter(j => j.status === JobStatus.PENDING).length;
  const runningCount = jobs.filter(j => j.status === JobStatus.RUNNING).length;
  const successCount = jobs.filter(j => j.status === JobStatus.SUCCESS).length;

  return (
    <div className="bg-slate-800/50 rounded-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-2xl font-bold text-white">Job Queue ({jobs.length})</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onStartProcessing}
            disabled={!canStart || isProcessing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded inline-flex items-center gap-2 transition-colors"
          >
            <PlayIcon />
            {isProcessing ? `Processing... (${runningCount})` : `Start All (${pendingCount})`}
          </button>
          <button
            onClick={handleDownloadAll}
            disabled={successCount === 0}
            className="bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-bold py-2 px-4 rounded inline-flex items-center gap-2 transition-colors"
          >
            <DownloadIcon />
            Download All ({successCount})
          </button>
          <button
            onClick={onClear}
            className="bg-red-800/50 hover:bg-red-700/50 text-red-300 font-bold py-2 px-4 rounded inline-flex items-center gap-2 transition-colors"
          >
            <TrashIcon />
            Clear All
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {jobs.length > 0 ? (
          jobs.map(job => <JobItem key={job.id} job={job} onRetry={onRetry} onRemove={onRemove} />)
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-slate-700 rounded-lg">
            <p className="text-slate-400">No jobs in the queue.</p>
            <p className="text-slate-500 text-sm">Add jobs manually or upload a CSV file to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobQueue;
