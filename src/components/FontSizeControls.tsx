import React from 'react';
import { ButtonGroup, Button, Tooltip } from '@mui/material';
import { TextDecrease, TextFields, TextIncrease } from '@mui/icons-material';

type FontSize = 'small' | 'medium' | 'large';

interface FontSizeControlsProps {
  fontSize: FontSize;
  onFontSizeChange: (size: FontSize) => void;
}

export const FontSizeControls: React.FC<FontSizeControlsProps> = ({
  fontSize,
  onFontSizeChange,
}) => {
  return (
    <ButtonGroup
      size="small"
      variant="outlined"
      aria-label="font size controls"
    >
      <Tooltip title="Decrease font size">
        <Button
          onClick={() => onFontSizeChange('small')}
          variant={fontSize === 'small' ? 'contained' : 'outlined'}
          aria-label="Small font size"
          aria-pressed={fontSize === 'small'}
        >
          <TextDecrease fontSize="small" />
        </Button>
      </Tooltip>
      <Tooltip title="Medium font size">
        <Button
          onClick={() => onFontSizeChange('medium')}
          variant={fontSize === 'medium' ? 'contained' : 'outlined'}
          aria-label="Medium font size"
          aria-pressed={fontSize === 'medium'}
        >
          <TextFields fontSize="small" />
        </Button>
      </Tooltip>
      <Tooltip title="Increase font size">
        <Button
          onClick={() => onFontSizeChange('large')}
          variant={fontSize === 'large' ? 'contained' : 'outlined'}
          aria-label="Large font size"
          aria-pressed={fontSize === 'large'}
        >
          <TextIncrease fontSize="small" />
        </Button>
      </Tooltip>
    </ButtonGroup>
  );
};







