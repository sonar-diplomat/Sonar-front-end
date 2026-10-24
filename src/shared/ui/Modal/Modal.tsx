import React,{ useEffect,useId,useRef } from 'react';

import { Button } from "@shared/ui";

import { ClearIcon } from '../icons';

import styles from './Modal.module.css';

const openDialogs: HTMLDivElement[] = [];
const getControls = (modal: HTMLDivElement) => [...modal.querySelectorAll<HTMLElement>(
  'button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])'
)].filter(element => element.tabIndex >= 0 && element.getClientRects().length > 0);

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  ariaLabel?: string;
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
  ariaLabel = 'Dialog',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    openDialogs.push(modal);
    const focusable = () => getControls(modal);
    (focusable()[0] || modal).focus();

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event: KeyboardEvent) => {
      if (event.defaultPrevented || openDialogs.at(-1) !== modal) return;
      if (closeOnEscape && event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
      }
      if (event.key === 'Tab') {
        const elements = focusable();
        const first = elements[0];
        const last = elements.at(-1);
        if (!first) {
          event.preventDefault();
          modal.focus();
        } else if (!modal.contains(document.activeElement) || document.activeElement === modal ||
          (event.shiftKey ? document.activeElement === first : document.activeElement === last)) {
          event.preventDefault();
          (event.shiftKey ? last : first)?.focus();
        }
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
      openDialogs.splice(openDialogs.indexOf(modal), 1);
      document.body.style.overflow = originalOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
      document.removeEventListener('keydown', handleEscape);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, [isOpen, closeOnEscape]);

  // A menu can replace its controls with a selector while keeping this dialog open.
  useEffect(() => {
    const modal = modalRef.current;
    if (isOpen && modal && openDialogs.at(-1) === modal && !modal.contains(document.activeElement)) {
      (getControls(modal)[0] || modal).focus();
    }
  });

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div ref={modalRef} className={`${styles.modal} ${className}`} role="dialog" aria-modal="true"
        aria-labelledby={title ? titleId : undefined} aria-label={title ? undefined : ariaLabel} tabIndex={-1}>
        {(title || showCloseButton) && (
          <div className={styles.header}>
            {showCloseButton && (
                <Button onClick={onClose} icon={<ClearIcon/>} children={"Close"} size={"small"} variant={"filled"} theme={"dark"} shape={"cr-16"}/>
            )}
            {title && <h2 id={titleId} className={styles.title}>{title}</h2>}
          </div>
        )}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};
