"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { gsap } from "gsap"
import { Upload, Camera, X, Check, AlertTriangle } from "lucide-react"
import { uploadMultipleToIrys, blobURLtoFile } from "@/lib/ipfs/pinata"
import { useWallet } from "@solana/wallet-adapter-react"

interface UploadZoneProps {
  onImageUpload: (images: string[]) => void
  uploadedImages: string[]
  isProcessing: boolean
  onSound: (soundType: "hover" | "click" | "success" | "error") => void
}

export function UploadZone({ onImageUpload, uploadedImages, isProcessing, onSound }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [captureType, setCaptureType] = useState<"front" | "back" | "corner" | "holo">("front")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const { wallet } = useWallet()

  // Animation for drop zone
  useEffect(() => {
    if (dropZoneRef.current) {
      if (isDragging) {
        gsap.to(dropZoneRef.current, {
          borderWidth: 8,
          backgroundColor: "rgba(246, 255, 0, 0.1)",
          scale: 1.02,
          duration: 0.3,
        })
      } else {
        gsap.to(dropZoneRef.current, {
          borderWidth: 4,
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          scale: 1,
          duration: 0.3,
        })
      }
    }
  }, [isDragging])

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    onSound("hover")
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    onSound("click")

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  // Process uploaded files
  const handleFiles = async (files: FileList) => {
    setUploadError("")
    const validFiles = Array.from(files).filter((file) => file.type.startsWith("image/"))

    if (validFiles.length === 0) {
      setUploadError("Please upload valid image files (JPG, PNG, etc.)")
      onSound("error")
      return
    }

    if (!wallet) {
      setUploadError("Please connect your wallet to upload files")
      onSound("error")
      return
    }

    setIsUploading(true)
    setUploadProgress(10)

    try {
      // Upload files to Irys
      const ipfsUrls = await uploadMultipleToIrys(validFiles, wallet)
      
      // Update progress as uploads complete
      setUploadProgress(100)
      
      // Add new URLs to existing ones
      onImageUpload([...uploadedImages, ...ipfsUrls])
      console.log(ipfsUrls)
      onSound("success")
      
      // Reset progress
      setTimeout(() => {
        setUploadProgress(0)
        setIsUploading(false)
      }, 500)
    } catch (error) {
      console.error("Error uploading to Irys:", error)
      setUploadError("Failed to upload to Irys. Please try again.")
      setIsUploading(false)
      setUploadProgress(0)
      onSound("error")
    }
  }

  // Handle camera activation
  const activateCamera = async () => {
    try {
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        videoRef.current.srcObject = stream
        setCameraActive(true)
        onSound("click")
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setUploadError("Could not access camera. Please check permissions.")
      onSound("error")
    }
  }

  // Handle camera capture
  const captureImage = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        try {
          // Convert canvas to blob
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.95)
          })
          
          // Create file from blob
          const file = new File([blob], `pikavault-${captureType}-${Date.now()}.jpg`, { type: "image/jpeg" })
          
          if (!wallet) {
            setUploadError("Please connect your wallet to upload captures")
            onSound("error")
            return
          }
          
          setIsUploading(true)
          setUploadProgress(10)
          
          // Upload to Irys
          const ipfsUrl = await uploadMultipleToIrys([file], wallet)
          
          setUploadProgress(100)
          onImageUpload([...uploadedImages, ...ipfsUrl])
          onSound("success")
          console.log('ii', ipfsUrl)
          // Reset progress
          setTimeout(() => {
            setUploadProgress(0)
            setIsUploading(false)
          }, 500)

          // Move to next capture type
          if (captureType === "front") setCaptureType("back")
          else if (captureType === "back") setCaptureType("corner")
          else if (captureType === "corner") setCaptureType("holo")
          else {
            // Stop camera after all captures
            stopCamera()
          }
        } catch (error) {
          console.error("Error uploading camera capture:", error)
          setUploadError("Failed to upload capture. Please try again.")
          setIsUploading(false)
          setUploadProgress(0)
          onSound("error")
        }
      }
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setCameraActive(false)
      setCaptureType("front")
    }
  }

  // Remove uploaded image
  const removeImage = (index: number) => {
    const newImages = [...uploadedImages]
    newImages.splice(index, 1)
    onImageUpload(newImages)
    onSound("click")
  }

  return (
    <div className="space-y-8">
      {/* Mobile-only buttons (no drag and drop box) */}
      <div className="block sm:hidden">
        <div className="text-center space-y-4">
          <p className="text-xl font-bold text-center mb-4" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
            UPLOAD YOUR CARD
          </p>
          <p className="text-white/70 text-center mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Upload high-quality images of your card (front, back, corners, holographic effect)
          </p>
          
          <div className="flex flex-col gap-3 justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (fileInputRef.current) {
                  fileInputRef.current.click()
                }
                onSound("click")
              }}
              disabled={isUploading}
              className={`px-6 py-4 ${
                isUploading 
                  ? "bg-gray-500 cursor-not-allowed" 
                  : "bg-pikavault-cyan sm:hover:bg-pikavault-cyan/90"
              } text-pikavault-dark font-bold flex items-center justify-center space-x-2`}
              style={{ fontFamily: "'Monument Extended', sans-serif" }}
              onMouseEnter={() => !isUploading && onSound("hover")}
            >
              <Upload className="w-5 h-5" />
              <span>{isUploading ? "UPLOADING..." : "BROWSE FILES"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop/Tablet drag and drop zone */}
      <div
        ref={dropZoneRef}
        className={`relative border-4 border-dashed ${
          isDragging ? "border-pikavault-yellow" : "border-white/30"
        } bg-white/5 p-8 h-80 flex-col items-center justify-center transition-colors duration-300 hidden sm:flex`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !cameraActive && !isUploading && fileInputRef.current?.click()}
      >
        {/* File inputs - shared between mobile and desktop */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleFileInputChange}
          disabled={isUploading}
        />
        
        {/* Camera-specific input */}
        <input
          type="file"
          ref={cameraInputRef}
          className="hidden"
          accept="image/*"
          capture="environment"
          onChange={handleFileInputChange}
          disabled={isUploading}
        />

        {!cameraActive ? (
          <>
            <Upload className="w-16 h-16 text-white/50 mb-4" />
            <p className="text-xl font-bold text-center mb-2" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
              DRAG AND DROP HERE
            </p>
            <p className="text-white/70 text-center mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Upload high-quality images of your card (front, back, corners, holographic effect)
            </p>
            <div className="flex items-center justify-center mb-4">
              <div className="h-px bg-white/30 flex-1"></div>
              <span className="px-4 text-white/50 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                OR
              </span>
              <div className="h-px bg-white/30 flex-1"></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (fileInputRef.current) {
                    fileInputRef.current.click()
                  }
                  onSound("click")
                }}
                disabled={isUploading}
                className={`px-6 py-3 ${
                  isUploading 
                    ? "bg-gray-500 cursor-not-allowed" 
                    : "bg-pikavault-cyan sm:hover:bg-pikavault-cyan/90"
                } text-pikavault-dark font-bold flex items-center justify-center space-x-2`}
                style={{ fontFamily: "'Monument Extended', sans-serif" }}
                onMouseEnter={() => !isUploading && onSound("hover")}
              >
                <Upload className="w-5 h-5" />
                <span>{isUploading ? "UPLOADING..." : "BROWSE FILES"}</span>
              </button>
              
              {/* <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (cameraInputRef.current) {
                    cameraInputRef.current.click()
                  }
                  onSound("click")
                }}
                disabled={isUploading}
                className={`px-6 py-3 ${
                  isUploading 
                    ? "bg-gray-500 cursor-not-allowed" 
                    : "bg-pikavault-yellow sm:hover:bg-pikavault-yellow/90"
                } text-pikavault-dark font-bold flex items-center justify-center space-x-2`}
                style={{ fontFamily: "'Monument Extended', sans-serif" }}
                onMouseEnter={() => !isUploading && onSound("hover")}
              >
                <Camera className="w-5 h-5" />
                <span>{isUploading ? "UPLOADING..." : "USE CAMERA"}</span>
              </button> */}
            </div>
          </>
        ) : (
          <div className="relative w-full h-full">
            <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover"></video>

            {/* Camera overlay */}
            <div className="absolute inset-0 border-8 border-pikavault-yellow pointer-events-none"></div>

            {/* Capture type indicator */}
            <div
              className="absolute top-4 left-4 px-4 py-2 bg-pikavault-dark/80 border-2 border-pikavault-yellow"
              style={{ fontFamily: "'Monument Extended', sans-serif" }}
            >
              CAPTURE: {captureType.toUpperCase()}
            </div>

            {/* Camera controls */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
              <button
                onClick={captureImage}
                disabled={isUploading}
                className={`px-6 py-3 ${
                  isUploading 
                    ? "bg-gray-500 cursor-not-allowed" 
                    : "bg-pikavault-yellow sm:hover:bg-pikavault-yellow/90"
                } text-pikavault-dark font-bold`}
                style={{ fontFamily: "'Monument Extended', sans-serif" }}
                onMouseEnter={() => !isUploading && onSound("hover")}
              >
                {isUploading ? "UPLOADING..." : "CAPTURE"}
              </button>
              <button
                onClick={stopCamera}
                disabled={isUploading}
                className={`px-6 py-3 ${
                  isUploading 
                    ? "bg-gray-500 cursor-not-allowed" 
                    : "bg-pikavault-pink sm:hover:bg-pikavault-pink/90"
                } text-white font-bold`}
                style={{ fontFamily: "'Monument Extended', sans-serif" }}
                onMouseEnter={() => !isUploading && onSound("hover")}
              >
                CANCEL
              </button>
            </div>
          </div>
        )}

        {/* Upload progress */}
        {uploadProgress > 0 && (
          <div className="absolute bottom-0 left-0 right-0">
            <div className="h-4 bg-white/10">
              <div
                className="h-full bg-pikavault-pink"
                style={{ width: `${uploadProgress}%`, transition: "width 0.2s ease-out" }}
              ></div>
            </div>
          </div>
        )}

        {/* Error message */}
        {uploadError && (
          <div className="absolute bottom-4 left-4 right-4 bg-pikavault-pink/20 border-l-4 border-pikavault-pink p-4 flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-pikavault-pink flex-shrink-0 mt-0.5" />
            <p style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{uploadError}</p>
          </div>
        )}
      </div>

      {/* Mobile upload progress and errors */}
      {(uploadProgress > 0 || uploadError) && (
        <div className="block sm:hidden">
          {uploadProgress > 0 && (
            <div className="mb-4">
              <div className="h-4 bg-white/10 rounded">
                <div
                  className="h-full bg-pikavault-pink rounded"
                  style={{ width: `${uploadProgress}%`, transition: "width 0.2s ease-out" }}
                ></div>
              </div>
            </div>
          )}
          
          {uploadError && (
            <div className="bg-pikavault-pink/20 border-l-4 border-pikavault-pink p-4 flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-pikavault-pink flex-shrink-0 mt-0.5" />
              <p style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{uploadError}</p>
            </div>
          )}
        </div>
      )}

      {/* Hidden canvas for camera capture */}
      <canvas ref={canvasRef} className="hidden"></canvas>

      {/* Uploaded images */}
      {uploadedImages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
            UPLOADED IMAGES
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative group">
                <div className="relative aspect-square overflow-hidden border-2 border-white/30 sm:group-hover:border-white/70 transition-colors duration-300">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Card image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-pikavault-dark/70 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-pikavault-cyan border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 w-8 h-8 bg-pikavault-pink text-white flex items-center justify-center opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300"
                  onMouseEnter={() => onSound("hover")}
                >
                  <X className="w-5 h-5" />
                </button>
                {isProcessing && index === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-pikavault-dark/80 py-1 px-2">
                    <p className="text-xs text-pikavault-cyan" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Analyzing card...
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {isProcessing && (
            <div className="bg-pikavault-dark border-l-4 border-pikavault-cyan p-4">
              <div className="flex items-center space-x-4">
                <div className="w-6 h-6 border-4 border-pikavault-cyan border-t-transparent rounded-full animate-spin"></div>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  AI processing your card images. Detecting card details...
                </p>
              </div>
            </div>
          )}

          {!isProcessing && uploadedImages.length >= 2 && (
            <div className="bg-pikavault-dark border-l-4 border-pikavault-cyan p-4 flex items-start space-x-2">
              <Check className="w-5 h-5 text-pikavault-cyan flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Card detected successfully!
                </p>
                <p className="text-white/70" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  We've identified your card as "ELECTRIC SURGE" from the NEO THUNDER set.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload tips */}
      <div className="bg-white/5 p-6 border-l-4 border-white/30">
        <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
          PHOTO TIPS
        </h3>
        <ul className="space-y-2 text-white/70" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <li className="flex items-start space-x-2">
            <span className="text-pikavault-yellow font-bold">•</span>
            <span>Use good lighting without glare or shadows</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-pikavault-yellow font-bold">•</span>
            <span>Capture front and back on a dark, solid background</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-pikavault-yellow font-bold">•</span>
            <span>Include close-ups of corners and edges to show condition</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-pikavault-yellow font-bold">•</span>
            <span>For holographic cards, capture at an angle to show the effect</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
