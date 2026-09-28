import { Worker } from 'node:worker_threads';
import type { SolverInput, SolverResult } from '@student-erp/timetable-engine';

export function solveInWorker(
  input: SolverInput,
  seed: number,
  timeBudgetMs: number,
): Promise<SolverResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      `const { parentPort, workerData } = require('node:worker_threads');
       const { solveTimetable } = require('@student-erp/timetable-engine');
       const started = Date.now();
       try {
         const result = solveTimetable(workerData.input, { seed: workerData.seed, timeBudgetMs: workerData.timeBudgetMs }, {
           shouldStop: () => Date.now() - started >= workerData.timeBudgetMs,
           onProgress: progress => parentPort.postMessage({ type: 'progress', progress })
         });
         parentPort.postMessage({ type: 'result', result });
       } catch (error) { parentPort.postMessage({ type: 'error', error: error instanceof Error ? error.message : String(error) }); }`,
      { eval: true, workerData: { input, seed, timeBudgetMs } },
    );
    worker.on('message', (message: any) => {
      if (message.type === 'result') resolve(message.result as SolverResult);
      else if (message.type === 'error') reject(new Error(message.error));
    });
    worker.once('error', reject);
    worker.once('exit', (code) => {
      if (code !== 0) reject(new Error(`Timetable solver worker exited with code ${code}`));
    });
  });
}
