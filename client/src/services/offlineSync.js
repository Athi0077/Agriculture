import { get, set, del, keys } from 'idb-keyval';

const PENDING_SCANS_KEY_PREFIX = 'pending_scan_';

/**
 * Save a scan to IndexedDB when offline.
 * @param {FormData|Object} scanData - The scan data. If it's a FormData with a File, idb-keyval can store Files.
 * However, FormData itself is not serializable. We need to convert it to a standard object.
 */
export const savePendingScan = async (formData) => {
  const id = `${PENDING_SCANS_KEY_PREFIX}${Date.now()}`;
  
  // Extract data from FormData since FormData cannot be cloned directly by IndexedDB
  const scanData = {
    cropType: formData.get('cropType'),
    cropStage: formData.get('cropStage'),
    cropVariety: formData.get('cropVariety'),
    soilCondition: formData.get('soilCondition'),
    lat: formData.get('lat'),
    lng: formData.get('lng'),
    image: formData.get('image') // File/Blob objects are supported by IndexedDB
  };

  await set(id, {
    id,
    timestamp: Date.now(),
    data: scanData
  });
  return id;
};

export const getPendingScans = async () => {
  const allKeys = await keys();
  const scanKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith(PENDING_SCANS_KEY_PREFIX));
  
  const scans = await Promise.all(
    scanKeys.map(key => get(key))
  );
  
  // Sort by oldest first
  return scans.sort((a, b) => a.timestamp - b.timestamp);
};

export const clearPendingScan = async (id) => {
  await del(id);
};
