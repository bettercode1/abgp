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
import type { Theme } from '@mui/material/styles';
import {
  Timeline as TimelineIcon,
  Groups,
  Event,
  Store,
  Handshake,
  AccountBalance,
  Public,
  Assessment,
} from '@mui/icons-material';

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
    description: 'Social and political restlessness inspires Pune youth under late Shri Bindu Madhav Joshi.',
    icon: <TimelineIcon />,
    trackerId: 'milestone-1',
    displayName: 'Restless India, Awakened Pune',
    listingId: '1970s',
  },
  {
    year: '1974',
    title: 'Youth to Consumer Power',
    description: 'Yuvak Mahamandal Janata Grahak Sangh formed with personalities like Sudhir Phadke, PL Deshpande, Prof. Dandekar, and GV Behere.',
    icon: <Groups />,
    trackerId: 'milestone-2',
    displayName: 'Youth to Consumer Power',
    listingId: '1974-1',
  },
  {
    year: 'Diwali 1974',
    title: 'First Grahak Experiment',
    description: 'Successful attempt to supply festive commodities through created Grahak Sanghs in Pune.',
    icon: <Event />,
    trackerId: 'milestone-3',
    displayName: 'First Grahak Experiment',
    listingId: 'diwali-1974',
  },
  {
    year: '1974',
    title: 'Historic Textile Boycott',
    description: 'Laxmi Road boycott; movement volunteers procured textiles directly from producers to sell at cheaper rates.',
    icon: <Store />,
    trackerId: 'milestone-4',
    displayName: 'Historic Textile Boycott',
    listingId: '1974-2',
  },
  {
    year: '1974',
    title: 'National Blessing',
    description: 'Jaiprakash Narayan blesses the movement during his visit to Pune.',
    icon: <Handshake />,
    trackerId: 'milestone-5',
    displayName: 'Nationwide Blessing',
    listingId: '1974-3',
  },
  {
    year: '23 Dec 1975',
    title: 'ABGP Formal Inauguration',
    description: 'Justice MC Chagla inaugurates ABGP: "What Pune thinks today, India will think subsequently."',
    icon: <AccountBalance />,
    trackerId: 'milestone-6',
    displayName: 'ABGP is Born',
    listingId: '1975-12-23',
  },
  {
    year: '1980s-2010s',
    title: 'From Pune to Bharat',
    description: 'Hard work under leadership of Nana and subsequent leaders takes movement to 25+ states.',
    icon: <Public />,
    trackerId: 'milestone-7',
    displayName: 'From Pune to Bharat',
    listingId: '1980s-2010s',
  },
  {
    year: '2017',
    title: 'National Expansion',
    description: 'ABGP reaches more than 25 states and nearly 510 districts across the country.',
    icon: <Assessment />,
    trackerId: 'milestone-8',
    displayName: '25+ States, 200+ Districts',
    listingId: '2017',
  },
];

const iconCircleSx = (theme: Theme) => ({
  background: `linear-gradient(145deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  border: `3px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[6],
});

export const ABGPJourneyTimeline: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        py: { xs: 5, md: 10 },
        background: isDark
          ? 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)'
          : 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
        minHeight: '100vh',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 8 } }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.02em',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1.5,
              fontSize: { xs: '1.75rem', md: '2.5rem' },
            }}
          >
            ABGP Journey Timeline
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500, maxWidth: 480, mx: 'auto' }}>
            Five Decades of Consumer Empowerment
          </Typography>
          <Box
            sx={{
              width: 64,
              height: 4,
              borderRadius: 2,
              mx: 'auto',
              mt: 2,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          />
        </Box>

        {isMobile ? (
          // Vertical Timeline for Mobile
          <Box sx={{ position: 'relative', pl: 4 }}>
            {milestones.map((milestone, index) => (
              <Box key={index} sx={{ position: 'relative', mb: 5 }}>
                {/* Timeline Dot */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: -28,
                    top: 0,
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    ...iconCircleSx(theme),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                  }}
                >
                  <Box sx={{ color: 'white', display: 'flex', '& .MuiSvgIcon-root': { fontSize: 22 } }}>
                    {milestone.icon}
                  </Box>
                </Box>

                {/* Timeline Line */}
                {index < milestones.length - 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: -7,
                      top: 44,
                      width: 3,
                      height: 'calc(100% + 20px)',
                      borderRadius: 2,
                      background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      opacity: 0.4,
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
                    elevation={0}
                    sx={{
                      background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(12px)',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                      borderRadius: 3,
                      overflow: 'hidden',
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8],
                      },
                    }}
                  >
                    <Box
                      sx={{
                        height: 4,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      }}
                    />
                    <CardContent sx={{ pt: 2, pb: 3, px: 2.5 }}>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          mb: 1.5,
                          borderRadius: 1.5,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                        }}
                      >
                        {milestone.year}
                      </Box>
                      <Typography variant="h6" fontWeight={700} gutterBottom sx={{ lineHeight: 1.3 }}>
                        {milestone.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
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
          <Box sx={{ position: 'relative', py: 6 }}>
            {/* Timeline Connector Line */}
            <Box
              sx={{
                position: 'absolute',
                top: 88,
                left: '5%',
                right: '5%',
                height: 5,
                borderRadius: 3,
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                opacity: 0.25,
                zIndex: 0,
              }}
            />

            {/* Timeline Cards */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 1.5,
                position: 'relative',
                zIndex: 1,
              }}
            >
              {milestones.map((milestone, index) => (
                <Box
                  key={index}
                  sx={{
                    flex: '1 1 0',
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  {/* Icon Circle + Year */}
                  <Box
                    sx={{
                      width: 88,
                      height: 88,
                      borderRadius: '50%',
                      ...iconCircleSx(theme),
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      zIndex: 2,
                    }}
                  >
                    <Box sx={{ color: 'white', display: 'flex', '& .MuiSvgIcon-root': { fontSize: 28 } }}>
                      {milestone.icon}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        textAlign: 'center',
                        lineHeight: 1.2,
                        mt: 0.25,
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
                      elevation={0}
                      sx={{
                        width: '100%',
                        maxWidth: 260,
                        minHeight: 160,
                        background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(12px)',
                        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                        borderRadius: 3,
                        overflow: 'hidden',
                        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-6px)',
                          boxShadow: theme.shadows[8],
                        },
                      }}
                    >
                      <Box
                        sx={{
                          height: 3,
                          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        }}
                      />
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ lineHeight: 1.3, fontSize: '0.95rem' }}>
                          {milestone.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.8125rem' }}>
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



