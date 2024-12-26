'use client'

import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'

export default function WebcamComponent() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPiPActive, setIsPiPActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPiPSupported, setIsPiPSupported] = useState(false)

  useEffect(() => {
    // Check if PiP is supported
    if (document.pictureInPictureEnabled) {
      setIsPiPSupported(true)
    } else {
      setError("Picture-in-Picture is not supported in this browser.")
    }

    // Access the webcam
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      })
      .catch((err) => {
        setError("Error accessing the webcam: " + err.message)
      })

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [])

  const togglePiP = async () => {
    if (!videoRef.current) return

    try {
      if (!isPiPActive) {
        await videoRef.current.requestPictureInPicture()
        setIsPiPActive(true)
      } else {
        await document.exitPictureInPicture()
        setIsPiPActive(false)
      }
    } catch (error) {
      if (error instanceof Error) {
        setError("Error toggling Picture-in-Picture: " + error.message)
      } else {
        setError("An unknown error occurred while toggling Picture-in-Picture")
      }
    }
  }

  return (
    <div className="flex flex-col items-center">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline
        className="w-full max-w-xl mb-4 rounded-lg shadow-lg"
      />
      {isPiPSupported && (
        <Button onClick={togglePiP} disabled={!!error}>
          {isPiPActive ? 'Keluar dari' : 'Aktifkan'} Picture-in-Picture
        </Button>
      )}
    </div>
  )
}

