import type { EpisodeMap } from "src/movies/_infra/episodes.client";
import { getMaxEpisode } from "src/movies/_model/episode.model";

export type SpoilerFreeSettings = {
  enabled: boolean;
  lastWatched: number;
};

export function loadSettingsFromStorage(episodes: EpisodeMap, currentSettings: SpoilerFreeSettings): SpoilerFreeSettings {
  if (Object.keys(episodes).length > 0) {
    try {
      if (window.localStorage && window.localStorage.getItem('spoilerFreeSettings')) {
        const parsedSettings = JSON.parse(window.localStorage.getItem('spoilerFreeSettings')!);
        if (typeof parsedSettings.lastWatched === 'string') {
          // Retrocompatibility for string
          parsedSettings.lastWatched = parseInt(parsedSettings.lastWatched, 10);
        }
        if (isValidSettings(parsedSettings)) {
          return parsedSettings;
        }
      }
    } catch (e) {
      console.warn('Failed to parse spoiler free count');

      if (!isValidSettings(currentSettings)) {
        return {
          enabled: true,
          lastWatched: getMaxEpisode(episodes),
        };
      }
    }
  }

  return currentSettings;
}

export function saveSettingsToStorage(settings: SpoilerFreeSettings) {
  if (window.localStorage) {
    window.localStorage.setItem('spoilerFreeSettings', JSON.stringify(settings));
  }
}

export function isValidSettings(settings: SpoilerFreeSettings) {
  return (settings &&
    typeof settings.enabled === 'boolean' &&
    !isNaN(settings.lastWatched));
}
