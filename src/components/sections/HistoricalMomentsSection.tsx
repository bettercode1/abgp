import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

// Historical Images
import formation1975 from '../../assets/abgp-2/homepage/formation_1975.jpg';
import formation1975_2 from '../../assets/abgp-2/homepage/formation_1975_2.jpg';
import historical3 from '../../assets/abgp-2/homepage/historical_3.jpg';
import historical4 from '../../assets/abgp-2/homepage/historical_4.jpg';
import historical5 from '../../assets/abgp-2/homepage/historical_5.jpg';
import historical6 from '../../assets/abgp-2/homepage/historical_6.jpg';
import historical7 from '../../assets/abgp-2/homepage/historical_7.jpg';
import historical8 from '../../assets/abgp-2/homepage/historical_8.jpg';
import historical9 from '../../assets/abgp-2/homepage/historical_9.jpg';
import historical10 from '../../assets/abgp-2/homepage/historical_10.jpg';
import historical11 from '../../assets/abgp-2/homepage/historical_11.jpg';
import historical12 from '../../assets/abgp-2/homepage/historical_12.jpg';
import historical13 from '../../assets/abgp-2/homepage/historical_13.jpg';
import historical14 from '../../assets/abgp-2/homepage/historical_14.jpg';
import historical15 from '../../assets/abgp-2/homepage/historical_15.jpg';
import historical16 from '../../assets/abgp-2/homepage/historical_16.jpg';
import historical17 from '../../assets/abgp-2/homepage/historical_17.jpg';
import historical18 from '../../assets/abgp-2/homepage/historical_18.jpg';
import historical19 from '../../assets/abgp-2/homepage/historical_19.jpg';
import historical20 from '../../assets/abgp-2/homepage/historical_20.jpg';
import historical21 from '../../assets/abgp-2/homepage/historical_21.jpg';
import historical22 from '../../assets/abgp-2/homepage/historical_22.jpg';
import historical23 from '../../assets/abgp-2/homepage/historical_23.jpg';

interface Moment {
  year: string;
  titleKey: string;
  descKey: string;
  image: string;
}

const moments: Moment[] = [
  {
    year: '1974',
    titleKey: 'history.gallery.image10.alt',
    descKey: 'history.gallery.image10.description',
    image: historical10,
  },
  {
    year: '1975',
    titleKey: 'history.gallery.image1.alt',
    descKey: 'history.gallery.image1.description',
    image: formation1975,
  },
  {
    year: '1975',
    titleKey: 'history.gallery.image2.alt',
    descKey: 'history.gallery.image2.description',
    image: formation1975_2,
  },
  {
    year: '1975',
    titleKey: 'history.gallery.image6.alt',
    descKey: 'history.gallery.image6.description',
    image: historical6,
  },
  {
    year: '1975',
    titleKey: 'history.gallery.image7.alt',
    descKey: 'history.gallery.image7.description',
    image: historical7,
  },
  {
    year: '1975',
    titleKey: 'history.gallery.image8.alt',
    descKey: 'history.gallery.image8.description',
    image: historical8,
  },
  {
    year: '1975',
    titleKey: 'history.gallery.image21.alt',
    descKey: 'history.gallery.image21.description',
    image: historical21,
  },
  {
    year: '1976',
    titleKey: 'history.gallery.image5.alt',
    descKey: 'history.gallery.image5.description',
    image: historical5,
  },
  {
    year: '1976',
    titleKey: 'history.gallery.image9.alt',
    descKey: 'history.gallery.image9.description',
    image: historical9,
  },
  {
    year: '1977',
    titleKey: 'history.gallery.image4.alt',
    descKey: 'history.gallery.image4.description',
    image: historical4,
  },
  {
    year: '1977',
    titleKey: 'history.gallery.image12.alt',
    descKey: 'history.gallery.image12.description',
    image: historical12,
  },
  {
    year: '1978',
    titleKey: 'history.gallery.image3.alt',
    descKey: 'history.gallery.image3.description',
    image: historical3,
  },
  {
    year: '1978',
    titleKey: 'history.gallery.image11.alt',
    descKey: 'history.gallery.image11.description',
    image: historical11,
  },
  {
    year: '1990',
    titleKey: 'history.gallery.image22.alt',
    descKey: 'history.gallery.image22.description',
    image: historical22,
  },
  {
    year: '1990',
    titleKey: 'history.gallery.image23.alt',
    descKey: 'history.gallery.image23.description',
    image: historical23,
  },
  {
    year: '1994',
    titleKey: 'history.gallery.image13.alt',
    descKey: 'history.gallery.image13.description',
    image: historical13,
  },
  {
    year: '1994',
    titleKey: 'history.gallery.image14.alt',
    descKey: 'history.gallery.image14.description',
    image: historical14,
  },
  {
    year: '1994',
    titleKey: 'history.gallery.image15.alt',
    descKey: 'history.gallery.image15.description',
    image: historical15,
  },
  {
    year: '1994',
    titleKey: 'history.gallery.image16.alt',
    descKey: 'history.gallery.image16.description',
    image: historical16,
  },
  {
    year: '2003',
    titleKey: 'history.gallery.image17.alt',
    descKey: 'history.gallery.image17.description',
    image: historical17,
  },
  {
    year: '2003',
    titleKey: 'history.gallery.image18.alt',
    descKey: 'history.gallery.image18.description',
    image: historical18,
  },
  {
    year: '2003',
    titleKey: 'history.gallery.image19.alt',
    descKey: 'history.gallery.image19.description',
    image: historical19,
  },
  {
    year: '2003',
    titleKey: 'history.gallery.image20.alt',
    descKey: 'history.gallery.image20.description',
    image: historical20,
  },
];

