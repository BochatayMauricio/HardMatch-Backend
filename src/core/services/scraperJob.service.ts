import { syncProductsFromScraper } from './product.service.js';

type JobTrigger = 'startup' | 'interval';

interface ScraperJobConfig {
  enabled: boolean;
  query: string;
  maxPages: number;
  intervalMs: number;
  runOnStart: boolean;
}

const DEFAULT_INTERVAL_MINUTES = 60;
const MIN_INTERVAL_MS = 60000;

const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) return defaultValue;

  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'si'].includes(normalized)) return true;
  if (['false', '0', 'no'].includes(normalized)) return false;

  return defaultValue;
};

const parsePositiveInt = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return defaultValue;

  return parsed;
};

const getConfig = (query: string): ScraperJobConfig => {
  const maxPages = parsePositiveInt(process.env.SCRAPER_JOB_MAX_PAGES, 1);
  const intervalMinutes = parsePositiveInt(
    process.env.SCRAPER_JOB_INTERVAL_MINUTES,
    DEFAULT_INTERVAL_MINUTES,
  );

  return {
    enabled: parseBoolean(process.env.SCRAPER_JOB_ENABLED, true),
    query: query,
    maxPages,
    intervalMs: Math.max(intervalMinutes * 60_000, MIN_INTERVAL_MS),
    runOnStart: parseBoolean(process.env.SCRAPER_JOB_RUN_ON_START, true),
  };
};

class ScraperJobService {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private readonly config: ScraperJobConfig;

  constructor(query: string) {
    this.config = getConfig(query);
  }

  public start(delayMs: number = 0): void {
    if (!this.config.enabled) {
      console.log('[ScraperJob] Disabled by SCRAPER_JOB_ENABLED');
      return;
    }

    if (this.timer) {
      console.log('[ScraperJob] Job is already running');
      return;
    }

    if (this.config.runOnStart) {
      setTimeout(() => {
        void this.run('startup');
      }, delayMs);
    }

    // Programar las siguientes ejecuciones
    this.timer = setInterval(() => {
      void this.run('interval');
    }, this.config.intervalMs);

    console.log(
      `[ScraperJob] Started. query="${this.config.query}" interval=${Math.floor(this.config.intervalMs / 60000)}m maxPages=${this.config.maxPages}`,
    );
  }

  public stop(): void {
    if (!this.timer) return;

    clearInterval(this.timer);
    this.timer = null;
    console.log(`[ScraperJob] Stopped "${this.config.query}"`);
  }

  private async run(trigger: JobTrigger): Promise<void> {
      if (this.isRunning) {
        console.log(`[ScraperJob] Skip ${trigger} "${this.config.query}" - previous run in progress`);
        return;
      }

      this.isRunning = true;
      const startedAt = Date.now();

      try {
        console.log(`[ScraperJob] Running (${trigger}) for "${this.config.query}"...`);
        const result = await syncProductsFromScraper({
          query: this.config.query,
          maxPages: this.config.maxPages
        });
        const durationMs = Date.now() - startedAt;
        console.log(`[ScraperJob] Done "${this.config.query}" in ${durationMs}ms.`);
      } catch (error) {
        console.error(`[ScraperJob] Failed for "${this.config.query}":`, error);
      } finally {
        this.isRunning = false;
      }
  }
}

// Un Manager para controlar múltiples instancias
class ScraperJobManager {
  private jobs: Map<string, ScraperJobService> = new Map();

  public startJob(query: string, delayMs: number = 0): void {
    if (this.jobs.has(query)) {
      console.warn(`[ScraperManager] Job for "${query}" is already managed.`);
      return;
    }
    const job = new ScraperJobService(query);
    this.jobs.set(query, job);
    job.start(delayMs);
  }

  public stopAllJobs(): void {
    for (const job of this.jobs.values()) {
      job.stop();
    }
    this.jobs.clear();
    console.log('[ScraperManager] All jobs stopped.');
  }
}

export const jobManager = new ScraperJobManager();

export const startScraperJob = (query: string, delayMs: number = 0): void => {
  jobManager.startJob(query, delayMs);
};

export const stopScraperJob = (): void => {
  jobManager.stopAllJobs();
};