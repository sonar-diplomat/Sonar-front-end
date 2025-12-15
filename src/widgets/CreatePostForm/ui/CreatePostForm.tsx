import React, { useState } from 'react';
import { Button, CalendarIcon, LinkIcon, ImageIcon, MusicNoteIcon, RightArrow } from '@shared/ui';
import { ModalDatePicker } from '@widgets/ModalDatePicker';
import styles from './CreatePostForm.module.css';

export interface CreatePostFormProps {
    artistName?: string;
    artistAvatar?: string;
    onSubmit?: (data: PostFormData) => void;
    isSubmitting?: boolean;
}

export interface PostFormData {
    topic: string;
    content: string;
    scheduledDate?: string;
}

const COMMON_BUTTON_PROPS = {
    variant: 'filled' as const,
    theme: 'dark' as const,
    shape: 'cr-16' as const,
};

const ATTACHMENT_BUTTONS = [
    { icon: LinkIcon, key: 'link' },
    { icon: ImageIcon, key: 'image' },
    { icon: MusicNoteIcon, key: 'music' },
] as const;

export const CreatePostForm: React.FC<CreatePostFormProps> = ({
    artistName = 'Artist',
    artistAvatar = 'https://placehold.co/52x52',
    onSubmit,
    isSubmitting = false,
}) => {
    const [topic, setTopic] = useState('');
    const [content, setContent] = useState('');
    const [scheduledDate, setScheduledDate] = useState<string | undefined>();
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    const handleSubmit = () => {
        onSubmit?.({ topic, content, scheduledDate });
    };

    const handleDateConfirm = (date: string) => {
        setScheduledDate(date);
        setIsDatePickerOpen(false);
    };

    const handleOpenDatePicker = () => setIsDatePickerOpen(true);
    const handleCloseDatePicker = () => setIsDatePickerOpen(false);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Write new message</h2>
            </div>

            <div className={styles.formCard}>
                <div className={styles.topSection}>
                    <div className={styles.artistInfo}>
                        <img
                            src={artistAvatar}
                            alt={artistName}
                            className={styles.avatar}
                        />
                        <div className={styles.inputGroup}>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Add a topic"
                                className={styles.topicInput}
                            />
                            <span className={styles.artistName}>{artistName}</span>
                        </div>
                    </div>

                    <div className={styles.contentArea}>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's new?"
                            className={styles.contentInput}
                        />
                    </div>
                </div>
            </div>
            <div className={styles.actions}>
                <ModalDatePicker
                    isOpen={isDatePickerOpen}
                    onClose={handleCloseDatePicker}
                    onConfirm={handleDateConfirm}
                    initialValue={scheduledDate}
                />
                <Button
                    {...COMMON_BUTTON_PROPS}
                    className={styles.scheduleButton}
                    icon={<CalendarIcon />}
                    onClick={handleOpenDatePicker}
                >
                    {scheduledDate ? `Posting at ${scheduledDate}` : 'Schedule'}
                </Button>

                <div className={styles.iconButtons}>
                    {ATTACHMENT_BUTTONS.map(({ icon: Icon, key }) => (
                        <Button
                            key={key}
                            {...COMMON_BUTTON_PROPS}
                            icon={<Icon />}
                            iconOnly
                            className={styles.iconButton}
                        />
                    ))}
                </div>
            </div>

            <Button
                variant="filled"
                theme="light"
                shape="cr-16"
                className={styles.submitButton}
                onClick={handleSubmit}
                icon={<RightArrow />}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
        </div>
    );
};
