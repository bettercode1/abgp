import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  History,
  People,
  Celebration,
  ShoppingCart,
  ThumbUp,
  Gavel,
  Public,
  TrendingUp,
} from '@mui/icons-material';

// Utility function to check if element is in viewport
function isElementInViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  return (
    rect.top < 88 &&
    rect.left >= 0 &&
    rect.bottom > 0 &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Impression Click Tracker HOC
interface ImpressionClickTrackerHOCProps {
  children: React.ReactNode;
  clickEvent: string;
  disableViewportTracking?: boolean;
  trackerId?: string;
  displayName?: string;
  listingId?: string;
}

const ImpressionClickTrackerHOC: React.FC<ImpressionClickTrackerHOCProps> = ({
  children,
  clickEvent,
  disableViewportTracking = false,
  trackerId,
  displayName,
  listingId,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [hasTracked, setHasTracked] = useState(false);

  useEffect(() => {
    if (disableViewportTracking || hasTracked || !elementRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTracked) {
          // Track impression
          console.log('Impression tracked:', {
            clickEvent,
            trackerId,
            displayName,
            listingId,
          });
          setHasTracked(true);
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 1.0,
      }
    );

    observer.observe(elementRef.current);

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [clickEvent, disableViewportTracking, hasTracked, trackerId, displayName, listingId]);

  const handleClick = () => {
    console.log('Click tracked:', {
      clickEvent,
      trackerId,
      displayName,
      listingId,
    });
  };

  return (
    <div
      ref={elementRef}
      onClick={handleClick}
      data-tracker-id={trackerId}
      data-display-name={displayName}
      data-listing-id={listingId}
    >
      {children}
    </div>
  );
};

// Timeline Milestone Data
interface Milestone {
  year: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  trackerId: string;
  displayName: string;
  listingId: string;
}

const milestones: Milestone[] = [
  {
    year: '1970s',
    title: 'Restless India, Awakened Pune',
    description: 'Social unrest inspires Pune youth under Bindu Madhav Joshi',
    icon: <History />,
    trackerId: 'milestone-1',
    displayName: 'Restless India, Awakened Pune',
    listingId: '1970s',
  },
  {
    year: '1974',
    title: 'Youth to Consumer Power',
    description: 'Yuvak Mahamandal Janata Grahak Sangh formed with Sudhir Phadke, PL Deshpande',
    icon: <People />,
    trackerId: 'milestone-2',
    displayName: 'Youth to Consumer Power',
    listingId: '1974-1',
  },
  {
    year: 'Diwali 1974',
    title: 'First Grahak Experiment',
    description: 'Festival commodities supplied through Grahak Sanghs',
    icon: <Celebration />,
    trackerId: 'milestone-3',
    displayName: 'First Grahak Experiment',
    listingId: 'diwali-1974',
  },
  {
    year: '1974',
    title: 'Historic Textile Boycott',
    description: 'Laxmi Road boycott, direct producer-to-consumer sales',
    icon: <ShoppingCart />,
    trackerId: 'milestone-4',
    displayName: 'Historic Textile Boycott',
    listingId: '1974-2',
  },
  {
    year: '1974',
    title: 'Nationwide Blessing',
    description: 'Jayaprakash Narayan blesses Pune initiative',
    icon: <ThumbUp />,
    trackerId: 'milestone-5',
    displayName: 'Nationwide Blessing',
    listingId: '1974-3',
  },
  {
    year: '23 Dec 1975',
    title: 'ABGP is Born',
    description: 'Justice MC Chagla inaugurates: "What Pune thinks today..."',
    icon: <Gavel />,
    trackerId: 'milestone-6',
    displayName: 'ABGP is Born',
    listingId: '1975-12-23',
  },
  {
    year: '1980s-2010s',
    title: 'From Pune to Bharat',
    description: 'Nationwide expansion under Nana\'s leadership',
    icon: <Public />,
    trackerId: 'milestone-7',
    displayName: 'From Pune to Bharat',
    listingId: '1980s-2010s',
  },
  {
    year: '2017',
    title: '25+ States, 200+ Districts',
    description: 'Massive national presence achieved',
    icon: <TrendingUp />,
    trackerId: 'milestone-8',
    displayName: '25+ States, 200+ Districts',
    listingId: '2017',
  },
];

export const ABGPJourneyTimeline: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        py: { xs: 4, md: 8 },
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
          : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            ABGP Journey Timeline
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Five Decades of Consumer Empowerment
          </Typography>
        </Box>

        {isMobile ? (
          // Vertical Timeline for Mobile
          <Box sx={{ position: 'relative', pl: 3 }}>
            {milestones.map((milestone, index) => (
              <Box key={index} sx={{ position: 'relative', mb: 4 }}>
                {/* Timeline Dot */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: -15,
                    top: 0,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    border: `3px solid ${theme.palette.background.paper}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    boxShadow: `0 4px 12px rgba(${theme.palette.primary.main === '#FF6B35' ? '255, 107, 53' : '0, 0, 0'}, 0.3)`,
                  }}
                >
                  <Box sx={{ color: 'white', fontSize: 12 }}>
                    {milestone.icon}
                  </Box>
                </Box>

                {/* Timeline Line */}
                {index < milestones.length - 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: -3,
                      top: 24,
                      width: 2,
                      height: 'calc(100% + 16px)',
                      background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      zIndex: 1,
                    }}
                  />
                )}

                {/* Card */}
                <ImpressionClickTrackerHOC
                  clickEvent="JOURNEY_MILESTONE_CLICK"
                  trackerId={milestone.trackerId}
                  displayName={milestone.displayName}
                  listingId={milestone.listingId}
                >
                  <Card
                    sx={{
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 24px rgba(${theme.palette.primary.main === '#FF6B35' ? '255, 107, 53' : '0, 0, 0'}, 0.2)`,
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 2,
                          py: 0.5,
                          mb: 2,
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                        }}
                      >
                        {milestone.year}
                      </Box>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {milestone.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {milestone.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </ImpressionClickTrackerHOC>
              </Box>
            ))}
          </Box>
        ) : (
          // Horizontal Timeline for Desktop
          <Box sx={{ position: 'relative', py: 4 }}>
            {/* Timeline Connector Line */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                borderRadius: 2,
                zIndex: 0,
              }}
            />

            {/* Timeline Cards */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 2,
                position: 'relative',
                zIndex: 1,
              }}
            >
              {milestones.map((milestone, index) => (
                <Box
                  key={index}
                  sx={{
                    flex: '1 1 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  {/* Year Badge */}
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      boxShadow: `0 4px 16px rgba(${theme.palette.primary.main === '#FF6B35' ? '255, 107, 53' : '0, 0, 0'}, 0.3)`,
                      border: `4px solid ${theme.palette.background.paper}`,
                      zIndex: 2,
                    }}
                  >
                    <Box sx={{ color: 'white', mb: 0.5 }}>
                      {milestone.icon}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        textAlign: 'center',
                      }}
                    >
                      {milestone.year}
                    </Typography>
                  </Box>

                  {/* Card */}
                  <ImpressionClickTrackerHOC
                    clickEvent="JOURNEY_MILESTONE_CLICK"
                    trackerId={milestone.trackerId}
                    displayName={milestone.displayName}
                    listingId={milestone.listingId}
                  >
                    <Card
                      sx={{
                        width: '100%',
                        maxWidth: 280,
                        background: theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: `0 12px 32px rgba(${theme.palette.primary.main === '#FF6B35' ? '255, 107, 53' : '0, 0, 0'}, 0.25)`,
                        },
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                          {milestone.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                          {milestone.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </ImpressionClickTrackerHOC>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ABGPJourneyTimeline;



