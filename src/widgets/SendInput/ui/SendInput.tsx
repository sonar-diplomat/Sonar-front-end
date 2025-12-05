import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, SendRight, PlusIcon, ClearIcon } from '@shared/ui';
import type { Message } from '@entities/Chat';
import { StickerPicker } from '@widgets/StickerPicker';
import styles from './SendInput.module.css';

export interface SendInputProps {
    onSend: (message: string) => void;
    onAttach?: () => void;
    placeholder?: string;
    disabled?: boolean;
    replyMessage?: Message | null;
    onCancelReply?: () => void;
    editingMessage?: Message | null;
    onCancelEdit?: () => void;
}

export const SendInput: React.FC<SendInputProps> = ({
    onSend,
    onAttach,
    placeholder = 'Type a message...',
    disabled = false,
    replyMessage,
    onCancelReply,
    editingMessage,
    onCancelEdit,
}) => {
    const [message, setMessage] = useState('');
    const [isStickerPickerOpen, setIsStickerPickerOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Update message when editing
    useEffect(() => {
        if (editingMessage) {
            setMessage(editingMessage.textContent);
            inputRef.current?.focus();
        } else {
            setMessage('');
        }
    }, [editingMessage]);

    const handleSend = () => {
        if (message.trim() && !disabled) {
            onSend(message.trim());
            if (!editingMessage) {
                setMessage('');
            }
            inputRef.current?.focus();
        }
    };

    const handleCancelReply = () => {
        onCancelReply?.();
    };

    const handleCancelEdit = () => {
        onCancelEdit?.();
        setMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleAttachClick = () => {
        setIsStickerPickerOpen(prev => !prev);
        onAttach?.();
    };

    const handleStickerSelect = (stickerId: number) => {
        onSend(`:sticker:${stickerId}:`);
        setIsStickerPickerOpen(false);
    };

    const handleCloseStickerPicker = () => {
        setIsStickerPickerOpen(false);
    };

    return (
        <div className={styles.container}>
            {editingMessage && (
                <div className={styles.replyPreview}>
                    <div className={styles.replyLine} />
                    <div className={styles.replyContent}>
                        <div className={styles.replyText}>
                            Editing: {editingMessage.textContent}
                        </div>
                    </div>
                    <Button
                        iconOnly
                        icon={<ClearIcon />}
                        onClick={handleCancelEdit}
                        variant="text"
                        theme="dark"
                        size="small"
                        className={styles.cancelReplyButton}
                        aria-label="Cancel edit"
                    />
                </div>
            )}
            {replyMessage && !editingMessage && (
                <div className={styles.replyPreview}>
                    <div className={styles.replyLine} />
                    <div className={styles.replyContent}>
                        <div className={styles.replyText}>
                            {replyMessage.textContent}
                        </div>
                    </div>
                    <Button
                        iconOnly
                        icon={<ClearIcon />}
                        onClick={handleCancelReply}
                        variant="text"
                        theme="dark"
                        size="small"
                        className={styles.cancelReplyButton}
                        aria-label="Cancel reply"
                    />
                </div>
            )}
            <div className={styles.inputWrapper}>
                {onAttach && !isStickerPickerOpen && (
                    <Button
                        iconOnly
                        icon={<PlusIcon />}
                        onClick={handleAttachClick}
                        disabled={disabled}
                        variant="text"
                        theme="dark"
                        size="large"
                        className={styles.iconButton}
                        aria-label="Stickers"
                    />
                )}
                {!isStickerPickerOpen && (
                    <Input
                        ref={inputRef}
                        className={styles.input}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={placeholder}
                        disabled={disabled}
                    />
                )}
                {!isStickerPickerOpen && (
                    <Button
                        iconOnly
                        icon={<SendRight />}
                        onClick={handleSend}
                        disabled={disabled || !message.trim()}
                        variant="text"
                        theme="dark"
                        size="large"
                        className={styles.iconButton}
                        aria-label="Send"
                    />
                )}
            </div>
            {isStickerPickerOpen && (
                <StickerPicker
                    onSelect={handleStickerSelect}
                    onClose={handleCloseStickerPicker}
                />
            )}
        </div>
    );
};

