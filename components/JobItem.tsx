import React from 'react';
import { Job, JobStatus } from '../types';
import { DownloadIcon, RetryIcon } from './icons';

interface JobItemProps {
  job: Job;
  onRetry: (jobId: string) => void;
  onRemove: (jobId: string) => void;
}

const getStatusColor = (status: JobStatus) => {
  switch (status) {
    case JobStatus.PENDING:
      return 'border-slate-500';
    case JobStatus.RUNNING:
      return 'border-blue-500 animate-pulse';
    case JobStatus.SUCCESS:
      return 'border-green-500';
    case JobStatus.FAILED:
      return 'border-red-500';
    default:
      return 'border-slate-700';
  }
};

const JobItem: React.FC<JobItemProps> = ({ job, onRetry, onRemove }) => {
  return (
    <div className={`bg-slate-800 rounded-lg p-4 border-l-4 ${getStatusColor(job.status)} flex flex-col md:flex-row gap-4 justify-between items-start`}>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-400 font-mono truncate" title={job.id}>ID: {job.id.substring(0, 8)}...</p>
        <p className="text-white font-semibold whitespace-pre-wrap break-words" title={job.prompt}>{job.prompt}</p>
        <div className="text-xs text-slate-400 mt-2 flex flex-wrap gap-x-3 gap-y-1">
          <span>Model: {job.model}</span>
          <span>Ratio: {job.aspectRatio}</span>
          <span>Type: {job.inputType}</span>
          {job.imageFile && <span className="truncate">Img: {job.imageFile.name}</span>}
          {job.referenceCharacterNames && job.referenceCharacterNames.length > 0 && (
            <span className="truncate">Chars: {job.referenceCharacterNames.join(', ')}</span>
          )}
        </div>
        {job.status === JobStatus.RUNNING && job.progressMessage && (
            <div className="mt-2 text-xs text-blue-300 flex items-center gap-2">
                 <div className="w-3 h-3 border-2 border-dashed rounded-full border-blue-400 animate-spin"></div>
                <span>{job.progressMessage}</span>
            </div>
        )}
        {job.status === JobStatus.FAILED && job.error && (
          <p className="mt-2 text-xs text-red-400 bg-red-900/50 p-2 rounded truncate" title={job.error}>Error: {job.error}</p>
        )}
      </div>

      <div className="flex-shrink-0 flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
        {job.status === JobStatus.SUCCESS && job.resultUrl && (
          <>
            <video src={job.resultUrl} controls className="w-full md:w-32 h-auto rounded aspect-video"></video>
            <a href={job.resultUrl} download={`video_${job.id.substring(0, 6)}.mp4`} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded inline-flex items-center gap-2 text-sm transition-colors">
              <DownloadIcon />
            </a>
          </>
        )}

        {job.status === JobStatus.FAILED && (
          <button onClick={() => onRetry(job.id)} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-3 rounded inline-flex items-center gap-2 text-sm transition-colors">
            <RetryIcon />
          </button>
        )}
        
        <button onClick={() => onRemove(job.id)} className="bg-red-800/50 hover:bg-red-700/50 text-red-300 font-bold py-2 px-3 rounded transition-colors text-sm">
           &times;
        </button>
      </div>
    </div>
  );
};

export default JobItem;
