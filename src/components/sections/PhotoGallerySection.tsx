import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  Dialog,
  DialogContent,
  IconButton,
  useTheme,
  Button,
  Paper,
} from '@mui/material';
import { Close, ZoomIn, NavigateBefore, NavigateNext } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// Dynamic import of all images using Vite's import.meta.glob
const imageModules = import.meta.glob('../../assets/images/*.jpeg', { eager: true });

interface GalleryImage {
  id: string;
  src: string;
  filename: string;
  number: number;
}

export const PhotoGallerySection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  // Convert imported images to array and sort by number
  const allImages: GalleryImage[] = useMemo(() => {
    return Object.entries(imageModules)
      .map(([path, module]) => {
        const filename = path.split('/').pop() || '';
        const numberMatch = filename.match(/(\d+)\.jpeg$/);
        const number = numberMatch ? parseInt(numberMatch[1], 10) : 0;
        return {
          id: filename,
          src: (module as { default: string }).default,
          filename,
          number,
        };
      })
      .sort((a, b) => a.number - b.number);
  }, []);

  // Show first 12 images on homepage
  const displayedImages = allImages.slice(0, 12);

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const handleCloseLightbox = () => {
    setSelectedImage(null);
  };

  const handlePreviousImage = () => {
    if (!selectedImage) return;
    const currentIndex = allImages.findIndex((img) => img.id === selectedImage.id);
    if (currentIndex > 0) {
      setSelectedImage(allImages[currentIndex - 1]);
    }
  };

  const handleNextImage = () => {
    if (!selectedImage) return;
    const currentIndex = allImages.findIndex((img) => img.id === selectedImage.id);
    if (currentIndex < allImages.length - 1) {
      setSelectedImage(allImages[currentIndex + 1]);
    }
  };

  // Keyboard navigation in lightbox
  React.useEffect(() => {
    if (!selectedImage) return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePreviousImage();
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === 'Escape') handleCloseLightbox();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage]);

  const currentIndex = selectedImage 
    ? allImages.findIndex((img) => img.id === selectedImage.id) + 1 
    : 0;

  return (
    <Box
      sx={{
        py: { xs: 4, md: 6 },
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 2 }}
          >
            {t('gallery.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t('gallery.subtitle')}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {displayedImages.map((image) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={image.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: theme.shadows[12],
                    '& .gallery-overlay': {
                      opacity: 1,
                    },
                  },
                }}
                onClick={() => handleImageClick(image)}
              >
                <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                  <CardMedia
                    component="img"
                    image={image.src}
                    alt={`${t('gallery.image')} ${image.number}`}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                    }}
                    loading="lazy"
                  />
                  {/* Overlay on hover */}
                  <Box
                    className="gallery-overlay"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    }}
                  >
                    <ZoomIn sx={{ color: 'white', fontSize: 48 }} />
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* View All Button */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/gallery')}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
            }}
          >
            {t('gallery.viewAll') || 'View All Images'}
          </Button>
        </Box>

        {/* Lightbox Dialog */}
        <Dialog
          open={!!selectedImage}
          onClose={handleCloseLightbox}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'rgba(0,0,0,0.9)',
              maxHeight: '95vh',
            },
          }}
        >
          <DialogContent sx={{ p: 0, position: 'relative', minHeight: '60vh' }}>
            {/* Close Button */}
            <IconButton
              onClick={handleCloseLightbox}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 2,
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.9)' },
              }}
              size="large"
            >
              <Close />
            </IconButton>

            {/* Previous Button */}
            {currentIndex > 1 && (
              <IconButton
                onClick={handlePreviousImage}
                sx={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.9)' },
                }}
                size="large"
              >
                <NavigateBefore />
              </IconButton>
            )}

            {/* Next Button */}
            {currentIndex < allImages.length && (
              <IconButton
                onClick={handleNextImage}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.9)' },
                }}
                size="large"
              >
                <NavigateNext />
              </IconButton>
            )}

            {/* Image Counter */}
            {selectedImage && (
              <Paper
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  zIndex: 2,
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  px: 2,
                  py: 1,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>
                  {currentIndex} / {allImages.length}
                </Typography>
              </Paper>
            )}

            {/* Full-size Image */}
            {selectedImage && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '60vh',
                  p: 2,
                }}
              >
                <Box
                  component="img"
                  src={selectedImage.src}
                  alt={selectedImage.filename}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '85vh',
                    height: 'auto',
                    objectFit: 'contain',
                    borderRadius: 1,
                  }}
                />
              </Box>
            )}

            {/* Image Info */}
            {selectedImage && (
              <Paper
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  p: 2,
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  borderRadius: 0,
                }}
              >
                <Typography variant="body1" sx={{ color: 'white', textAlign: 'center', fontWeight: 500 }}>
                  {selectedImage.filename}
                </Typography>
              </Paper>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};
