import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Home, 
  Briefcase, 
  Building2, 
  Check, 
  Search, 
  Crosshair, 
  Layers, 
  Compass, 
  Sparkles, 
  AlertCircle,
  CheckCircle2,
  Phone,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Known landmark presets for instant testing
const PRESET_ADDRESSES = [
  {
    id: 'preset_home',
    tag: 'Home',
    icon: Home,
    street: '452 Elm Street, Apt 3B',
    city: 'San Francisco',
    zipCode: '94103',
    phone: '+1 (555) 800-4321',
    instructions: 'Ring doorbell 3B, leave at door',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    mapX: 42,
    mapY: 52,
    zone: 'Downtown Core (15-25 min delivery)',
  },
  {
    id: 'preset_work',
    tag: 'Work',
    icon: Briefcase,
    street: '525 Market Street, Suite 1400',
    city: 'San Francisco',
    zipCode: '94105',
    phone: '+1 (555) 321-9876',
    instructions: 'Call on arrival, front desk lobby reception',
    coordinates: { lat: 37.7897, lng: -122.4002 },
    mapX: 68,
    mapY: 34,
    zone: 'Financial District (20-30 min delivery)',
  },
  {
    id: 'preset_north_beach',
    tag: 'North Beach',
    icon: Building2,
    street: '184 Columbus Ave',
    city: 'San Francisco',
    zipCode: '94133',
    phone: '+1 (555) 789-0123',
    instructions: 'Near City Lights Bookstore',
    coordinates: { lat: 37.7981, lng: -122.4075 },
    mapX: 58,
    mapY: 22,
    zone: 'North Beach Gourmet Hub (15-20 min delivery)',
  },
  {
    id: 'preset_mission',
    tag: 'Mission',
    icon: MapPin,
    street: '2889 Mission St',
    city: 'San Francisco',
    zipCode: '94110',
    phone: '+1 (555) 456-7890',
    instructions: 'Blue gate on 25th St entrance',
    coordinates: { lat: 37.7513, lng: -122.4182 },
    mapX: 40,
    mapY: 76,
    zone: 'Mission Corridor (25-35 min delivery)',
  },
];

