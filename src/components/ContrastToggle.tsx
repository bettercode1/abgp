import React from 'react';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { LightMode, DarkMode, Contrast } from '@mui/icons-material';

type ContrastMode = 'light' | 'dark' | 'high';

interface ContrastToggleProps {
  mode: ContrastMode;
  onModeChange: (mode: ContrastMode) => void;
}

export const ContrastToggle: React.FC<ContrastToggleProps> = ({
  mode,
  onModeChange,
}) => {
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: ContrastMode | null,
  ) => {
    if (newMode !== null) {
      onModeChange(newMode);
      localStorage.setItem('abgp-contrast', newMode);
    }
  };

  return (
    <ToggleButtonGroup
      value={mode}
      exclusive
      onChange={handleChange}
      aria-label="contrast mode"
      size="small"
    >
      <Tooltip title="Light mode">
        <ToggleButton value="light" aria-label="light mode">
          <LightMode fontSize="small" />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Dark mode">
        <ToggleButton value="dark" aria-label="dark mode">
          <DarkMode fontSize="small" />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="High contrast">
        <ToggleButton value="high" aria-label="high contrast mode">
          <Contrast fontSize="small" />
        </ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  );
};







