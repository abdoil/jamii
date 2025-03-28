"use client"
import { QRCode } from "react-qr-code"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface QRGeneratorProps {
  value: string
  title: string
  description?: string
  size?: number
}

export function QRGenerator({ value, title, description, size = 180 }: QRGeneratorProps) {
  const downloadQRCode = () => {
    const svg = document.getElementById("qr-code")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL("image/png")

      // Download the PNG file
      const downloadLink = document.createElement("a")
      downloadLink.download = `qr-code-${title.toLowerCase().replace(/\s+/g, "-")}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-4 rounded-lg">
        <QRCode id="qr-code" value={value} size={size} level="H" className="h-auto max-w-full" />
      </div>
      <p className="mt-2 font-medium text-center">{title}</p>
      {description && <p className="text-sm text-muted-foreground text-center">{description}</p>}
      <Button variant="outline" size="sm" className="mt-3" onClick={downloadQRCode}>
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>
    </div>
  )
}

