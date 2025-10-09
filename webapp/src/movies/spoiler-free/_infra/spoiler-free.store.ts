import { Episode, getMaxEpisode } from 'src/movies/_model/episode.model'
import { SpoilerFreeSettings } from '../_model/spoiler-free.model'

export type SpoilerFreeSettingsSerializable = {
  enabled: boolean
  lastWatched: number
}

export function loadSpoilerFreeState(
  episodes: Episode[],
  currentSettings: SpoilerFreeSettings
): SpoilerFreeSettings {
  if (episodes.length > 0) {
    try {
      if (window.localStorage && window.localStorage.getItem('spoilerFreeSettings')) {
        const parsedSettings: SpoilerFreeSettingsSerializable = JSON.parse(
          window.localStorage.getItem('spoilerFreeSettings')!
        )
        if (typeof parsedSettings.lastWatched === 'string') {
          // Retrocompatibility for string
          parsedSettings.lastWatched = parseInt(parsedSettings.lastWatched, 10)
        }
        if (isValidSettings(parsedSettings)) {
          return new SpoilerFreeSettings({
            enabled: parsedSettings.enabled,
            lastWatched: parsedSettings.lastWatched,
            episodes
          })
        }
      }
    } catch (e) {
      console.warn('Failed to parse spoiler free state, reverting to default settings')

      if (!isValidSettings(currentSettings)) {
        return new SpoilerFreeSettings({
          enabled: true,
          lastWatched: getMaxEpisode(episodes),
          episodes
        })
      }
    }
  }

  return currentSettings
}

function isValidSettings(settings: SpoilerFreeSettingsSerializable) {
  return settings && typeof settings.enabled === 'boolean' && !isNaN(settings.lastWatched)
}

export function saveSpoilerFreeState(settings: SpoilerFreeSettings) {
  if (window.localStorage) {
    const data: SpoilerFreeSettingsSerializable = {
      enabled: settings.enabled,
      lastWatched: settings.lastWatched
    }

    window.localStorage.setItem('spoilerFreeSettings', JSON.stringify(data))
  }
}
