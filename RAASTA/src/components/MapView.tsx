import { useEffect, useRef } from 'react';
import { Report } from '../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  reports: Report[];
  onReportClick: (report: Report) => void;
  isDark: boolean;
}

const statusColors: Record<import('../types').Report['status'], string> = {
  pending: '#EAB308',
  'in-progress': '#3B82F6',
  resolved: '#10B981',
  rejected: '#EF4444'
};

export default function MapView({ reports, onReportClick, isDark }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const userLocationMarkerRef = useRef<L.CircleMarker | null>(null);
  const hasRequestedUserLocationRef = useRef(false);

  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      const map = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);

      L.tileLayer(
        isDark
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }
      ).addTo(map);

      mapRef.current = map;
    }

    if (!hasRequestedUserLocationRef.current && mapRef.current) {
      hasRequestedUserLocationRef.current = true;

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;

            userLocationMarkerRef.current?.remove();

            const marker = L.circleMarker([latitude, longitude], {
              radius: 10,
              color: '#2563EB',
              fillColor: '#3B82F6',
              fillOpacity: 0.85,
              weight: 3
            })
              .addTo(mapRef.current!)
              .bindPopup('You are here');

            userLocationMarkerRef.current = marker;

            mapRef.current?.setView([latitude, longitude], 13, { animate: true });
          },
          (error) => {
            console.warn('Unable to fetch current location:', error.message);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000
          }
        );
      } else {
        console.warn('Geolocation is not supported in this browser.');
      }
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const coordsMap: Record<string, Report[]> = {};
    reports.forEach((report) => {
      // don't render markers for resolved reports (they should be removed from the map)
      if (report.status === 'resolved') return;
      // Show rejected reports with red color
      const key = `${report.location.lat.toFixed(5)},${report.location.lng.toFixed(5)}`;
      if (!coordsMap[key]) coordsMap[key] = [];
      coordsMap[key].push(report);
    });
    (Object.entries(coordsMap) as [string, Report[]][]).forEach(([, reportsAtLoc]) => {
      if (reportsAtLoc.length === 1) {
        const report = reportsAtLoc[0];
        const { lat, lng } = getOffset(report.location.lat, report.location.lng, 0);
        const statusColor = statusColors[report.status];
        const icon = L.divIcon({
          html: `
            <div style="position: relative;">
              <div style="
                width: 32px;
                height: 32px;
                background: ${statusColor};
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
              ">
                ${report.isRainyHazard ? '🚨' : getIssueEmoji(report.type)}
              </div>
            </div>
            <style>
              @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.7; }
              }
            </style>
          `,
          className: 'custom-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        const marker = L.marker([lat, lng], { icon }).addTo(mapRef.current!);
        marker.bindPopup(
          `
          <div style="min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">${report.title}</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 8px;">${report.description.substring(0, 100)}...</p>
            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
              <span style="
                background: ${statusColor};
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
              ">${report.status}</span>
            </div>
            <p style="font-size: 11px; color: #999;">Reported: ${new Date(report.reportedAt).toLocaleDateString()}</p>
          </div>
        `,
          {
            maxWidth: 300
          }
        );
        marker.on('click', () => onReportClick(report));
        markersRef.current.push(marker);
      } else {
        // Create a merged marker for multiple reports at the same location
        // position at the first report's coords (or average)
        const base = reportsAtLoc[0];
        const lat = base.location.lat;
        const lng = base.location.lng;
        // determine a color: if any hazard use red, else use first status color
        const anyHazard = reportsAtLoc.some(r => r.isRainyHazard);
        const statusColor = anyHazard ? '#EF4444' : statusColors[reportsAtLoc[0].status];

        const icon = L.divIcon({
          html: `
            <div style="position: relative; display: inline-block;">
              <div style="
                width: 36px;
                height: 36px;
                background: ${statusColor};
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 6px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                color: white;
              ">
                ${reportsAtLoc.length}
              </div>
            </div>
          `,
          className: 'custom-marker-merged',
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const popupItems = reportsAtLoc.map(r => `
          <div style="margin-bottom:6px;">
            <strong style="display:block;font-size:13px;margin-bottom:4px;">${r.title}</strong>
            <div style="font-size:12px;color:#666;margin-bottom:4px;">${r.description.substring(0, 80)}...</div>
            <button id="open-${r.id}" style="font-size:12px;padding:6px 8px;border-radius:6px;background:#2563EB;color:white;border:none;cursor:pointer;">Open</button>
          </div>
        `).join('');

        const marker = L.marker([lat, lng], { icon }).addTo(mapRef.current!);
        marker.bindPopup(`
          <div style="min-width:260px;">
            <h3 style="font-weight:bold;margin-bottom:8px;">${reportsAtLoc.length} reports at this location</h3>
            ${popupItems}
          </div>
        `, { maxWidth: 360 });

        marker.on('popupopen', () => {
          // attach click listeners to each Open button to call onReportClick
          reportsAtLoc.forEach(r => {
            const el = document.getElementById(`open-${r.id}`);
            if (el) {
              el.addEventListener('click', () => {
                onReportClick(r);
                marker.closePopup();
              });
            }
          });
        });

        markersRef.current.push(marker);
      }
    });

    const visibleReports = reports.filter(r => r.status !== 'resolved');
    if (visibleReports.length > 0 && mapRef.current) {
      const bounds = L.latLngBounds(visibleReports.map((r) => [r.location.lat, r.location.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      userLocationMarkerRef.current?.remove();
    };
  }, [reports, isDark, onReportClick]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.invalidateSize();
    }
  }, [isDark]);

  return (
    <div className={`rounded-2xl shadow-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Live Issue Map</h2>
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Resolved</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">🚨</span>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Rain Hazard</span>
          </div>
        </div>
      </div>
      <div
        id="map"
        ref={mapContainerRef}
        className="relative z-0 w-full h-[500px]"
      ></div>
    </div>
  );
}

function getIssueEmoji(type: Report['type']): string {
  const emojis = {
    pothole: '🕳️',
    streetlight: '💡',
    'water-leak': '💧',
    waste: '🗑️',
    manhole: '⚠️'
  };
  return emojis[type];
}

function getOffset(lat: number, lng: number, index: number): { lat: number; lng: number } {
  // Offset within 0.00015 deg for each additional report on the same spot
  const angle = (index % 8) * (Math.PI / 4); // 8 directions
  const radius = 0.00015 * Math.ceil((index + 1) / 8); // after 8, expand circle
  return {
    lat: lat + Math.cos(angle) * radius,
    lng: lng + Math.sin(angle) * radius
  };
}
