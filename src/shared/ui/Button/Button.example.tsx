import React from 'react';
import { Button } from './Button';


const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M5 3l12 7-12 7V3z" />
  </svg>
);

export const ButtonExamples = () => {
  return (
    <div style={{ padding: '20px', background: '#000', minHeight: '100vh' }}>
      <h2 style={{ color: '#fff', marginBottom: '20px' }}>Button Variations</h2>

      {/* Row 1: Primary variants with text and icon */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <Button variant="primary" size="large" shape="cr-16" icon={<PlayIcon />}>
          Text
        </Button>
        <Button variant="primary" size="medium" shape="cr-16" icon={<PlayIcon />}>
          Text
        </Button>
        <Button variant="primary" size="small" shape="cr-16" icon={<PlayIcon />}>
          Text
        </Button>
      </div>

      {/* Row 2: Primary variants text only */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <Button variant="primary" size="large" shape="cr-16">
          Text
        </Button>
        <Button variant="primary" size="medium" shape="cr-16">
          Text
        </Button>
        <Button variant="primary" size="small" shape="cr-16">
          Text
        </Button>
      </div>

      {/* Row 3: Icon only cr-20 */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <Button variant="primary" size="large" shape="cr-20" iconOnly icon={<PlayIcon />} />
        <Button variant="primary" size="medium" shape="cr-20" iconOnly icon={<PlayIcon />} />
        <Button variant="primary" size="small" shape="cr-20" iconOnly icon={<PlayIcon />} />
      </div>

      {/* Row 4: Icon only cr-24 */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <Button variant="primary" size="large" shape="cr-24" iconOnly icon={<PlayIcon />} />
        <Button variant="primary" size="medium" shape="cr-24" iconOnly icon={<PlayIcon />} />
        <Button variant="primary" size="small" shape="cr-24" iconOnly icon={<PlayIcon />} />
      </div>

        {/* Row 5: Icon only cr-32 */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <Button variant="primary" size="large" shape="cr-32" iconOnly icon={<PlayIcon />} />
            <Button variant="primary" size="medium" shape="cr-32" iconOnly icon={<PlayIcon />} />
            <Button variant="primary" size="small" shape="cr-32" iconOnly icon={<PlayIcon />} />
        </div>


      {/* Loading states */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <Button variant="primary" size="large" shape="cr-16" loading>
          Text
        </Button>
        <Button variant="primary" size="small" shape="cr-20" iconOnly loading />
      </div>
    </div>
  );
};

export default ButtonExamples;