export default function ChangeAddressModal({ isOpen, onClose }) {
  const { currentAddress, updateDeliveryAddress } = useAuth();

  const [selectedTag, setSelectedTag] = useState(currentAddress?.tag || 'Home');
  const [street, setStreet] = useState(currentAddress?.street || '452 Elm Street, Apt 3B');
  const [city, setCity] = useState(currentAddress?.city || 'San Francisco');
  const [zipCode, setZipCode] = useState(currentAddress?.zipCode || '94103');
  const [phone, setPhone] = useState(currentAddress?.phone || '+1 (555) 800-4321');
  const [instructions, setInstructions] = useState(currentAddress?.instructions || '');
  
  // Coordinates and map pin position (percentages 0-100)
  const [coords, setCoords] = useState(
    currentAddress?.coordinates || { lat: 37.7749, lng: -122.4194 }
  );
  const [pinPos, setPinPos] = useState({ x: 48, y: 46 });

  // Live GPS states
  const [locating, setLocating] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('');
  const [mapStyle, setMapStyle] = useState('dark'); // 'dark' | 'satellite'

  const mapRef = useRef(null);

  useEffect(() => {
    if (isOpen && currentAddress) {
      setStreet(currentAddress.street || '');
      setCity(currentAddress.city || 'San Francisco');
      setZipCode(currentAddress.zipCode || '94103');
      setPhone(currentAddress.phone || '+1 (555) 800-4321');
      setInstructions(currentAddress.instructions || '');
      setSelectedTag(currentAddress.tag || 'Home');
      if (currentAddress.coordinates) {
        setCoords(currentAddress.coordinates);
      }
    }
  }, [isOpen, currentAddress]);

  if (!isOpen) return null;

  // Handle Preset Address Selection
  const handleSelectPreset = (preset) => {
    setSelectedTag(preset.tag);
    setStreet(preset.street);
    setCity(preset.city);
    setZipCode(preset.zipCode);
    setPhone(preset.phone);
    setInstructions(preset.instructions);
    setCoords(preset.coordinates);
    setPinPos({ x: preset.mapX, y: preset.mapY });
    setGpsStatus(`Loaded preset: ${preset.tag}`);
  };

  // Live Location Detection via browser Geolocation API
  const handleDetectLiveLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setGpsStatus('Searching for live GPS satellites...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const lat = +latitude.toFixed(5);
        const lng = +longitude.toFixed(5);

        setCoords({ lat, lng });
        setPinPos({ x: 50, y: 45 }); // Center pin on live GPS
        setLocating(false);
        setGpsStatus(`📍 GPS Live Coordinates Locked (±${Math.round(accuracy || 15)}m accuracy)`);

        // Try reverse geocoding via OpenStreetMap Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { 'User-Agent': 'FoodieFlow-DeliveryApp/1.0' } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const road = addr.road || addr.suburb || addr.neighbourhood || 'Current Location';
            const houseNum = addr.house_number ? `${addr.house_number} ` : '';
            const detectedStreet = `${houseNum}${road}`;
            const detectedCity = addr.city || addr.town || addr.county || 'San Francisco';
            const detectedZip = addr.postcode || '94103';

            setStreet(detectedStreet);
            setCity(detectedCity);
            setZipCode(detectedZip);
            setSelectedTag('Live GPS');
            setGpsStatus(`✅ Located: ${detectedStreet}, ${detectedCity}`);
          } else {
            // Fallback friendly name
            setStreet(`GPS Pinpoint (${lat}, ${lng})`);
            setSelectedTag('Live GPS');
          }
        } catch (e) {
          // In sandboxed environments without direct internet:
          setStreet(`Live GPS Location (${lat}, ${lng})`);
          setSelectedTag('Live GPS');
        }
      },
      (err) => {
        setLocating(false);
        console.warn('Geolocation error:', err.message);
        // Graceful simulated demo fallback if user denied permission or on desktop without GPS
        const demoLat = 37.7749 + (Math.random() - 0.5) * 0.02;
        const demoLng = -122.4194 + (Math.random() - 0.5) * 0.02;
        setCoords({ lat: +demoLat.toFixed(5), lng: +demoLng.toFixed(5) });
        setPinPos({ x: 52, y: 48 });
        setStreet('Market & 4th Street (GPS Demo Pin)');
        setCity('San Francisco');
        setSelectedTag('Live GPS');
        setGpsStatus('📍 GPS Pin located (simulated location for testing)');
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  // Handle click on the interactive map canvas to drop or move the pin
  const handleMapClick = (e) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const pctX = Math.max(5, Math.min(95, Math.round((clickX / rect.width) * 100)));
    const pctY = Math.max(5, Math.min(95, Math.round((clickY / rect.height) * 100)));

    setPinPos({ x: pctX, y: pctY });

    // Derive approximate lat/lng from map click
    const baseLat = 37.8000;
    const baseLng = -122.4350;
    const newLat = +(baseLat - (pctY / 100) * 0.06).toFixed(5);
    const newLng = +(baseLng + (pctX / 100) * 0.06).toFixed(5);
    setCoords({ lat: newLat, lng: newLng });

    // Pick dynamic street based on sector
    let sectorStreet = 'Downtown Plaza & 5th Ave';
    if (pctY < 35) sectorStreet = 'Columbus Ave & Waterfront, North Beach';
    else if (pctY > 65) sectorStreet = '24th St & Valencia, Mission District';
    else if (pctX > 60) sectorStreet = 'Market St, Financial Hub';

    setStreet(`${sectorStreet} (Pin at ${pctX}%, ${pctY}%)`);
    setGpsStatus(`📍 Pin moved to: ${newLat}° N, ${newLng}° W`);
  };

  // Submit and Save Address
  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!street.trim()) {
      alert('Please enter a street address');
      return;
    }

    const newDeliveryAddress = {
      tag: selectedTag,
      street: street.trim(),
      city: city.trim() || 'San Francisco',
      zipCode: zipCode.trim() || '94103',
      phone: phone.trim() || '+1 (555) 800-4321',
      instructions: instructions.trim(),
      coordinates: coords,
    };

    updateDeliveryAddress(newDeliveryAddress);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/65 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-600/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight">Delivery Address & Live Map</h2>
              <p className="text-xs text-slate-300">
                Pinpoint your exact delivery address on the live GPS map
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Quick Actions Bar: Live GPS Locate Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-orange-50/80 rounded-2xl border border-orange-200/80">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-600"></span>
              </span>
              <span className="text-xs font-bold text-orange-950">
                Instant Geolocation:
              </span>
            </div>

            <button
              type="button"
              onClick={handleDetectLiveLocation}
              disabled={locating}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm shadow-orange-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
              <span>{locating ? 'Locating via GPS...' : 'Use My Current Live Location'}</span>
            </button>
          </div>

          {/* Interactive Live Map Canvas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-orange-600" />
                Interactive Map (Click anywhere to drop delivery pin):
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMapStyle(mapStyle === 'dark' ? 'satellite' : 'dark')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1"
                >
                  <Layers className="w-3 h-3 text-slate-500" />
                  <span>{mapStyle === 'dark' ? 'Satellite View' : 'Grid Map'}</span>
                </button>
              </div>
            </div>

            {/* Map Box */}
            <div
              ref={mapRef}
              onClick={handleMapClick}
              className={`relative w-full h-64 sm:h-72 rounded-2xl border-2 border-slate-700 overflow-hidden cursor-crosshair select-none shadow-inner ${
                mapStyle === 'dark'
                  ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
                  : 'bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900'
              }`}
            >
              {/* Map Grid Pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:36px_36px] opacity-35" />

              {/* Bay / Coastline Water Decorative Curve */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                <path
                  d="M 0 50 Q 150 120 280 40 T 600 90 L 600 0 L 0 0 Z"
                  fill="#0284c7"
                  fillOpacity="0.25"
                />
                <path
                  d="M 500 0 Q 420 180 550 300 L 600 300 L 600 0 Z"
                  fill="#0369a1"
                  fillOpacity="0.2"
                />
              </svg>

              {/* City Blocks & Arteries */}
              <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute top-12 left-10 w-24 h-16 rounded-lg bg-slate-700 border border-slate-600/50" />
                <div className="absolute top-10 left-44 w-36 h-20 rounded-lg bg-slate-700 border border-slate-600/50" />
                <div className="absolute top-36 left-20 w-44 h-24 rounded-lg bg-slate-700 border border-slate-600/50" />
                <div className="absolute bottom-6 right-16 w-32 h-20 rounded-lg bg-slate-700 border border-slate-600/50" />
              </div>

              {/* Street Names on Map */}
              <div className="absolute top-6 left-12 text-[10px] font-bold text-slate-500 uppercase tracking-widest pointer-events-none">
                Marina & Waterfront Blvd
              </div>
              <div className="absolute top-28 left-48 text-[10px] font-bold text-slate-500 uppercase tracking-widest pointer-events-none">
                Market Street Center
              </div>
              <div className="absolute bottom-10 left-24 text-[10px] font-bold text-slate-500 uppercase tracking-widest pointer-events-none">
                Mission St • 24th Corridor
              </div>

              {/* Restaurant Hub Pins on Map */}
              <div className="absolute top-16 left-60 pointer-events-none flex items-center gap-1 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Bella Napoli Hub
              </div>
              <div className="absolute bottom-16 right-28 pointer-events-none flex items-center gap-1 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/40 text-blue-300 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                Royal Spice Kitchen
              </div>

              {/* Pulse Delivery Radius Ring around User Pin */}
              <div
                className="absolute pointer-events-none transition-all duration-300 ease-out"
                style={{
                  left: `${pinPos.x}%`,
                  top: `${pinPos.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Outer ping */}
                <div className="w-24 h-24 rounded-full bg-orange-500/15 border border-orange-500/30 animate-ping absolute -top-12 -left-12" />
                {/* Semi-transparent radius */}
                <div className="w-28 h-28 rounded-full bg-orange-500/10 border border-dashed border-orange-400/50 -translate-x-1/2 -translate-y-1/2 absolute top-0 left-0" />
              </div>

              {/* The Dropped Delivery Pin */}
              <div
                className="absolute pointer-events-none transition-all duration-300 ease-out z-20 flex flex-col items-center"
                style={{
                  left: `${pinPos.x}%`,
                  top: `${pinPos.y}%`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                {/* Pin Tooltip */}
                <div className="px-2.5 py-1 rounded-lg bg-orange-600 text-white text-[11px] font-black shadow-lg shadow-black/50 border border-orange-400 whitespace-nowrap mb-1 animate-bounce">
                  Deliver Here
                </div>
                {/* Pin Icon */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-xl shadow-orange-900/60 ring-2 ring-white">
                  <MapPin className="w-5 h-5 fill-white text-orange-600" />
                </div>
                <div className="w-2 h-2 bg-orange-600 rotate-45 -mt-1" />
              </div>

              {/* Bottom HUD Bar in Map */}
              <div className="absolute bottom-2 left-2 right-2 p-2 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/80 flex flex-wrap items-center justify-between text-xs text-white z-10 gap-2">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-orange-400 shrink-0" />
                  <span className="font-mono text-[11px] text-slate-300">
                    Lat: <strong className="text-white">{coords.lat}</strong> | Lng: <strong className="text-white">{coords.lng}</strong>
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Delivery Zone: Express Courier Area
                </div>
              </div>
            </div>

            {/* GPS Status Message */}
            {gpsStatus && (
              <p className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                {gpsStatus}
              </p>
            )}
          </div>

          {/* Quick Preset Saved Addresses */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Quick Saved Locations & Landmarks:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_ADDRESSES.map((preset) => {
                const IconComponent = preset.icon;
                const isSelected = street.toLowerCase().includes(preset.street.slice(0, 10).toLowerCase());
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-orange-50/80 border-orange-500 ring-2 ring-orange-500/20'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${
                      isSelected ? 'bg-orange-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{preset.tag}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-orange-600" />}
                      </div>
                      <p className="text-xs text-slate-600 truncate mt-0.5">{preset.street}</p>
                      <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{preset.zone}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Address Form Fields */}
          <form id="address-form" onSubmit={handleSaveAddress} className="space-y-4 pt-2">
            
            {/* Tag Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Address Label</label>
              <div className="flex gap-2">
                {['Home', 'Work', 'Live GPS', 'Other'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedTag === tag
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Street Address */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Street Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. 452 Elm Street, Apt 3B"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>
            </div>

            {/* City, Zip & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="San Francisco"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Postal / Zip</label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="94103"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 800-4321"
                    className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Instructions */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Delivery Instructions (Optional)
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Leave at front door, gate code #402, ring apartment bell"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>
            </div>

          </form>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-600 hidden sm:block truncate max-w-sm">
            Selected: <strong className="text-slate-900">{street || 'No address chosen'}</strong>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="address-form"
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Save Address</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
