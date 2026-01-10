import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Dialog,
  DialogContent,
  IconButton,
  useTheme,
  Paper,
} from '@mui/material';
import { Close, ZoomIn } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Import images as you add them
import formationImage1 from '../../assets/abgp-2/homepage/formation_1975.jpg';
import formationImage2 from '../../assets/abgp-2/homepage/formation_1975_2.jpg';
import historicalImage3 from '../../assets/abgp-2/homepage/historical_3.jpg';
import historicalImage4 from '../../assets/abgp-2/homepage/historical_4.jpg';
import historicalImage5 from '../../assets/abgp-2/homepage/historical_5.jpg';
import historicalImage6 from '../../assets/abgp-2/homepage/historical_6.jpg';
import historicalImage7 from '../../assets/abgp-2/homepage/historical_7.jpg';
import historicalImage8 from '../../assets/abgp-2/homepage/historical_8.jpg';
import historicalImage9 from '../../assets/abgp-2/homepage/historical_9.jpg';
import historicalImage10 from '../../assets/abgp-2/homepage/historical_10.jpg';
import historicalImage11 from '../../assets/abgp-2/homepage/historical_11.jpg';
import historicalImage12 from '../../assets/abgp-2/homepage/historical_12.jpg';
import historicalImage13 from '../../assets/abgp-2/homepage/historical_13.jpg';
import historicalImage14 from '../../assets/abgp-2/homepage/historical_14.jpg';
import historicalImage15 from '../../assets/abgp-2/homepage/historical_15.jpg';
import historicalImage16 from '../../assets/abgp-2/homepage/historical_16.jpg';
import historicalImage17 from '../../assets/abgp-2/homepage/historical_17.jpg';
import historicalImage18 from '../../assets/abgp-2/homepage/historical_18.jpg';
import historicalImage19 from '../../assets/abgp-2/homepage/historical_19.jpg';
import historicalImage20 from '../../assets/abgp-2/homepage/historical_20.jpg';
import historicalImage21 from '../../assets/abgp-2/homepage/historical_21.jpg';
import historicalImage22 from '../../assets/abgp-2/homepage/historical_22.jpg';
import historicalImage23 from '../../assets/abgp-2/homepage/historical_23.jpg';
// Add more imports here as you provide images

interface HistoricalImage {
  id: string;
  image: string;
  altKey: string;
  descriptionKey: string;
}

