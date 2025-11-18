import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import useKeypress from "react-use-keypress";
import type { ImageProps } from "../utils/types";
import SharedModal from "./SharedModal";

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
    router.push(
      {
        query: { photoId: newVal },
      },
      `/p/${newVal}`,
      { shallow: true },
    );
  }

  useKeypress("ArrowRight", () => {
    const currentImageIndex = images.findIndex(img => img.id === index);
    if (images && currentImageIndex < images.length - 1) {
      const nextImage = images[currentImageIndex + 1];
      if (nextImage) {
        changePhotoId(nextImage.id);
      }
    }
  });

  useKeypress("ArrowLeft", () => {
    const currentImageIndex = images.findIndex(img => img.id === index);
    if (currentImageIndex > 0) {
      const prevImage = images[currentImageIndex - 1];
      if (prevImage) {
        changePhotoId(prevImage.id);
      }
    }
  });

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
      <SharedModal
        index={index}
        direction={direction}
        images={images}
        changePhotoId={changePhotoId}
        closeModal={handleClose}
        navigation={true}
        currentPhoto={images ? images.find(img => img.id === index) : undefined}
        onDelete={onDelete}
      />
    </Dialog>
  );
}
