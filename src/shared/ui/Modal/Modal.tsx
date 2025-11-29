import React, { useEffect, useRef } from 'react';

import styles from './Modal.module.css';
import {ClearIcon} from '../icons';
import {Button} from "@shared/ui";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose();
      }
    };

    const handleResize = () => {
      if (!modalRef.current) return;

      const visualViewport = window.visualViewport;
      if (visualViewport) {
        const keyboardHeight = window.innerHeight - visualViewport.height;
        if (keyboardHeight > 100) {
          modalRef.current.style.maxHeight = `${visualViewport.height - 20}px`;
          modalRef.current.style.overflowY = 'auto';
        } else {
          modalRef.current.style.maxHeight = '';
          modalRef.current.style.overflowY = '';
        }
      }
    };

    document.addEventListener('keydown', handleEscape);

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
      handleResize();
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEscape);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, [isOpen, onClose, closeOnEscape]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div ref={modalRef} className={`${styles.modal} ${className}`}>
        {(title || showCloseButton) && (
          <div className={styles.header}>
            {showCloseButton && (
                <Button onClick={onClose} icon={<ClearIcon/>} children={"Close"} size={"small"} variant={"filled"} theme={"dark"} shape={"cr-16"}/>
            )}
            {title && <h2 className={styles.title}>{title}</h2>}
          </div>
        )}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};