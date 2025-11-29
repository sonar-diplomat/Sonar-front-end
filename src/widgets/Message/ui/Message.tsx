import React, { useState, useRef, useEffect } from 'react';
import type { Message as MessageType } from '@entities/Chat';
import { CheckMark, ClockIcon, ErrorIcon, ReplyIcon, CopyIcon, EditIcon, DeleteIcon, Info, Button } from '@shared/ui';
import styles from './Message.module.css';

export interface MessageProps {
    message: MessageType;
    isOwn: boolean;
    currentUserId: number;
    senderName?: string;
    senderAvatar?: string;
    isGroupChat?: boolean;
    onReply?: (messageId: number) => void;
    onCopy?: (text: string) => void;
    onEdit?: (messageId: number) => void;
    onDelete?: (messageId: number) => void;
    onReport?: (messageId: number) => void;
}

export const Message: React.FC<MessageProps> = ({
    message,
    isOwn,
    currentUserId,
    senderName,
    senderAvatar,
    isGroupChat = false,
    onReply,
    onCopy,
    onEdit,
    onDelete,
    onReport,
}) => {
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const messageRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const longPressTimerRef = useRef<number | null>(null);
    const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                messageRef.current &&
                !messageRef.current.contains(event.target as Node)
            ) {
                setShowContextMenu(false);
            }
        };

        if (showContextMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showContextMenu]);

    useEffect(() => {
        const element = messageRef.current;
        if (!element) return;

        const handleTouchStart = (e: TouchEvent) => {
            const touch = e.touches[0];
            touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
            
            longPressTimerRef.current = setTimeout(() => {
                if (touchStartPosRef.current) {
                    e.preventDefault();
                    setMenuPosition({ x: touchStartPosRef.current.x, y: touchStartPosRef.current.y });
                    setShowContextMenu(true);
                }
            }, 500);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (touchStartPosRef.current && e.touches[0]) {
                const touch = e.touches[0];
                const deltaX = Math.abs(touch.clientX - touchStartPosRef.current.x);
                const deltaY = Math.abs(touch.clientY - touchStartPosRef.current.y);
                
                if (deltaX > 10 || deltaY > 10) {
                    if (longPressTimerRef.current) {
                        clearTimeout(longPressTimerRef.current);
                        longPressTimerRef.current = null;
                    }
                    touchStartPosRef.current = null;
                }
            }
        };

        const handleTouchEnd = () => {
            if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
            }
            touchStartPosRef.current = null;
        };

        element.addEventListener('touchstart', handleTouchStart, { passive: false });
        element.addEventListener('touchmove', handleTouchMove, { passive: true });
        element.addEventListener('touchend', handleTouchEnd, { passive: true });
        element.addEventListener('touchcancel', handleTouchEnd, { passive: true });

        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchmove', handleTouchMove);
            element.removeEventListener('touchend', handleTouchEnd);
            element.removeEventListener('touchcancel', handleTouchEnd);
            if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
            }
        };
    }, []);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setMenuPosition({ x: e.clientX, y: e.clientY });
        setShowContextMenu(true);
    };

    const handleReply = () => {
        onReply?.(message.id);
        setShowContextMenu(false);
    };

    const handleCopy = () => {
        onCopy?.(message.textContent);
        setShowContextMenu(false);
    };

    const handleEdit = () => {
        onEdit?.(message.id);
        setShowContextMenu(false);
    };

    const handleDelete = () => {
        onDelete?.(message.id);
        setShowContextMenu(false);
    };

    const handleReport = () => {
        onReport?.(message.id);
        setShowContextMenu(false);
    };

    const getStatusIcon = () => {
        if (!isOwn) return null;
        
        const status = message.status || 'sent';
        
        if (status === 'pending') {
            return <ClockIcon className={styles.statusIcon} />;
        }
        
        if (status === 'error') {
            return <ErrorIcon className={`${styles.statusIcon} ${styles.error}`} />;
        }
        
        const isRead = status === 'read';
        const isDelivered = status === 'delivered' || isRead;
        const showSecond = isDelivered;
        
        return (
            <span className={styles.statusIcons}>
                <CheckMark className={`${styles.checkIcon} ${isRead ? styles.read : ''}`} />
                {showSecond && <CheckMark className={`${styles.checkIcon} ${styles.second} ${isRead ? styles.read : ''}`} />}
            </span>
        );
    };

    const showSenderName = !isOwn && isGroupChat && senderName;
    const showAvatar = !isOwn && isGroupChat;

    return (
        <div
            ref={messageRef}
            className={`${styles.message} ${isOwn ? styles.own : styles.other} ${showAvatar ? styles.withAvatar : ''}`}
            onContextMenu={handleContextMenu}
        >
            {showAvatar && (
                <div className={styles.avatar}>
                    {senderAvatar ? (
                        <img src={senderAvatar} alt={senderName || 'User'} className={styles.avatarImage} />
                    ) : (
                        <div className={styles.avatarPlaceholder}>
                            {senderName ? senderName.charAt(0).toUpperCase() : 'U'}
                        </div>
                    )}
                </div>
            )}
            <div className={styles.messageContent}>
                {showSenderName && (
                    <div className={styles.senderName}>
                        {senderName}
                    </div>
                )}
            {message.replyMessage && (
                <div className={styles.replyPreview}>
                    <div className={styles.replyLine} />
                    <div className={styles.replyContent}>
                        <div className={styles.replyAuthor}>
                            {message.replyMessage.senderId === currentUserId ? 'You' : 'User'}
                        </div>
                        <div className={styles.replyText}>{message.replyMessage.textContent}</div>
                    </div>
                </div>
            )}
            <div className={styles.contentWrapper}>
                <div className={styles.content}>
                    <span className={styles.text}>{message.textContent}</span>
                    {isOwn ? (
                        <span className={styles.metaRight}>
                            {getStatusIcon()}
                            <span className={styles.timestamp}>
                                {message.createdAt
                                    ? new Date(message.createdAt).toLocaleTimeString('ru-RU', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                      })
                                    : '13:24'}
                            </span>
                        </span>
                    ) : (
                        <span className={styles.timestamp}>
                            {message.createdAt
                                ? new Date(message.createdAt).toLocaleTimeString('ru-RU', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                  })
                                : '13:24'}
                        </span>
                    )}
                </div>
            </div>
            </div>
            {showContextMenu && (
                <div
                    ref={menuRef}
                    className={styles.contextMenu}
                    style={{
                        left: `${menuPosition.x}px`,
                        top: `${menuPosition.y}px`,
                    }}
                >
                    <Button
                        variant="text"
                        theme="dark"
                        size="medium"
                        onClick={handleReply}
                        icon={<ReplyIcon className={styles.menuIcon} />}
                        className={styles.menuItem}
                    >
                        Reply
                    </Button>
                    <Button
                        variant="text"
                        theme="dark"
                        size="medium"
                        onClick={handleCopy}
                        icon={<CopyIcon className={styles.menuIcon} />}
                        className={styles.menuItem}
                    >
                        Copy
                    </Button>
                    {isOwn ? (
                        <>
                            <Button
                                variant="text"
                                theme="dark"
                                size="medium"
                                onClick={handleEdit}
                                icon={<EditIcon className={styles.menuIcon} />}
                                className={styles.menuItem}
                            >
                                Edit
                            </Button>
                            <Button
                                variant="text"
                                theme="dark"
                                size="medium"
                                onClick={handleDelete}
                                icon={<DeleteIcon className={styles.menuIcon} />}
                                className={styles.menuItem}
                            >
                                Delete
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="text"
                            theme="dark"
                            size="medium"
                            onClick={handleReport}
                            icon={
                                <span style={{ display: 'inline-flex', color: '#EAEAEA' }}>
                                    <Info className={styles.menuIcon} />
                                </span>
                            }
                            className={styles.menuItem}
                        >
                            Report
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

