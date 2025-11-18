/* eslint-disable no-unused-vars */
export interface ImageProps {
  id: number;
  height: string;
  width: string;
  public_id: string;
  format: string;
  created_at: string;
  blurDataUrl?: string;
  isUserUploaded: boolean; // Always boolean - true for user uploads, false for original gallery
}

export interface SharedModalProps {
  index: number;
  images?: ImageProps[];
  currentPhoto?: ImageProps;
  changePhotoId: (newVal: number) => void;
  closeModal: () => void;
  navigation: boolean;
  direction?: number;
  onDelete?: (imageId: number) => void;
}
