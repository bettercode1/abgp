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
  Pagination,
  CircularProgress,
  Paper,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { Close, ZoomIn, NavigateBefore, NavigateNext } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

// Dynamic import of all images using Vite's import.meta.glob
const imageModules = import.meta.glob('../assets/images/*.jpeg', { eager: true });

interface GalleryImage {
  id: string;
  src: string;
  filename: string;
  number: number;
}

export const GalleryPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

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

  // Use all images (no filtering)
  const filteredImages = allImages;

  // Pagination settings - Always 2 pages (divide images equally)
  const totalPages = 2;
  const imagesPerPage = Math.ceil(filteredImages.length / totalPages);
  
  // Get images for current page
  const currentImages = useMemo(() => {
    const startIndex = (currentPage - 1) * imagesPerPage;
    const endIndex = startIndex + imagesPerPage;
    return filteredImages.slice(startIndex, endIndex);
  }, [filteredImages, currentPage, imagesPerPage]);


  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const handleCloseLightbox = () => {
    setSelectedImage(null);
  };

  const handlePreviousImage = () => {
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex((img) => img.id === selectedImage.id);
    if (currentIndex > 0) {
      setSelectedImage(filteredImages[currentIndex - 1]);
    }
  };

  const handleNextImage = () => {
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex((img) => img.id === selectedImage.id);
    if (currentIndex < filteredImages.length - 1) {
      setSelectedImage(filteredImages[currentIndex + 1]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage]);

  const currentIndex = selectedImage 
    ? filteredImages.findIndex((img) => img.id === selectedImage.id) + 1 
    : 0;

  return (
    <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            {t('nav.home')}
          </Link>
          <Typography color="text.primary">{t('gallery.title')}</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{ 
              fontWeight: 700, 
              color: theme.palette.primary.main, 
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            {t('gallery.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {t('gallery.subtitle')}
          </Typography>
        </Box>

        {/* Gallery Grid */}
        {allImages.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {t('gallery.loading')}
            </Typography>
          </Paper>
        ) : currentImages.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              {t('gallery.noImagesFound')}
            </Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {currentImages.map((image) => (
                <Grid item xs={6} sm={4} md={3} key={image.id}>
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

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontSize: { xs: '0.875rem', md: '1rem' },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}

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
            {currentIndex < filteredImages.length && (
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
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {currentIndex} / {filteredImages.length}
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
                  alt={`${t('gallery.image')} ${selectedImage.number}`}
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
