import { Map } from 'maplibre-gl'
import axios from '@nextcloud/axios'
import { generateUrl } from '@nextcloud/router'

export function getBBFromCenterZoom(lat, lon, zoom) {
	const dummyElement = document.createElement('div')
	const map = new Map({
		container: dummyElement,
		zoom,
	})
	const pixWidth = 600
	const pixHeight = 350
	const pixOffsetX = pixWidth / 2
	const pixOffsetY = pixHeight / 2
	// const pixOffsetY = pixOffsetX * 9 / 16

	const centerPoint = map.project([lon, lat])
	const ll1 = map.unproject([centerPoint.x - pixOffsetX, centerPoint.y + pixOffsetY])
	const ll2 = map.unproject([centerPoint.x + pixOffsetX, centerPoint.y - pixOffsetY])
	map.remove()
	return [ll1.lat, ll2.lat, ll1.lng, ll2.lng]
}

export async function nominatimGeocoder(query) {
	try {
		const req = {
			params: {
				query,
			},
		}
		const url = generateUrl('/apps/integration_openstreetmap/search')
		const result = await axios.get(url, req)
		const data = result.data.ocs.data
		console.debug('result', data)
		return formatNominatimToCarmentGeojson(data)
	} catch (error) {
		console.error('OSM search error', error)
	}
}

function formatNominatimToCarmentGeojson(results) {
	// https://docs.mapbox.com/api/search/geocoding/#geocoding-response-object
	return results.map(r => {
		const bb = r.boundingbox
		return {
			id: r.osm_id,
			place_name: r.display_name,
			bbox: [bb[2], bb[0], bb[3], bb[1]],
			// center: [r.lon, r.lat],
		}
	})
}
