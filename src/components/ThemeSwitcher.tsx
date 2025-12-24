import React from 'react';
import { IconButton, Menu, MenuItem, Tooltip, Box } from '@mui/material';
import { Palette, Check } from '@mui/icons-material';
import { ThemeName } from '../theme/themes';

interface ThemeSwitcherProps {
  currentTheme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
}

const themeNames: { key: ThemeName; label: string }[] = [
  { key: 'tricolor', label: 'Tricolor' },
  { key: 'minimal', label: 'Minimal' },
  { key: 'maroonGold', label: 'Maroon-Gold' },
];

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  currentTheme,
  onThemeChange,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (theme?: ThemeName) => {
    if (theme) {
      onThemeChange(theme);
      localStorage.setItem('abgp-theme', theme);
    }
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="Change theme">
        <IconButton
          onClick={handleClick}
          aria-label="theme switcher"
          aria-controls={open ? 'theme-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          size="small"
        >
          <Palette />
        </IconButton>
      </Tooltip>
      <Menu
        id="theme-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => handleClose()}
        MenuListProps={{
          'aria-labelledby': 'theme-button',
        }}
      >
        {themeNames.map((theme) => (
          <MenuItem
            key={theme.key}
            onClick={() => handleClose(theme.key)}
            selected={currentTheme === theme.key}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              {currentTheme === theme.key && <Check fontSize="small" />}
              <span>{theme.label}</span>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};







