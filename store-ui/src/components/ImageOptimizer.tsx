import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { styled } from '@mui/material/styles';
import { Typography } from '@mui/material';

interface ImageOptimizerProps {
  src: string;
  alt: string;
  width?: string | number;
  height?: string | number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  // New props for better accessibility
  longDesc?: string;
  isDecorative?: boolean;
  role?: string;
}

// Styled component for the image container to maintain aspect ratio
const AspectRatioBox = styled(Box)<{ ratio?: string }>(({ ratio = '1/1' }) => ({
  position: 'relative',
  width: '100%',
  '&::before': {
    content: '""',
    display: 'block',
    paddingTop: `calc(100% / (${ratio.split('/')[0]} / ${ratio.split('/')[1]}))`,
  }
}));

// Styled component for the image with object-fit property
const StyledImage = styled('img')<{ $objectFit: string }>(({ $objectFit }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: $objectFit as any,
}));

/**
 * Simplified ImageOptimizer component that ensures images load properly
 * Focuses on reliability over complex optimizations
 */
const ImageOptimizer: React.FC<ImageOptimizerProps> = ({
  src,
  alt,
  width = '100%',
  height = 'auto',
  sizes = '100vw',
  priority = false,
  className = '',
  style = {},
  objectFit = 'cover',
  quality = 80,
  placeholder = 'empty',
  blurDataURL,
  longDesc = '',
  isDecorative = false,
  role = 'img'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Handle image loading error
  const handleError = () => {
    console.error('Image failed to load:', src);
    setHasError(true);
    setIsLoaded(true); // Mark as loaded to remove skeleton
  };

  // Handle successful image load
  const handleLoad = () => {
    setIsLoaded(true);
  };

  // Determine appropriate alt text handling based on image purpose
  const getImgProps = () => {
    if (isDecorative) {
      return {
        alt: "",
        "aria-hidden": true
      };
    } else if (alt) {
      return {
        alt: alt,
        "aria-hidden": false
      };
    } else {
      return {
        alt: "Image",
        "aria-hidden": false
      };
    }
  };

  return (
    <Box
      className={className}
      style={{
        ...style,
        position: 'relative',
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        overflow: 'hidden',
      }}
    >
      {/* Loading skeleton - only show while image is loading */}
      {!isLoaded && !hasError && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
          }}
          aria-label="Loading image"
          aria-busy="true"
        />
      )}

      {/* Error state */}
      {hasError ? (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            border: '1px solid #ddd',
            color: '#666',
          }}
          role="img"
          aria-label={alt || "Image failed to load"}
        >
          <Typography variant="body2" component="span">
            Image not available
          </Typography>
        </Box>
      ) : (
        /* Actual image - always render but may be hidden by skeleton */
        <img
          ref={imgRef}
          src={src}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: objectFit,
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
          {...getImgProps()}
        />
      )}
      
      {/* Hidden description for complex images (for screen readers) */}
      {longDesc && !isDecorative && (
        <span 
          id={`desc-${src.replace(/[^a-zA-Z0-9]/g, '-')}`} 
          style={{ display: 'none' }}
        >
          {longDesc}
        </span>
      )}
    </Box>
  );
};

export default ImageOptimizer;