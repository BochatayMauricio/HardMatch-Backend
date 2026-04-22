import { syncProductsFromScraper } from './product.service.js';

type JobTrigger = 'startup' | 'interval';

interface ScraperJobConfig {
  enabled: boolean;
  query: string;
  maxPages: number;
  includeDetailsMl: boolean;
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

const getConfig = (): ScraperJobConfig => {
  const query = (process.env.SCRAPER_JOB_QUERY ?? 'notebook').trim();
  const maxPages = parsePositiveInt(process.env.SCRAPER_JOB_MAX_PAGES, 1);
  const intervalMinutes = parsePositiveInt(
    process.env.SCRAPER_JOB_INTERVAL_MINUTES,
    DEFAULT_INTERVAL_MINUTES,
  );

  return {
    enabled: parseBoolean(process.env.SCRAPER_JOB_ENABLED, true),
    query: query || 'notebook',
    maxPages,
    includeDetailsMl: parseBoolean(process.env.SCRAPER_JOB_INCLUDE_DETAILS_ML, false),
    intervalMs: Math.max(intervalMinutes * 60_000, MIN_INTERVAL_MS),
    runOnStart: parseBoolean(process.env.SCRAPER_JOB_RUN_ON_START, true),
  };
};

class ScraperJobService {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private readonly config: ScraperJobConfig;

  constructor() {
    this.config = getConfig();
  }

  public start(): void {
    if (!this.config.enabled) {
      console.log('[ScraperJob] Disabled by SCRAPER_JOB_ENABLED');
      return;
    }

    if (this.timer) {
      console.log('[ScraperJob] Job is already running');
      return;
    }

    if (this.config.runOnStart) {
      void this.run('startup');
    }

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
    console.log('[ScraperJob] Stopped');
  }

  private async run(trigger: JobTrigger): Promise<void> {
    if (this.isRunning) {
      console.log(`[ScraperJob] Skip ${trigger} run because previous run is still in progress`);
      return;
    }

    this.isRunning = true;
    const startedAt = Date.now();

    try {
      console.log(`[ScraperJob] Running (${trigger})...`);

      const result = await syncProductsFromScraper({
        query: this.config.query,
        maxPages: this.config.maxPages,
        includeDetailsMl: this.config.includeDetailsMl,
      });

      const durationMs = Date.now() - startedAt;
      console.log(
        `[ScraperJob] Done in ${durationMs}ms. fetched=${result.totalFetched} processed=${result.processed} createdProducts=${result.createdProducts} updatedProducts=${result.updatedProducts} createdListings=${result.createdListings} updatedListings=${result.updatedListings} errors=${result.errors.length}`,
      );
    } catch (error) {
      console.error('[ScraperJob] Run failed:', error);
    } finally {
      this.isRunning = false;
    }
  }
}

export const scraperJobService = new ScraperJobService();

export const startScraperJob = (): void => {
  scraperJobService.start();
};

export const stopScraperJob = (): void => {
  scraperJobService.stop();
};