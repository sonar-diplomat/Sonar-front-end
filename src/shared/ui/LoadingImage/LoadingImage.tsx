import React, { useState, useEffect, useRef } from 'react';
import styles from './LoadingImage.module.css';

export interface LoadingImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  loaderClassName?: string;
  showSpinner?: boolean;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  fallbackSrc?: string;
}

export const LoadingImage: React.FC<LoadingImageProps> = ({
  src,
  alt,
  className = '',
  loaderClassName = '',
  showSpinner = true,
  aspectRatio,
  objectFit = 'cover',
  fallbackSrc,
  onLoad,
  onError,
  style,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setCurrentSrc(src);
  }, [src]);

  // Проверка для Chrome: если картинка уже загружена из кеша
  // Выполняется после обновления DOM с новым src
  useEffect(() => {
    const checkComplete = () => {
      if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
        setIsLoading(false);
      }
    };
    
    // Проверяем сразу (для случая, когда изображение уже в кеше)
    // и с небольшой задержкой для надежности
    checkComplete();
    const timeoutId = setTimeout(checkComplete, 0);
    
    return () => clearTimeout(timeoutId);
  }, [currentSrc]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    setHasError(false);
    if (onLoad) {
      onLoad(e);
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    setHasError(true);

    // Try fallback if available
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setIsLoading(true);
      setHasError(false);
    }

    if (onError) {
      onError(e);
    }
  };

  const containerStyle: React.CSSProperties = {
    ...style,
    aspectRatio: aspectRatio || undefined,
  };

  const imageStyle: React.CSSProperties = {
    objectFit,
  };

  return (
    <div className={styles.imageContainer} style={containerStyle}>
      {isLoading && showSpinner && (
        <div className={`${styles.loader} ${loaderClassName}`}>
          <div className={styles.spinner}></div>
        </div>
      )}
      {hasError && !fallbackSrc ? (
        <div className={styles.errorPlaceholder}>
          <div className={styles.errorIcon}>📷</div>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          className={`${styles.image} ${isLoading ? styles.loading : styles.loaded} ${className}`}
          style={imageStyle}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
    </div>
  );
};

