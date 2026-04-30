import { syncProductsFromScraper } from './product.service.js';

type JobTrigger = 'startup' | 'scheduled';

interface ScraperJobConfig {
  enabled: boolean;
  query: string;
  maxPages: number;
  runAtHour: number;
  runEveryDays: number;
}

const DEFAULT_RUN_HOUR = 3;
const DEFAULT_RUN_EVERY_DAYS = 3;

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

const parseHour = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 23) return defaultValue;

  return parsed;
};

const getNextRunAt = (from: Date, runAtHour: number, runEveryDays: number): Date => {
  const nextRunAt = new Date(from);
  nextRunAt.setSeconds(0, 0);
  nextRunAt.setHours(runAtHour, 0, 0, 0);

  if (nextRunAt <= from) {
    nextRunAt.setDate(nextRunAt.getDate() + runEveryDays);
  }

  return nextRunAt;
};

const getConfig = (query: string): ScraperJobConfig => {
  const maxPages = parsePositiveInt(process.env.SCRAPER_JOB_MAX_PAGES, 1);
  const runAtHour = parseHour(process.env.SCRAPER_JOB_RUN_HOUR, DEFAULT_RUN_HOUR);
  const runEveryDays = parsePositiveInt(
    process.env.SCRAPER_JOB_RUN_EVERY_DAYS,
    DEFAULT_RUN_EVERY_DAYS,
  );

  return {
    enabled: parseBoolean(process.env.SCRAPER_JOB_ENABLED, true),
    query: query,
    maxPages,
    runAtHour,
    runEveryDays,
  };
};

class ScraperJobService {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private nextRunAt: Date | null = null;
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

    const startScheduler = (): void => {
      const from = new Date();
      this.nextRunAt = getNextRunAt(from, this.config.runAtHour, this.config.runEveryDays);
      const scheduleDelayMs = Math.max(this.nextRunAt.getTime() - from.getTime(), 0);

      this.timer = setTimeout(() => {
        void this.run('scheduled');
      }, scheduleDelayMs);

      console.log(
        `[ScraperJob] Scheduled "${this.config.query}" for ${this.nextRunAt.toLocaleString()} (every ${this.config.runEveryDays} days at ${String(this.config.runAtHour).padStart(2, '0')}:00)`,
      );

      void this.run('startup');
    };

    if (delayMs > 0) {
      this.timer = setTimeout(() => {
        this.timer = null;
        startScheduler();
      }, delayMs);
    } else {
      startScheduler();
    }

    console.log(
      `[ScraperJob] Started. query="${this.config.query}" maxPages=${this.config.maxPages}`,
    );
  }

  public stop(): void {
    if (!this.timer) return;

    clearTimeout(this.timer);
    this.timer = null;
    this.nextRunAt = null;
    console.log(`[ScraperJob] Stopped "${this.config.query}"`);
  }

  private async run(trigger: JobTrigger): Promise<void> {
    if (this.isRunning) {
      console.log(`[ScraperJob] Skip ${trigger} "${this.config.query}" - previous run in progress`);
      return;
    }

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    this.isRunning = true;
    const startedAt = Date.now();

    try {
      console.log(`[ScraperJob] Running (${trigger}) for "${this.config.query}"...`);
      await syncProductsFromScraper({
        query: this.config.query,
        maxPages: this.config.maxPages,
      });
      const durationMs = Date.now() - startedAt;
      console.log(`[ScraperJob] Done "${this.config.query}" in ${durationMs}ms.`);
    } catch (error) {
      console.error(`[ScraperJob] Failed for "${this.config.query}":`, error);
    } finally {
      this.isRunning = false;

      if (this.nextRunAt) {
        const nextRunAt = new Date(this.nextRunAt);
        nextRunAt.setDate(nextRunAt.getDate() + this.config.runEveryDays);
        const now = new Date();
        const scheduleDelayMs = Math.max(nextRunAt.getTime() - now.getTime(), 0);

        this.nextRunAt = nextRunAt;
        this.timer = setTimeout(() => {
          void this.run('scheduled');
        }, scheduleDelayMs);

        console.log(
          `[ScraperJob] Rescheduled "${this.config.query}" for ${this.nextRunAt.toLocaleString()} (every ${this.config.runEveryDays} days)`,
        );
      }
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

export const startScraperJob = (query: string): void => {
  jobManager.startJob(query);
};

export const stopScraperJob = (): void => {
  jobManager.stopAllJobs();
};