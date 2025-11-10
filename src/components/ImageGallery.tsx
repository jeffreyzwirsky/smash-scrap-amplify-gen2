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
        