export const HistoricalGallerySection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [selectedImage, setSelectedImage] = useState<HistoricalImage | null>(null);

  // Add images to this array one by one as you provide them
  const historicalImages: HistoricalImage[] = [
    {
      id: 'formation-1',
      image: formationImage1,
      altKey: 'history.gallery.image1.alt',
      descriptionKey: 'history.gallery.image1.description',
    },
    {
      id: 'formation-2',
      image: formationImage2,
      altKey: 'history.gallery.image2.alt',
      descriptionKey: 'history.gallery.image2.description',
    },
    {
      id: 'historical-3',
      image: historicalImage3,
      altKey: 'history.gallery.image3.alt',
      descriptionKey: 'history.gallery.image3.description',
    },
    {
      id: 'historical-4',
      image: historicalImage4,
      altKey: 'history.gallery.image4.alt',
      descriptionKey: 'history.gallery.image4.description',
    },
    {
      id: 'historical-5',
      image: historicalImage5,
      altKey: 'history.gallery.image5.alt',
      descriptionKey: 'history.gallery.image5.description',
    },
    {
      id: 'historical-6',
      image: historicalImage6,
      altKey: 'history.gallery.image6.alt',
      descriptionKey: 'history.gallery.image6.description',
    },
    {
      id: 'historical-7',
      image: historicalImage7,
      altKey: 'history.gallery.image7.alt',
      descriptionKey: 'history.gallery.image7.description',
    },
    {
      id: 'historical-8',
      image: historicalImage8,
      altKey: 'history.gallery.image8.alt',
      descriptionKey: 'history.gallery.image8.description',
    },
    {
      id: 'historical-9',
      image: historicalImage9,
      altKey: 'history.gallery.image9.alt',
      descriptionKey: 'history.gallery.image9.description',
    },
    {
      id: 'historical-10',
      image: historicalImage10,
      altKey: 'history.gallery.image10.alt',
      descriptionKey: 'history.gallery.image10.description',
    },
    {
      id: 'historical-11',
      image: historicalImage11,
      altKey: 'history.gallery.image11.alt',
      descriptionKey: 'history.gallery.image11.description',
    },
    {
      id: 'historical-12',
      image: historicalImage12,
      altKey: 'history.gallery.image12.alt',
      descriptionKey: 'history.gallery.image12.description',
    },
    {
      id: 'historical-13',
      image: historicalImage13,
      altKey: 'history.gallery.image13.alt',
      descriptionKey: 'history.gallery.image13.description',
    },
    {
      id: 'historical-14',
      image: historicalImage14,
      altKey: 'history.gallery.image14.alt',
      descriptionKey: 'history.gallery.image14.description',
    },
    {
      id: 'historical-15',
      image: historicalImage15,
      altKey: 'history.gallery.image15.alt',
      descriptionKey: 'history.gallery.image15.description',
    },
    {
      id: 'historical-16',
      image: historicalImage16,
      altKey: 'history.gallery.image16.alt',
      descriptionKey: 'history.gallery.image16.description',
    },
    {
      id: 'historical-17',
      image: historicalImage17,
      altKey: 'history.gallery.image17.alt',
      descriptionKey: 'history.gallery.image17.description',
    },
    {
      id: 'historical-18',
      image: historicalImage18,
      altKey: 'history.gallery.image18.alt',
      descriptionKey: 'history.gallery.image18.description',
    },
    {
      id: 'historical-19',
      image: historicalImage19,
      altKey: 'history.gallery.image19.alt',
      descriptionKey: 'history.gallery.image19.description',
    },
    {
      id: 'historical-20',
      image: historicalImage20,
      altKey: 'history.gallery.image20.alt',
      descriptionKey: 'history.gallery.image20.description',
    },
    {
      id: 'historical-21',
      image: historicalImage21,
      altKey: 'history.gallery.image21.alt',
      descriptionKey: 'history.gallery.image21.description',
    },
    {
      id: 'historical-22',
      image: historicalImage22,
      altKey: 'history.gallery.image22.alt',
      descriptionKey: 'history.gallery.image22.description',
    },
    {
      id: 'historical-23',
      image: historicalImage23,
      altKey: 'history.gallery.image23.alt',
      descriptionKey: 'history.gallery.image23.description',
    },
    // Add more images here as you provide them
  ];

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
            {t('history.gallery.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('history.gallery.subtitle')}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {historicalImages.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
                onClick={() => setSelectedImage(item)}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.image}
                    alt={t(item.altKey)}
                    sx={{ objectFit: 'cover' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      borderRadius: '50%',
                      p: 0.5,
                    }}
                  >
                    <ZoomIn sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                </Box>
                <CardContent>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      fontStyle: 'italic',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {t(item.descriptionKey)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Lightbox Dialog */}
        <Dialog
          open={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogContent sx={{ p: 0, position: 'relative' }}>
            <IconButton
              onClick={() => setSelectedImage(null)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1,
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
              }}
            >
              <Close />
            </IconButton>
            {selectedImage && (
              <>
                <Box
                  component="img"
                  src={selectedImage.image}
                  alt={t(selectedImage.altKey)}
                  sx={{ width: '100%', height: 'auto', display: 'block' }}
                />
                <Paper sx={{ p: 3 }}>
                  <Typography variant="body1" sx={{ fontStyle: 'italic', lineHeight: 1.8 }}>
                    {t(selectedImage.descriptionKey)}
                  </Typography>
                </Paper>
              </>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};
