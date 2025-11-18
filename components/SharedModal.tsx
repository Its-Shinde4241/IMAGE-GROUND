import {
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  ArrowUturnLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { variants } from "../utils/animationVariants";
import downloadPhoto from "../utils/downloadPhoto";
import { range } from "../utils/range";
import type { ImageProps, SharedModalProps } from "../utils/types";

export default function SharedModal({
  index,
  images,
  changePhotoId,
  closeModal,
  navigation,
  currentPhoto,
  direction,
  onDelete,
}: SharedModalProps) {
  const [loaded, setLoaded] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Find current image by ID instead of index
  let currentImage = images ? images.find(img => img.id === index) || images[0] : currentPhoto;
  let currentImageIndex = images ? images.findIndex(img => img.id === index) : 0;

  let filteredImages = images?.filter((img: ImageProps) =>
    range(Math.max(0, currentImageIndex - 15), Math.min(images.length - 1, currentImageIndex + 15)).includes(images.findIndex(i => i.id === img.id))
  );

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentImageIndex < (images?.length || 0) - 1) {
        const nextImage = images?.[currentImageIndex + 1];
        if (nextImage) {
          changePhotoId(nextImage.id);
        }
      }
    },
    onSwipedRight: () => {
      if (currentImageIndex > 0) {
        const prevImage = images?.[currentImageIndex - 1];
        if (prevImage) {
          changePhotoId(prevImage.id);
        }
      }
    },
    trackMouse: true,
  });

  // Safety check for currentImage
  if (!currentImage) {
    return (
      <div className="relative z-50 flex w-full h-full items-center justify-center p-4">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading image...</p>
        </div>
      </div>
    );
  }

  return (
    <MotionConfig
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
    >
      <div
        className="relative z-50 flex w-full h-full items-center justify-center p-4"
        {...handlers}
      >
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
                  src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
                    }/image/upload/c_fit,${navigation ? "w_1920,h_1080" : "w_2560,h_1440"}/${currentImage.public_id
                    }.${currentImage.format}`}
                  width={navigation ? 1920 : 2560}
                  height={navigation ? 1080 : 1440}
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

        {/* Buttons + bottom nav bar */}
        <div className="absolute inset-0 mx-auto flex items-center justify-center pointer-events-none">
          {/* Buttons */}
          {loaded && (
            <div className="relative w-full h-full max-w-7xl pointer-events-none">
              {navigation && (
                <>
                  {currentImageIndex > 0 && (
                    <button
                      type="button"
                      title="Previous image"
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white focus:outline-none pointer-events-auto transform-gpu"
                      onClick={() => {
                        const prevImage = images?.[currentImageIndex - 1];
                        if (prevImage) {
                          changePhotoId(prevImage.id);
                        }
                      }}
                    >
                      <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                  )}
                  {currentImageIndex < (images?.length || 0) - 1 && (
                    <button
                      type="button"
                      title="Next image"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white focus:outline-none pointer-events-auto transform-gpu"
                      onClick={() => {
                        const nextImage = images?.[currentImageIndex + 1];
                        if (nextImage) {
                          changePhotoId(nextImage.id);
                        }
                      }}
                    >
                      <ChevronRightIcon className="h-6 w-6" />
                    </button>
                  )}
                </>
              )}
              <div className="absolute top-0 right-0 flex items-center gap-2 p-3 text-white pointer-events-auto">
                <a
                  href={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${currentImage.public_id}.${currentImage.format}`}
                  className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
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
                  className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
                  title="Download fullsize version"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </button>
                {onDelete && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="rounded-full bg-red-600/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-red-600/75 hover:text-white border border-red-500/30"
                    title="Delete image"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
              <div className="absolute top-0 left-0 flex items-center gap-2 p-3 text-white pointer-events-auto">
                <button
                  onClick={() => closeModal()}
                  className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
                >
                  {navigation ? (
                    <XMarkIcon className="h-5 w-5" />
                  ) : (
                    <ArrowUturnLeftIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          )}
          {/* Bottom Nav bar */}
          {navigation && filteredImages && (
            <div className="fixed inset-x-0 bottom-0 z-40 overflow-hidden bg-gradient-to-b from-black/0 to-black/60">
              <motion.div
                initial={false}
                className="mx-auto mt-6 mb-6 flex aspect-[3/2] h-14"
              >
                <AnimatePresence initial={false}>
                  {filteredImages.map((image) => {
                    // Safety check for image properties
                    if (!image || !image.public_id || !image.format) return null;

                    const { public_id, format, id } = image;
                    return (
                      <motion.button
                        initial={{
                          width: "0%",
                          x: `${Math.max((currentImageIndex - 1) * -100, 15 * -100)}%`,
                        }}
                        animate={{
                          scale: id === index ? 1.25 : 1,
                          width: "100%",
                          x: `${Math.max(currentImageIndex * -100, 15 * -100)}%`,
                        }}
                        exit={{ width: "0%" }}
                        onClick={() => changePhotoId(id)}
                        key={id}
                        className={`${id === index
                          ? "z-20 rounded-md shadow shadow-black/50"
                          : "z-10"
                          } ${id === 0 ? "rounded-l-md" : ""} ${id === (images?.length || 0) - 1 ? "rounded-r-md" : ""
                          } relative inline-block w-full shrink-0 transform-gpu overflow-hidden focus:outline-none`}
                      >
                        <Image
                          alt="small photos on the bottom"
                          width={180}
                          height={120}
                          className={`${id === index
                            ? "brightness-110 hover:brightness-110"
                            : "brightness-60 contrast-125 hover:brightness-90"
                            } h-full transform object-cover transition-all duration-300 ease-out rounded-sm`}
                          src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_180/${public_id}.${format}`}
                          onError={(e) => {
                            // Hide broken image thumbnails
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
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
                  className="px-6 py-2.5 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium border border-gray-600/50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (onDelete && currentImage) {
                      onDelete(currentImage.id);
                      setShowDeleteConfirm(false);
                      closeModal();
                    }
                  }}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-all duration-200 font-medium shadow-lg hover:shadow-red-500/25"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MotionConfig>
  );
}
