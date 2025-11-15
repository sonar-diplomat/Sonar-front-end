import React, { useEffect, useRef } from 'react';

import styles from './Modal.module.css';
import { CloseIcon } from '../icons';
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

    // Lock body scroll when modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Handle ESC key press
    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEscape);
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
                <Button onClick={onClose} icon={<CloseIcon/>} children={"Close"} size={"small"} variant={"dark"} shape={"cr-16"}/>
            )}
            {title && <h2 className={styles.title}>{title}</h2>}
          </div>
        )}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};