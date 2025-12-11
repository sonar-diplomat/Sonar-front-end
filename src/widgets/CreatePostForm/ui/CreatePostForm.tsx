import React, { useState } from 'react';
import { Button, CalendarIcon, LinkIcon, ImageIcon, MusicNoteIcon } from '@shared/ui';
import { RightArrow } from '@shared/ui';
import styles from './CreatePostForm.module.css';
import {ModalDatePicker} from "@widgets/ModalDatePicker";

export interface CreatePostFormProps {
    artistName?: string;
    artistAvatar?: string;
    onSubmit?: (data: PostFormData) => void;
    onCancel?: () => void;
}

export interface PostFormData {
    topic: string;
    content: string;
    scheduledDate?: string;
}

export const CreatePostForm: React.FC<CreatePostFormProps> = ({
    artistName = 'Artist',
    artistAvatar = 'https://placehold.co/52x52',
    onSubmit,
    onCancel,
}) => {
    const [topic, setTopic] = useState('');
    const [content, setContent] = useState('');
    const [scheduledDate, setScheduledDate] = useState<string | undefined>();
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    const handleSubmit = () => {
        if (onSubmit) {
            onSubmit({ topic, content, scheduledDate });
        }
    };

    const handleDateConfirm = (date: string) => {
        setScheduledDate(date);
        setIsDatePickerOpen(false);
    };

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
                    onClose={() => setIsDatePickerOpen(false)}
                    onConfirm={handleDateConfirm}
                    initialValue={scheduledDate}
                />
                <Button
                    variant="filled"
                    theme="dark"
                    shape="cr-16"
                    className={styles.scheduleButton}
                    icon={<CalendarIcon />}
                    onClick={()=>{setIsDatePickerOpen(true)}}
                >
                    {scheduledDate?"Posting " + scheduledDate:"Shedule"}
                </Button>

                <div className={styles.iconButtons}>
                    <Button
                        variant="filled"
                        theme="dark"
                        shape="cr-16"
                        icon={<LinkIcon />}
                        iconOnly
                        className={styles.iconButton}
                    />
                    <Button
                        variant="filled"
                        theme="dark"
                        shape="cr-16"
                        icon={<ImageIcon />}
                        iconOnly
                        className={styles.iconButton}
                    />
                    <Button
                        variant="filled"
                        theme="dark"
                        shape="cr-16"
                        icon={<MusicNoteIcon />}
                        iconOnly
                        className={styles.iconButton}
                    />
                </div>
            </div>

            <Button
                variant="filled"
                theme="light"
                shape="cr-16"
                className={styles.submitButton}
                onClick={handleSubmit}
                icon={<RightArrow />}
            >
                Post
            </Button>
        </div>
    );
};
