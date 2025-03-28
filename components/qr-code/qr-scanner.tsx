"use client"

import { useState, useEffect } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, QrCode, Camera, X } from "lucide-react"

interface QRScannerProps {
  onScan: (data: string) => void
  title: string
  description?: string
}

export function QRScanner({ onScan, title, description }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scannerInstance, setScannerInstance] = useState<Html5Qrcode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Cleanup scanner on component unmount
    return () => {
      if (scannerInstance) {
        scannerInstance.stop().catch((error) => console.error("Error stopping scanner:", error))
      }
    }
  }, [scannerInstance])

  const startScanner = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const html5QrCode = new Html5Qrcode("qr-reader")
      setScannerInstance(html5QrCode)

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // On successful scan
          onScan(decodedText)
          stopScanner()
        },
        (errorMessage) => {
          // Ignore the error as it's continuously thrown while scanning
          // Only show critical errors
          if (errorMessage.includes("Camera access denied")) {
            setError("Camera access denied. Please allow camera access and try again.")
            stopScanner()
          }
        },
      )

      setIsScanning(true)
    } catch (err) {
      console.error("Error starting scanner:", err)
      setError("Failed to start camera. Please make sure you have a camera and have granted permission.")
    } finally {
      setIsLoading(false)
    }
  }

  const stopScanner = () => {
    if (scannerInstance) {
      scannerInstance.stop().catch((error) => console.error("Error stopping scanner:", error))
      setScannerInstance(null)
    }
    setIsScanning(false)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <QrCode className="mr-2 h-5 w-5" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {error && <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

        <div id="qr-reader" className="w-full overflow-hidden" style={{ height: isScanning ? "300px" : "0" }}></div>

        {!isScanning ? (
          <Button className="w-full" onClick={startScanner} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing Camera...
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Start Scanning
              </>
            )}
          </Button>
        ) : (
          <Button variant="outline" className="w-full mt-4" onClick={stopScanner}>
            <X className="mr-2 h-4 w-4" />
            Stop Scanning
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

