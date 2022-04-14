import { Store } from './Store'

export interface MonitorLocation {
  region: string
  name: string
  set: boolean
}

export const MonitorLocations: MonitorLocation[] = [
  { region: 'us-east1', name: 'N. Carolina', set: true },
  { region: 'eu-west3', name: 'Frankfurt', set: false },
  { region: 'asia-southeast1', name: 'Singapore', set: false },
]

//get monitor location name given region
export const getMonitorLocationName = (region: string): string => {
  const location = MonitorLocations.find((location) => location.region === region)
  return location ? location.name : ''
}
export function getShowLocationsFromRegions(locations?: string[]) {
  //reset defaultValues to false so server data overrides them
  let showLocations = MonitorLocations.map((location) => {
    return { ...location, set: false }
  })

  //now, update local values to be same as server
  if (Array.isArray(locations)) {
    locations.forEach((region) => {
      //if regions are equal, set to true
      const location = showLocations.find((location) => location.region === region)
      if (location) {
        location.set = true
      }
    })
  }
  return showLocations
}

export function getRegionsFromShowLocations(showLoc: MonitorLocation[]) {
  let locations: string[] = []
  showLoc.forEach((location) => {
    if (location.set) locations.push(location.region)
  })
  return locations
}

//given show locations, sync set value with store.ui.locations
export function syncShowLocationsWithStore(showLocations: MonitorLocation[]) {
  let locations = Store.ui.editor.monitorLocations
  for (let i = 0; i < locations.length; i++) {
    for (let j = 0; j < showLocations.length; j++) {
      if (locations[i].region == showLocations[j].region) {
        locations[i].set = showLocations[j].set
      }
    }
  }
}
