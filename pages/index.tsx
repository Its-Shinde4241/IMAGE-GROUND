import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Modal from "../components/Modal";
import { CardBody, CardContainer, CardItem } from "../components/CardContainer";
import cloudinary from "../utils/cloudinary";
import getBase64ImageUrl from "../utils/generateBlurPlaceholder";
import type { ImageProps } from "../utils/types";
import { useLastViewedPhoto } from "../utils/useLastViewedPhoto";

const Home: NextPage = ({ images }: { images: ImageProps[] }) => {
  const router = useRouter();
  const { photoId } = router.query;
  const [lastViewedPhoto, setLastViewedPhoto] = useLastViewedPhoto();
  const [isClient, setIsClient] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [deletedImageIds, setDeletedImageIds] = useState<Set<number>>(new Set());

  const lastViewedPhotoRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (lastViewedPhoto && !photoId) {
      lastViewedPhotoRef.current?.scrollIntoView({ block: "center" });
      setLastViewedPhoto(null);
    }
  }, [photoId, lastViewedPhoto, setLastViewedPhoto]);

  // Get all images excluding deleted ones
  const getAllImages = (): ImageProps[] => {
    const filteredOriginalImages = images.filter(img => !deletedImageIds.has(img.id));
    return filteredOriginalImages;
  };

  const handleDelete = async (imageId: number) => {
    console.log('handleDelete called with imageId:', imageId);

    // Find the image to get its details
    const imageToDelete = getAllImages().find(img => img.id === imageId);

    if (!imageToDelete) {
      console.error('Image not found for deletion');
      alert('Image not found for deletion');
      return;
    }

    console.log('Image found for deletion:', imageToDelete);

    try {
      // Check if it's a user-uploaded image
      const isUserUploaded = imageToDelete.isUserUploaded;

      console.log('Delete analysis:', {
        imageId,
        isUserUploaded: imageToDelete.isUserUploaded,
        publicId: imageToDelete.public_id
      });

      // Immediately remove from local array for instant UI feedback
      setDeletedImageIds(prev => {
        const newSet = new Set(Array.from(prev).concat(imageId));
        console.log('Image immediately removed from local view. Deleted IDs:', Array.from(newSet));
        return newSet;
      });

      // Close modal and redirect to home immediately
      router.push("/", undefined, { shallow: true });

      // Delete from Cloudinary in background (don't await)
      console.log('Starting background deletion from Cloudinary:', imageToDelete.public_id);
      fetch('/api/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicId: imageToDelete.public_id,
        }),
      })
        .then(response => {
          console.log('Background delete API response status:', response.status);
          return response.json();
        })
        .then(result => {
          console.log('Background delete API result:', result);
          if (result.success || result.result === 'not found') {
            console.log('✅ Image successfully deleted from Cloudinary in background');
          } else {
            console.warn('⚠️ Background deletion from Cloudinary failed:', result.error);
            // Image is already hidden locally, so this is just a warning
          }
        })
        .catch(error => {
          console.error('❌ Background deletion network error:', error);
          // Image is already hidden locally, so this is just a warning
        });

    } catch (error) {
      console.error('Error during deletion process:', error);
      alert('An error occurred while deleting the image. Please try again.');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setUploadProgress('Preparing image...');

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        setUploadProgress('Uploading to cloud...');

        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              file: reader.result,
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          console.log('Upload result:', result); // Debug log

          if (result.success) {
            setUploadProgress('Processing image...');

            setUploadProgress('Upload complete!');

            // Clear states and refresh page to show new image
            setTimeout(() => {
              setUploading(false);
              setUploadProgress('');
              router.reload(); // Refresh to load the new image from server
            }, 1500);
          } else {
            alert(`Upload failed: ${result.error}`);
            setUploading(false);
            setUploadProgress('');
          }
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          alert(`Upload failed: ${fetchError instanceof Error ? fetchError.message : 'Network error'}`);
          setUploading(false);
          setUploadProgress('');
        }
      };

      reader.onerror = () => {
        alert('Error reading file');
        setUploading(false);
        setUploadProgress('');
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
      setUploading(false);
      setUploadProgress('');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Calculate dimensions from existing images (squares and horizontal rectangles only)
  const calculatePlaceholderDimensions = () => {
    const baseDimensions = [];

    // Extract dimensions from existing images
    images.forEach(image => {
      const aspectRatio = Number(image.width) / Number(image.height);
      const baseWidth = 300; // Base width for calculations

      if (aspectRatio >= 0.8 && aspectRatio <= 1.2) {
        // Square-ish (0.8 - 1.2 aspect ratio)
        baseDimensions.push({ width: baseWidth, height: baseWidth });
      } else if (aspectRatio > 1.2) {
        // Horizontal rectangle
        const height = Math.round(baseWidth / aspectRatio);
        baseDimensions.push({ width: baseWidth, height });
      }
      // Skip vertical rectangles (aspectRatio < 0.8)
    });

    // Add some default dimensions if no suitable images found
    if (baseDimensions.length === 0) {
      baseDimensions.push(
        { width: 300, height: 300 }, // Square
        { width: 300, height: 200 }, // 3:2 horizontal
        { width: 300, height: 225 }, // 4:3 horizontal
        { width: 300, height: 169 }, // 16:9 horizontal
      );
    }

    return baseDimensions;
  };

  // Generate single upload card with random dimensions
  const generateUploadCard = () => {
    if (!isClient) return null;

    const dimensions = calculatePlaceholderDimensions();
    // Add vertical rectangles back for more variety
    const allDimensions = [
      ...dimensions,
      { width: 200, height: 300 }, // Vertical 2:3
      { width: 250, height: 350 }, // Vertical
      { width: 180, height: 280 }, // Vertical
    ];

    const randomDimension = allDimensions[Math.floor(Math.random() * allDimensions.length)];
    const width = randomDimension.width + Math.random() * 40 - 20;
    const height = randomDimension.height + Math.random() * 30 - 15;

    return (
      <div key="upload-card" className="relative break-inside-avoid mb-1">
        <CardContainer className="inter-var" containerClassName="p-0">
          <CardBody
            className="bg-gray-50/5 relative group/card hover:shadow-2xl hover:shadow-green-500/[0.3] dark:bg-black/20 dark:border-white/[0.1] border-black/[0.05] w-full rounded-lg p-1 border backdrop-blur-sm overflow-hidden transition-all duration-500 ease-out transform hover:-translate-y-2"
            style={{
              width: `${Math.max(180, width)}px`,
              height: `${Math.max(180, height)}px`,
              aspectRatio: `${Math.max(180, width)} / ${Math.max(180, height)}`
            }}
          >
            <CardItem
              translateZ="150"
              rotateX="5"
              className="w-full h-full flex items-center justify-center cursor-pointer"
              onClick={handleUploadClick}
            >
              <div className="flex flex-col items-center justify-center text-white/40 hover:text-white/70 transition-colors duration-300">
                {uploading ? (
                  <>
                    <div className="w-12 h-12 mb-3 rounded-full border-3 border-solid border-green-500/50 border-t-green-500 animate-spin flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-green-500/20"></div>
                    </div>
                    <p className="text-sm font-medium opacity-90 text-center px-2">{uploadProgress}</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 mb-3 rounded-full border-3 border-dashed border-white/40 flex items-center justify-center hover:border-white/60 transition-colors duration-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium opacity-70">Upload</p>
                  </>
                )}
              </div>
            </CardItem>
          </CardBody>
        </CardContainer>
      </div>
    );
  };

  // Create gallery with upload card at first position
  const createGallery = () => {
    const allImages = getAllImages(); // Use filtered images
    const uploadCard = generateUploadCard();

    const imageComponents = allImages.map((image) => {
      const uploadDate = new Date(image.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      return (
        <div
          key={image.id}
          ref={image.id === Number(lastViewedPhoto) ? lastViewedPhotoRef : null}
          className="relative break-inside-avoid mb-1"
        >
          <CardContainer className="inter-var" containerClassName="p-0">
            <CardBody
              className="bg-gray-50/10 relative group/card hover:shadow-2xl hover:shadow-blue-500/[0.4] dark:bg-black/40 dark:border-white/[0.2] border-black/[0.1] w-full rounded-lg p-1 border backdrop-blur-sm overflow-hidden transition-all duration-500 ease-out transform hover:-translate-y-2"
            >
              {/* Upload Date Badge */}
              <CardItem
                translateZ="50"
                className="absolute top-1.5 right-1.5 px-2 py-1 bg-gray-700 bg-transparent text-white text-xs rounded-sm backdrop-blur-md z-10 font-medium"
              >
                {uploadDate}
              </CardItem>

              {/* Main Image */}
              <CardItem translateZ="150" rotateX="5" className="w-full h-full">
                <Link
                  href={`/?photoId=${image.id}`}
                  as={`/p/${image.id}`}
                  shallow
                  className="after:content group relative block w-full h-full cursor-zoom-in after:pointer-events-none after:absolute after:inset-0 after:shadow-highlight"
                >
                  <Image
                    alt="Gallery photo"
                    className="w-full h-full object-cover brightness-90 transition-all duration-500 ease-out will-change-auto group-hover:brightness-110 group-hover:scale-105"
                    style={{ transform: "translate3d(0, 0, 0)" }}
                    placeholder="blur"
                    blurDataURL={image.blurDataUrl}
                    src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_720/${image.public_id}.${image.format}`}
                    width={720}
                    height={480}
                    sizes="(max-width: 640px) 100vw,
                    (max-width: 1280px) 50vw,
                    (max-width: 1536px) 33vw,
                    25vw"
                  />
                </Link>
              </CardItem>

              {/* Bottom Gradient Overlay */}
              <CardItem
                translateZ="20"
                className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"
              >
                <div></div>
              </CardItem>
            </CardBody>
          </CardContainer>
        </div>
      );
    });

    // Return upload card first, then all images
    return uploadCard ? [uploadCard, ...imageComponents] : imageComponents;
  }; return (
    <>
      <Head>
        <title>IMAGE-GROUND</title>
        <meta
          property="og:image"
          content="/og-image.png"
        />
        <meta
          name="twitter:image"
          content="/og-image.png"
        />
      </Head>
      <main className="mx-auto max-w-[1960px] p-4">
        {photoId && (
          <Modal
            images={getAllImages()}
            onClose={() => {
              setLastViewedPhoto(photoId);
            }}
            onDelete={handleDelete}
          />
        )}

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            IMAGE GROUND
          </h1>
          <p className="text-white/75 text-lg">
            Browse through my collection with 3D effects
          </p>
        </div>

        {/* Gallery with 3D Cards - Responsive Masonry */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-1">
          {createGallery()}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload image file"
        />
      </main>

      <footer className="p-6 text-center text-white/80 sm:p-12">
        <p>© 2025 IMAGE-GROUND</p>
      </footer>
    </>
  );
};

export default Home;

export async function getServerSideProps() {
  const results = await cloudinary.v2.search
    .expression(`folder:${process.env.CLOUDINARY_FOLDER}/*`)
    .sort_by("public_id", "desc")
    .max_results(400)
    .execute();
  let reducedResults: ImageProps[] = [];

  let i = 0;
  for (let result of results.resources) {
    // Check if this image was uploaded by the app by looking for our tags
    // Ensure isUserUploaded is always a boolean, never undefined
    const isUserUploaded = Boolean(result.tags && result.tags.includes('user_uploaded'));

    reducedResults.push({
      id: i,
      height: result.height,
      width: result.width,
      public_id: result.public_id,
      format: result.format,
      created_at: result.created_at,
      isUserUploaded: isUserUploaded, // Always boolean, never undefined
    });
    i++;
  }

  const blurImagePromises = results.resources.map((image: ImageProps) => {
    return getBase64ImageUrl(image);
  });
  const imagesWithBlurDataUrls = await Promise.all(blurImagePromises);

  for (let i = 0; i < reducedResults.length; i++) {
    reducedResults[i].blurDataUrl = imagesWithBlurDataUrls[i];
  }

  return {
    props: {
      images: reducedResults,
    },
  };
}