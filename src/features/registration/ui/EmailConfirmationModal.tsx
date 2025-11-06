import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './EmailConfirmationModal.module.css';
import { Button, RightArrow, LeftArrow, SendRight } from '@shared/ui';
import { useClickOutside } from '@shared/ui/Input/hooks/useClickOutside';

const CODE_LENGTH = 6;
const DIGIT_REGEX = /^\d*$/;

const createEmptyCode = (): string[] => Array(CODE_LENGTH).fill('');

export interface EmailConfirmationModalProps {
  email: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (code: string) => void;
  onResend?: () => void;
}

export const EmailConfirmationModal: React.FC<EmailConfirmationModalProps> = ({
  email,
  isOpen,
  onClose,
  onConfirm,
  onResend
}) => {
  const [code, setCode] = useState<string[]>(createEmptyCode());
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  useClickOutside(modalRef, onClose, isOpen);

  useEffect(() => {
    if (isOpen) {
      inputRefs.current[0]?.focus();
    }
  }, [isOpen]);

  const focusInput = useCallback((index: number) => {
    inputRefs.current[index]?.focus();
  }, []);

  const handleInputChange = useCallback((index: number, value: string) => {
    const digit = value.length > 1 ? value[value.length - 1] : value;

    if (!DIGIT_REGEX.test(digit)) return;

    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < CODE_LENGTH - 1) {
      focusInput(index + 1);
    }
  }, [code, focusInput]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      focusInput(index - 1);
    }
  }, [code, focusInput]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, CODE_LENGTH);

    if (!DIGIT_REGEX.test(pastedData)) return;

    const newCode = createEmptyCode();
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);

    const nextEmptyIndex = newCode.findIndex(c => !c);
    focusInput(nextEmptyIndex !== -1 ? nextEmptyIndex : CODE_LENGTH - 1);
  }, [focusInput]);

  const handleSubmit = useCallback(() => {
    const fullCode = code.join('');
    if (fullCode.length === CODE_LENGTH) {
      onConfirm(fullCode);
    }
  }, [code, onConfirm]);

  const handleResend = useCallback(() => {
    setCode(createEmptyCode());
    focusInput(0);
    onResend?.();
  }, [onResend, focusInput]);

  if (!isOpen) return null;

  const isCodeComplete = code.every(digit => digit !== '');

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal} ref={modalRef}>
        <button className={styles.backButton} onClick={onClose}>
          <LeftArrow />
          <span>Back</span>
        </button>

        <div className={styles.content}>
          <h2 className={styles.title}>Confirm E-mail</h2>
          <p className={styles.description}>
            Enter the 6-digit code you received via email at{' '}
            <span className={styles.email}>{email}</span> to confirm your email.
          </p>

          <div className={styles.codeInputs}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleInputChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className={styles.codeInput}
              />
            ))}
          </div>

          <div className={styles.actions}>
            <Button
              icon={<RightArrow />}
              variant="light"
              size="large"
              fullWidth={true}
              onClick={handleSubmit}
              disabled={!isCodeComplete}
            >
              Sign in
            </Button>

            <button className={styles.resendButton} onClick={handleResend}>
              <SendRight/>
              <span>Send again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
