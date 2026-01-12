// Barcode Scanner Component - Mobile camera scanning with offline support
import { useState, useRef, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { addToOfflineQueue, isOnline, getSyncStatus } from "../utils/offlineSync";
import { createAuditLog } from "../utils/audit";

export default function BarcodeScanner({ onScan, onClose }) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [lastScanned, setLastScanned] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const codeReaderRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const [syncStatus, setSyncStatus] = useState(getSyncStatus());

  useEffect(() => {
    // Update sync status periodically
    const interval = setInterval(() => {
      setSyncStatus(getSyncStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      
      // Initialize barcode reader
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
      }

      // Get available video input devices
      let selectedDeviceId = null;
      try {
        const videoInputDevices = await codeReaderRef.current.listVideoInputDevices();
        
        // Prefer back camera on mobile
        const backCamera = videoInputDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        );
        
        if (backCamera) {
          selectedDeviceId = backCamera.deviceId;
        } else if (videoInputDevices.length > 0) {
          selectedDeviceId = videoInputDevices[videoInputDevices.length - 1].deviceId; // Use last device (usually back camera)
        }
      } catch (deviceError) {
        console.warn('Could not list devices, using default:', deviceError);
        // Continue with default device
      }

      // Start decoding from video
      if (videoRef.current) {
        try {
          codeReaderRef.current.decodeFromVideoDevice(
            selectedDeviceId,
            videoRef.current,
            (result, error) => {
              if (result) {
                // Barcode detected!
                const barcode = result.getText();
                console.log('Barcode scanned:', barcode);
                handleBarcodeScanned(barcode);
                // Stop scanning after successful scan
                stopScanning();
              }
              if (error) {
                // NotFoundException is normal - it means no barcode found yet
                if (error.name !== 'NotFoundException' && error.name !== 'NoQRCodeFoundException') {
                  console.error('Scanning error:', error);
                }
              }
            }
          );
          
          setScanning(true);
        } catch (decodeError) {
          console.error('Decode error:', decodeError);
          setError("Unable to start barcode scanning. Please try again.");
        }
      }
    } catch (err) {
      setError("Unable to access camera. Please check permissions.");
      console.error("Camera error:", err);
    }
  };

  const stopScanning = () => {
    // Stop barcode reader
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    
    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    // Clear scan interval
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    setScanning(false);
  };

  const handleManualInput = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      handleBarcodeScanned(e.target.value.trim());
      e.target.value = "";
    }
  };

  const handleBarcodeScanned = (barcode) => {
    setLastScanned({
      barcode,
      timestamp: new Date().toISOString(),
    });

    // Create audit log
    createAuditLog("scanned", null, barcode, {
      notes: `Barcode scanned: ${barcode}`,
    });

    // If offline, add to queue
    if (!isOnline()) {
      addToOfflineQueue("scan", { barcode, timestamp: new Date().toISOString() });
    }

    if (onScan) {
      onScan(barcode);
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
      // Cleanup barcode reader
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
        codeReaderRef.current = null;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Barcode Scanner</h2>
          <button
            onClick={() => {
              stopScanning();
              if (onClose) onClose();
            }}
            className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Sync Status */}
          <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${syncStatus.isOnline ? "bg-emerald-500" : "bg-red-500"}`}></div>
              <span className="text-sm text-slate-300">
                {syncStatus.isOnline ? "Online" : "Offline"}
              </span>
            </div>
            {syncStatus.pendingItems > 0 && (
              <span className="text-xs text-yellow-400">
                {syncStatus.pendingItems} pending sync
              </span>
            )}
          </div>

          {/* Camera View */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${scanning ? 'block' : 'hidden'}`}
            />
            {!scanning && (
              <div className="flex items-center justify-center h-full absolute inset-0">
                <div className="text-center">
                  <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <p className="text-slate-400">Camera not active</p>
                </div>
              </div>
            )}

            {/* Scanning overlay */}
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-emerald-500 rounded-lg w-64 h-64"></div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Manual Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Or enter barcode manually
            </label>
            <input
              type="text"
              placeholder="Enter barcode and press Enter"
              onKeyPress={handleManualInput}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Last Scanned */}
          {lastScanned && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <div className="text-xs text-slate-400 mb-1">Last Scanned</div>
              <div className="text-sm font-mono text-emerald-400">{lastScanned.barcode}</div>
              <div className="text-xs text-slate-500 mt-1">
                {new Date(lastScanned.timestamp).toLocaleTimeString()}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            {!scanning ? (
              <button
                onClick={startScanning}
                className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Start Scanning
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                Stop Scanning
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500 text-center">
            Point camera at barcode or enter manually. Works offline and syncs automatically.
          </p>
        </div>
      </div>
    </div>
  );
}

