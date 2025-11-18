import React from 'react';

import {PlayIcon} from "../icons.tsx";

import { Button } from './Button';




export const ButtonExamples = () => {
    return (
        <div style={{ padding: '20px', background: '#000', minHeight: '100vh' }}>
            <h2 style={{ color: '#fff', marginBottom: '20px' }}>Button Variations</h2>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <Button variant="light" size="large" shape="cr-16" icon={<PlayIcon />}>
                    Text
                </Button>
                <Button variant="light" size="medium" shape="cr-16" icon={<PlayIcon />}>
                    Text
                </Button>
                <Button variant="light" size="small" shape="cr-16" icon={<PlayIcon />}>
                    Text
                </Button>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <Button variant="dark" size="large" shape="cr-16" icon={<PlayIcon />}>
                    Text
                </Button>
                <Button variant="dark" size="medium" shape="cr-16" icon={<PlayIcon />}>
                    Text
                </Button>
                <Button variant="dark" size="small" shape="cr-16" icon={<PlayIcon />}>
                    Text
                </Button>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <Button variant="light" size="large" shape="cr-16">
                    Text
                </Button>
                <Button variant="light" size="medium" shape="cr-16">
                    Text
                </Button>
                <Button variant="light" size="small" shape="cr-16">
                    Text
                </Button>
                <Button variant="dark" size="large" shape="cr-16">
                    Text
                </Button>
                <Button variant="dark" size="medium" shape="cr-16">
                    Text
                </Button>
                <Button variant="dark" size="small" shape="cr-16">
                    Text
                </Button>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <Button variant="light" size="large" shape="cr-20" iconOnly icon={<PlayIcon />} />
                <Button variant="light" size="medium" shape="cr-20" iconOnly icon={<PlayIcon />} />
                <Button variant="light" size="small" shape="cr-20" iconOnly icon={<PlayIcon />} />
                <Button variant="dark" size="large" shape="cr-20" iconOnly icon={<PlayIcon />} />
                <Button variant="dark" size="medium" shape="cr-20" iconOnly icon={<PlayIcon />} />
                <Button variant="dark" size="small" shape="cr-20" iconOnly icon={<PlayIcon />} />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <Button variant="light" size="large" shape="cr-24" iconOnly icon={<PlayIcon />} />
                <Button variant="light" size="medium" shape="cr-24" iconOnly icon={<PlayIcon />} />
                <Button variant="light" size="small" shape="cr-24" iconOnly icon={<PlayIcon />} />
                <Button variant="dark" size="large" shape="cr-24" iconOnly icon={<PlayIcon />} />
                <Button variant="dark" size="medium" shape="cr-24" iconOnly icon={<PlayIcon />} />
                <Button variant="dark" size="small" shape="cr-24" iconOnly icon={<PlayIcon />} />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <Button variant="light" size="large" shape="cr-32" iconOnly icon={<PlayIcon />} />
                <Button variant="light" size="medium" shape="cr-32" iconOnly icon={<PlayIcon />} />
                <Button variant="light" size="small" shape="cr-32" iconOnly icon={<PlayIcon />} />
                <Button variant="dark" size="large" shape="cr-32" iconOnly icon={<PlayIcon />} />
                <Button variant="dark" size="medium" shape="cr-32" iconOnly icon={<PlayIcon />} />
                <Button variant="dark" size="small" shape="cr-32" iconOnly icon={<PlayIcon />} />
            </div>


            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <Button variant="light" size="large" shape="cr-16" loading>
                    Text
                </Button>
                <Button variant="light" size="small" shape="cr-20" iconOnly loading />
                <Button variant="dark" size="large" shape="cr-16" loading>
                    Text
                </Button>
                <Button variant="dark" size="small" shape="cr-20" iconOnly loading />
            </div>
        </div>
    );
};

export default ButtonExamples;