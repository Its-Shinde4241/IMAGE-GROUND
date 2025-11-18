import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import useKeypress from "react-use-keypress";
import Image from "next/image";
import {
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { ImageProps } from "../utils/types";
import downloadPhoto from "../utils/downloadPhoto";
import { variants } from "../utils/animationVariants";

export default function Modal({
  images,
  onClose,
  onDelete,
}: {
  images: ImageProps[];
  onClose?: () => void;
  onDelete?: (imageId: number) => void;
}) {
  let overlayRef = useRef();
  const router = useRouter();

  const { photoId } = router.query;
  let index = Number(photoId);

  const [direction, setDirection] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Find current image by ID instead of index
  let currentImage = images ? images.find(img => img.id === index) : undefined;
  let currentImageIndex = images ? images.findIndex(img => img.id === index) : -1;

  // Debug logging
  console.log('Modal Debug:', {
    photoId: index,
    imagesLength: images?.length || 0,
    currentImageIndex,
    currentImageFound: !!currentImage,
    firstImageId: images?.[0]?.id,
    lastImageId: images?.[images.length - 1]?.id
  });

  function handleClose() {
    router.push("/", undefined, { shallow: true });
    onClose?.();
  }

  function changePhotoId(newVal: number) {
    if (newVal > index) {
      setDirection(1);
    } else {
      setDirection(-1);
    }
    // Reset loading state when changing images
    setImageLoading(true);
    setImageError(false);
    router.push(
      {
        query: { photoId: newVal },
      },
      `/p/${newVal}`,
      { shallow: true },
    );
  }

  useKeypress("ArrowRight", () => {
    if (images && images.length > 0) {
      const currentImageIndex = images.findIndex(img => img.id === index);
      if (currentImageIndex >= 0 && currentImageIndex < images.length - 1) {
        const nextImage = images[currentImageIndex + 1];
        if (nextImage) {
          changePhotoId(nextImage.id);
        }
      }
    }
  });

  useKeypress("ArrowLeft", () => {
    if (images && images.length > 0) {
      const currentImageIndex = images.findIndex(img => img.id === index);
      if (currentImageIndex > 0) {
        const prevImage = images[currentImageIndex - 1];
        if (prevImage) {
          changePhotoId(prevImage.id);
        }
      }
    }
  });

  useKeypress("Escape", handleClose);

  // Safety check for currentImage - if deleted, close modal immediately
  if (!currentImage) {
    handleClose();
    return null;
  }

  return (
    <Dialog
      static
      open={true}
      onClose={handleClose}
      initialFocus={overlayRef}
      className="fixed inset-0 z-10 flex items-center justify-center"
    >
      <Dialog.Overlay
        ref={overlayRef}
        as={motion.div}
        key="backdrop"
        className="fixed inset-0 z-30 bg-black/70 backdrop-blur-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      <MotionConfig
        transition={{
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
        }}
      >
        <div className="relative z-50 flex w-full h-full items-center justify-center p-4">
          {/* Loading indicator */}
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-30">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-lg">Loading image...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-30">
              <div className="text-white text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <p className="text-lg mb-4">Failed to load image</p>
                <button
                  onClick={() => {
                    setImageError(false);
                    setImageLoading(true);
                  }}
                  className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Main image */}
          <div className="w-full h-full flex items-center justify-center overflow-hidden">
            <div className="relative flex items-center justify-center max-w-full max-h-full">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={index}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute flex items-center justify-center"
                >
                  <Image
                    src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_fit,w_1920,h_1080/${currentImage.public_id}.${currentImage.format}`}
                    width={1920}
                    height={1080}
                    priority
                    alt="Gallery image"
                    onLoad={() => {
                      setLoaded(true);
                      setImageLoading(false);
                      setImageError(false);
                    }}
                    onError={() => {
                      setImageLoading(false);
                      setImageError(true);
                    }}
                    onLoadStart={() => {
                      setImageLoading(true);
                      setImageError(false);
                    }}
                    className="max-w-full max-h-full object-contain"
                    style={{
                      maxWidth: "calc(100vw - 2rem)",
                      maxHeight: "calc(100vh - 2rem)"
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Controls - Only show delete, download, and close buttons */}
          <div className="absolute inset-0 mx-auto flex items-center justify-center pointer-events-none">
            <div className="relative w-full h-full max-w-7xl pointer-events-none">
              {/* Top controls */}
              <div className="absolute top-0 right-0 flex items-center gap-2 p-3 text-white pointer-events-auto">
                <a
                  href={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${currentImage.public_id}.${currentImage.format}`}
                  className="rounded-full bg-black/60 p-2 text-white/80 backdrop-blur-lg transition hover:bg-black/80 hover:text-white"
                  target="_blank"
                  title="Open fullsize version"
                  rel="noreferrer"
                >
                  <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                </a>
                <button
                  onClick={() =>
                    downloadPhoto(
                      `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${currentImage.public_id}.${currentImage.format}`,
                      `${currentImage.public_id}.jpg`,
                    )
                  }
                  className="rounded-full bg-black/60 p-2 text-white/80 backdrop-blur-lg transition hover:bg-black/80 hover:text-white"
                  title="Download fullsize version"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </button>
                {onDelete && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="rounded-full bg-red-600/60 p-2 text-white/80 backdrop-blur-lg transition hover:bg-red-600/80 hover:text-white border border-red-500/30"
                    title="Delete image"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="absolute top-0 left-0 flex items-center gap-2 p-3 text-white pointer-events-auto">
                <button
                  onClick={() => handleClose()}
                  className="rounded-full bg-black/60 p-2 text-white/80 backdrop-blur-lg transition hover:bg-black/80 hover:text-white"
                  title="Close"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>



          {/* Delete Confirmation Dialog */}
          {showDeleteConfirm && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-50">
              <div className="bg-gray-900 border border-gray-700/50 rounded-xl p-8 max-w-md mx-4 shadow-2xl">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-900/20 border border-red-500/30 mb-6">
                    <TrashIcon className="h-8 w-8 text-red-400" />
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-3">Delete Image</h3>
                  <p className="text-gray-300 text-sm mb-8 leading-relaxed">
                    Are you sure you want to delete this image? This action cannot be undone and the image will be permanently removed from your gallery.
                  </p>
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="px-6 py-2.5 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium border border-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (onDelete && currentImage && !deleting) {
                        setDeleting(true);
                        try {
                          await onDelete(currentImage.id);
                          setShowDeleteConfirm(false);
                          // Close modal and go back to gallery immediately
                          handleClose();
                        } catch (error) {
                          console.error('Delete failed:', error);
                          setDeleting(false);
                        }
                      }
                    }}
                    disabled={deleting}
                    className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-all duration-200 font-medium shadow-lg hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {deleting && (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    )}
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </MotionConfig>
    </Dialog>
  );
}