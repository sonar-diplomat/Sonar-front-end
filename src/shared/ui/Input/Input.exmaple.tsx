import React, { useState } from 'react';
import { Input } from './Input';
import type { DropdownOption } from './Input.types';

export const InputExamples: React.FC = () => {
    const [emailValue, setEmailValue] = useState('');
    const [passwordValue, setPasswordValue] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [phoneValue, setPhoneValue] = useState('');
    const [selectedCountryCode, setSelectedCountryCode] = useState('+1');
    const [selectedDomain, setSelectedDomain] = useState('.com');
    const [searchValue, setSearchValue] = useState('');

    const countryCodeOptions: DropdownOption[] = [
        { value: '+1', label: '+1 (US)' },
        { value: '+44', label: '+44 (UK)' },
        { value: '+49', label: '+49 (DE)' },
        { value: '+33', label: '+33 (FR)' },
        { value: '+81', label: '+81 (JP)' },
        { value: '+380', label: '+380 (UA)' },
    ];

    return (
        <div style={{ padding: '40px', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <h1>Input Component Examples</h1>

            {/* Basic Input */}
            <section>
                <h2>Basic Input</h2>
                <Input
                    label="Username"
                    placeholder="Enter your username"
                    type="text"
                />
            </section>

            {/* Input with Helper Text */}
            <section>
                <h2>Input with Helper Text</h2>
                <Input
                    label="Email"
                    placeholder="example@email.com"
                    type="email"
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    helperText="We'll never share your email with anyone else."
                />
            </section>

            {/* Input with Error State */}
            <section>
                <h2>Input with Error</h2>
                <Input
                    label="Email"
                    placeholder="example@email.com"
                    type="email"
                    value="invalid-email"
                    error="Please enter a valid email address"
                />
            </section>

            {/* Input with Prefix Icon */}
            <section>
                <h2>Input with Prefix Icon</h2>
                <Input
                    label="Search"
                    placeholder="Search..."
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" /></svg>}
                    iconPosition="prefix"
                />
            </section>

            {/* Input with Suffix Icon */}
            <section>
                <h2>Input with Suffix Icon</h2>
                <Input
                    label="Website URL"
                    placeholder="https://example.com"
                    type="url"
                    icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>}
                    iconPosition="suffix"
                />
            </section>

            {/* Input with Clickable Icon (Password Toggle) */}
            <section>
                <h2>Input with Clickable Icon</h2>
                <Input
                    label="Password"
                    placeholder="Enter your password"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordValue}
                    onChange={(e) => setPasswordValue(e.target.value)}
                    icon={
                        showPassword ? (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" /></svg>
                        )
                    }
                    iconPosition="suffix"
                    iconClickable
                    onIconClick={() => setShowPassword(!showPassword)}
                    helperText="Password must be at least 8 characters"
                />
            </section>

            {/* Input with Helper Text Icon */}
            <section>
                <h2>Input with Helper Text Icon</h2>
                <Input
                    label="Credit Card"
                    placeholder="1234 5678 9012 3456"
                    type="text"
                    helperText="Your payment information is secure and encrypted"
                    helperIcon={<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>}
                />
            </section>

            {/* Input with Helper Text Action */}
            <section>
                <h2>Input with Helper Text Action</h2>
                <Input
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                    helperText="Having trouble signing in?"
                    helperTextAction={{
                        text: 'Reset password',
                        onClick: () => alert('Reset password clicked'),
                    }}
                />
            </section>

            {/* Input with Prefix Dropdown */}
            <section>
                <h2>Input with Prefix Dropdown</h2>
                <Input
                    label="Phone Number"
                    placeholder="123 456 7890"
                    type="tel"
                    value={phoneValue}
                    onChange={(e) => setPhoneValue(e.target.value)}
                    dropdownText={selectedCountryCode}
                    dropdownOptions={countryCodeOptions}
                    onDropdownSelect={(option) => setSelectedCountryCode(option.value)}
                    iconPosition="prefix"
                    helperText="Enter your phone number with country code"
                />
            </section>

            {/* Input with Suffix Dropdown */}
            <section>
                <h2>Input with Suffix Dropdown</h2>
                <Input
                    label="Domain Name"
                    placeholder="mywebsite"
                    type="text"
                    dropdownText={selectedDomain}
                    dropdownOptions={[
                        { value: '.com', label: '.com' },
                        { value: '.net', label: '.net' },
                        { value: '.org', label: '.org' },
                        { value: '.io', label: '.io' },
                    ]}
                    onDropdownSelect={(option) => setSelectedDomain(option.value)}
                    iconPosition="suffix"
                />
            </section>

            {/* Disabled Input */}
            <section>
                <h2>Disabled Input</h2>
                <Input
                    label="Disabled Field"
                    placeholder="This field is disabled"
                    type="text"
                    disabled
                    helperText="This field cannot be edited"
                />
            </section>

            {/* Different Input Types */}
            <section>
                <h2>Different Input Types</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Input
                        label="Number"
                        placeholder="Enter a number"
                        type="number"
                        min="0"
                        max="100"
                    />
                    {/*/!*<Input*!/ Bug with maybe click outside hook*/}
                    {/*    label="Date"*/}
                    {/*    type="date"*/}
                    {/*/>*/}
                    <Input
                        label="Time"
                        type="time"
                    />
                </div>
            </section>

            {/* Input with Max Length */}
            <section>
                <h2>Input with Max Length</h2>
                <Input
                    label="Short Bio"
                    placeholder="Tell us about yourself"
                    type="text"
                    maxLength={50}
                    helperText="Maximum 50 characters"
                />
            </section>

            {/* Input with Pattern Validation */}
            <section>
                <h2>Input with Pattern Validation</h2>
                <Input
                    label="Username (Alphanumeric only)"
                    placeholder="john_doe123"
                    type="text"
                    pattern="[a-zA-Z0-9_]+"
                    helperText="Only letters, numbers, and underscores allowed"
                />
            </section>
        </div>
    );
};

export default InputExamples;
