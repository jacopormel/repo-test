import type { CacheInterface } from '@src/common';

const LIST_CACHE_KEY_PREFIX = 'government-agencies:list:';

export function buildGovernmentAgencyListCacheKey(query: object): string {
  return `${LIST_CACHE_KEY_PREFIX}${JSON.stringify(query)}`;
}

export async function invalidateGovernmentAgencyListCache(cache: CacheInterface): Promise<void> {
  const keysResult = await cache.scan(`${LIST_CACHE_KEY_PREFIX}*`);
  if (!keysResult.ok || keysResult.value.length === 0) {
    return;
  }
  await cache.deleteMany(keysResult.value);
}
