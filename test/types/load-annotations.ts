import SiteViewSDK, { LoadAnnotationsResult } from '../../src/siteview-sdk';

export const loadAnnotations = async (): Promise<void> => {
  const result = await SiteViewSDK.loadAnnotations([5107, 999999999]);

  // Existing consumers read error directly before using the response.
  if (result.error) {
    console.error(result.error);
  }

  if (typeof result.error === 'string') {
    const error: string = result.error;
    console.error(error);
  } else {
    const loadedIds: number[] = result.loadedIds;
    const failedIds: number[] = result.failedIds;
    console.info(loadedIds, failedIds);

    // @ts-expect-error Successful IDs must remain numeric.
    const invalidIds: string[] = result.loadedIds;
    console.info(invalidIds);
  }
};

export const success: LoadAnnotationsResult = { loadedIds: [5107], failedIds: [999999999] };

// @ts-expect-error A successful result cannot contain an error string.
export const invalidSuccess: LoadAnnotationsResult = { loadedIds: [], failedIds: [], error: 'failed' };
