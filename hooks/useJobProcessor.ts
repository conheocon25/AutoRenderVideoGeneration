import React, { useEffect, useCallback } from 'react';
import { Job, JobStatus } from '../types';
import { MAX_CONCURRENT_JOBS } from '../constants';
import { generateVideo, downloadFile } from '../services/geminiService';

export const useJobProcessor = (
    jobs: Job[], 
    setJobs: React.Dispatch<React.SetStateAction<Job[]>>,
    isProcessing: boolean,
    setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>
) => {

    const updateJob = useCallback((jobId: string, updates: Partial<Job>) => {
        setJobs(prevJobs =>
            prevJobs.map(j => (j.id === jobId ? { ...j, ...updates } : j))
        );
    }, [setJobs]);
    
    useEffect(() => {
        if (!isProcessing) {
            return;
        }

        const runningJobs = jobs.filter(j => j.status === JobStatus.RUNNING);
        const pendingJobs = jobs.filter(j => j.status === JobStatus.PENDING);

        if (runningJobs.length === 0 && pendingJobs.length === 0) {
            setIsProcessing(false);
            return;
        }

        const availableSlots = MAX_CONCURRENT_JOBS - runningJobs.length;
        if (availableSlots <= 0) {
            return;
        }

        const jobsToStart = pendingJobs.slice(0, availableSlots);

        for (const job of jobsToStart) {
            updateJob(job.id, { status: JobStatus.RUNNING });

            const process = async () => {
                try {
                    const onProgress = (message: string) => {
                        updateJob(job.id, { progressMessage: message });
                    };
                    const videoUrl = await generateVideo(job, onProgress);
                    updateJob(job.id, {
                        status: JobStatus.SUCCESS,
                        resultUrl: videoUrl,
                        error: undefined,
                    });
                    downloadFile(videoUrl, `video_${job.id.substring(0,6)}.mp4`);
                } catch (error) {
                    console.error('Job failed:', error);
                    updateJob(job.id, {
                        status: JobStatus.FAILED,
                        error: error instanceof Error ? error.message : 'An unknown error occurred.',
                    });
                }
            };
            process();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jobs, isProcessing]);
};