const ParallaxYear: React.FC<{ year: string }> = ({ year }) => {
  const theme = useTheme();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [-100, 100]);

  return (
    <Box ref={ref} sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: -1, pointerEvents: 'none' }}>
      <motion.div style={{ y }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '6rem', md: '12rem' },
            fontWeight: 950,
            color: theme.palette.primary.main,
            opacity: 0.05,
            lineHeight: 0.8,
            textAlign: 'center',
            letterSpacing: '-0.05em',
            userSelect: 'none'
          }}
        >
          {year}
        </Typography>
      </motion.div>
    </Box>
  );
};

export const HistoricalMomentsSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeYear, setActiveYear] = useState(moments[0].year);
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const years = Array.from(new Set(moments.map(m => m.year))).sort();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 400;
      const elements = moments.map((_, i) => document.getElementById(`moment-${i}`));
      
      for (let i = elements.length - 1; i >= 0; i--) {
        const el = elements[i];
        if (el && el.offsetTop <= scrollPosition) {
          setActiveYear(moments[i].year);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToYear = (year: string) => {
    const index = moments.findIndex(m => m.year === year);
    const element = document.getElementById(`moment-${index}`);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 180,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Box ref={containerRef} sx={{ backgroundColor: 'white', py: 8, position: 'relative', overflow: 'hidden' }}>
      {/* Dynamic Progress Bar */}
      <motion.div
        style={{
          scaleX,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          backgroundColor: theme.palette.primary.main,
          transformOrigin: '0%',
          zIndex: 2000,
        }}
      />

      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ mb: 10, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Typography variant="h2" fontWeight={900} color="primary" gutterBottom sx={{ letterSpacing: '-0.02em' }}>
              {t('about.moments.title')}
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 700, mx: 'auto' }}>
              {t('about.moments.subtitle', "A collection of memorable moments from ABGP's journey")}
            </Typography>
          </motion.div>
        </Box>

        {/* Year Navigation Bar (Sticky) */}
        <Box
          sx={{
            position: 'sticky',
            top: { xs: 56, md: 64 },
            zIndex: 100,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            py: 2,
            mb: 8,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: 1, md: 2 },
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {years.map(year => (
            <motion.button
              key={year}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToYear(year)}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px 24px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 800,
                fontSize: activeYear === year ? '1.2rem' : '1rem',
                color: activeYear === year ? theme.palette.primary.main : theme.palette.text.secondary,
                position: 'relative',
                transition: 'color 0.3s ease',
              }}
            >
              {year}
              {activeYear === year && (
                <motion.div
                  layoutId="activeYear"
                  style={{
                    position: 'absolute',
                    bottom: -16,
                    left: 0,
                    right: 0,
                    height: 4,
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: '4px 4px 0 0'
                  }}
                />
              )}
            </motion.button>
          ))}
        </Box>

        {/* Timeline Content */}
        <Box sx={{ position: 'relative' }}>
          {/* Vertical Dynamic Line */}
          {!isMobile && (
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                width: 2,
                backgroundColor: theme.palette.divider,
                transform: 'translateX(-50%)',
              }}
            >
              <motion.div
                style={{
                  scaleY: scrollYProgress,
                  height: '100%',
                  width: '100%',
                  backgroundColor: theme.palette.primary.main,
                  transformOrigin: 'top',
                }}
              />
            </Box>
          )}

          {moments.map((moment, index) => (
            <Box
              key={index}
              id={`moment-${index}`}
              sx={{
                mb: { xs: 12, md: 25 },
                position: 'relative',
              }}
            >
              {/* Parallax Background Year */}
              <ParallaxYear year={moment.year} />

              <Grid container spacing={8} alignItems="center" direction={index % 2 === 0 ? 'row' : 'row-reverse'}>
                {/* Image Side */}
                <Grid item xs={12} md={6}>
                  <motion.div
                    initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100, rotate: index % 2 === 0 ? -2 : 2 }}
                    whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        borderRadius: 6,
                        overflow: 'hidden',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.4) 100%)',
                        }
                      }}
                    >
                      <motion.img
                        src={moment.image}
                        alt={t(moment.titleKey)}
                        style={{
                          width: '100%',
                          height: isMobile ? 300 : 500,
                          objectFit: 'cover',
                          display: 'block',
                        }}
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.6 }}
                      />
                    </Box>
                  </motion.div>
                </Grid>

                {/* Content Side */}
                <Grid item xs={12} md={6}>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <Box sx={{ 
                      px: { md: 6 }, 
                      textAlign: { xs: 'center', md: index % 2 === 0 ? 'left' : 'right' },
                      position: 'relative'
                    }}>
                      <Typography 
                        variant="h3" 
                        fontWeight={900} 
                        gutterBottom 
                        sx={{ 
                          color: theme.palette.text.primary,
                          fontSize: { xs: '1.75rem', md: '2.5rem' },
                          lineHeight: 1.2,
                          mb: 3
                        }}
                      >
                        {t(moment.titleKey)}
                      </Typography>
                      
                      <Box sx={{ 
                        width: 60, 
                        height: 4, 
                        backgroundColor: theme.palette.primary.main, 
                        mb: 4,
                        mx: { xs: 'auto', md: index % 2 === 0 ? 0 : 'auto' },
                        display: { md: index % 2 === 0 ? 'block' : 'none' } // Simple logic for right-align later
                      }} />

                      <Typography 
                        variant="body1" 
                        color="text.secondary" 
                        sx={{ 
                          fontSize: '1.15rem', 
                          lineHeight: 1.8,
                          fontWeight: 400,
                          opacity: 0.8
                        }}
                      >
                        {t(moment.descKey)}
                      </Typography>
                    </Box>
                  </motion.div>
                </Grid>
              </Grid>

              {/* Timeline Dot with Pulse Effect */}
              {!isMobile && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 2,
                  }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: theme.palette.primary.main,
                      border: '6px solid white',
                      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
                    }}
                  />
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: theme.palette.primary.main,
                      zIndex: -1,
                    }}
                  />
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Container>

      {/* Floating Decorative Elements */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: -1 }}>
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              position: 'absolute',
              top: `${20 * i}%`,
              left: `${15 * i}%`,
              width: 100 + i * 50,
              height: 100 + i * 50,
              borderRadius: '50%',
              backgroundColor: theme.palette.primary.light,
              filter: 'blur(80px)',
            }}
          />
        ))}
      </Box>
    </Box>
  );
};
