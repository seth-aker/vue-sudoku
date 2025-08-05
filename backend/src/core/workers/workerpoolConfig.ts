import workerpool from 'workerpool'
import { config as cf} from '@/core/config/index'
export interface WorkerPoolConfig {
  name: string;
  workerPath: string;
  options?: workerpool.WorkerPoolOptions;
}

export const config: WorkerPoolConfig = {
  name: 'puzzleGenerator',
  workerPath: `${cf.rootDir}\\backend\\src\\feature\\sudoku\\puzzleSolver\\puzzleGeneratorWorker.ts`,
  options: {
    maxWorkers: 8,
    workerType: 'thread'
  }
}
