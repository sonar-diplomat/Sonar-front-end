import React, { useState, useRef, useEffect, useCallback } from 'react';

import { Button, SendRight } from '@shared/ui';

import styles from './CodeVerification.module.css';

const CODE_LENGTH = 6;
const DIGIT_REGEX = /^\d*$/;

const createEmptyCode = (): string[] => Array(CODE_LENGTH).fill('');

export interface CodeVerificationProps {
  title: string;
  description: React.ReactNode;
  buttonText: string;
  buttonIcon?: React.ReactNode;
  onConfirm: (code: string) => void;
  onResend?: () => void;
  disabled?: boolean;
}

export const CodeVerification: React.FC<CodeVerificationProps> = ({
  title,
  description,
  buttonText,
  buttonIcon,
  onConfirm,
  onResend,
  disabled = false
}) => {
  const [code, setCode] = useState<string[]>(createEmptyCode());
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

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

  const isCodeComplete = code.every(digit => digit !== '');

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>

        <div className={styles.codeInputs}>
          {code.map((digit, index) => (
            <input
              key={index}
              ref={el => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              placeholder={"-"}
              value={digit}
              onChange={e => handleInputChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className={styles.codeInput}
              disabled={disabled}
            />
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <Button
          icon={buttonIcon}
          variant="filled"
          theme="light"
          size="large"
          fullWidth={true}
          onClick={handleSubmit}
          disabled={!isCodeComplete || disabled}
        >
          {buttonText}
        </Button>

        {onResend && (
          <button className={styles.resendButton} onClick={handleResend} disabled={disabled}>
            <SendRight/>
            <span>Send again</span>
          </button>
        )}
      </div>
    </div>
  );
};