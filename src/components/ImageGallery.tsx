interface ImageGalleryProps {
  images: string[]; // S3 keys
  onClose: () => void;
}

export function ImageGallery({ images, onClose }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    async function loadImages() {
      const urls = await Promise.all(
        images.map(key => getUrl({ key, options: { level: 'private' }}))
      );
      setImageUrls(urls.map(result => result.url.toString()));
    }
    loadImages();
  }, [images]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      {/* Previous/Next buttons, image display, close button */}
      <img src={imageUrls[currentIndex]} alt="Part" className="max-h-screen" />
    </div>
  );
}
