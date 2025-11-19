import React from "react";
import styles from './TermsOfService.module.css';
import { Button } from "@shared/ui";

const handleBack = () => {
    window.history.back();
};

export const TermsOfService: React.FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.title}>
                    <h2 className={styles.titleText}>Sonar Terms of Service</h2>
                    <h3 className={styles.subtitleText}>Effective Date: 2025</h3>
                </div>
                <div className={styles.mainPrimaryText}>
                    <div>1. General Provisions and Acceptance</div>
                    <div>1.1. Agreement. These Terms of Service ("Terms") govern your access to and use of the Sonar mobile application and all associated services, including music streaming, social networking features (chat, profiles), and paid subscriptions.</div>
                    <div>1.2. Acceptance. By accessing or using the App, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you must not use the App.</div>
                    <div>2. Accounts and Registration</div>
                    <div>2.1. Eligibility. You must be at least 16 years of age to create an account.</div>
                    <div>2.2. Account Information. You agree to provide accurate, current, and complete information during the registration process and to keep your password secure. You are responsible for all activities that occur under your account.</div>
                    <div>3. Subscriptions, Billing, and Payments (Key Section for Paid Features)</div>
                    <div>3.1. Billing. You may purchase a paid subscription ("Subscription") to access premium features. You agree to pay all applicable fees and taxes.</div>
                    <div>3.2. Auto-Renewal Consent. ALL SUBSCRIPTIONS ARE RECURRING AND AUTOMATICALLY RENEW. By purchasing a Subscription, you explicitly agree that your payment method will be charged automatically at the then-current rate at the end of each billing period (monthly/annually) unless you cancel your Subscription.</div>
                    <div>3.3. Cancellation. You can cancel your Subscription at any time by managing it through your [Apple App Store / Google Play Store] account settings. Cancellation will take effect at the end of your current paid period.</div>
                    <div>3.4. Refund Policy. ALL PAYMENTS ARE FINAL AND NON-REFUNDABLE. We do not provide refunds or credits for any partial subscription periods, except as required by law or the policies of the respective App Store where the purchase was made.</div>
                    <div>4. Intellectual Property and Music Content (Key Section for Music)</div>
                    <div>4.1. App Ownership. All content within the App (software, design, trademarks) is the property of Sonar or its licensors and is protected by intellectual property laws.</div>
                    <div>4.2. Music Content Usage.</div>
                    <ul>
                        <li>License. All music available in the Sonar App is provided to you under a limited, non-transferable license for personal, non-commercial listening purposes only.</li>
                        <li>Restrictions. You are strictly prohibited from copying, redistributing, publicly performing, or otherwise using the music content in any way not expressly permitted by the App’s features.</li>
                    </ul>
                    <div>5. User Content and Community Guidelines (Key Section for Social Features)</div>
                    <div>5.1. User Content Defined. "User Content" includes any text, profile photos, chat messages, or other material you upload or transmit through the App's social features.</div>
                    <div>5.2. License Grant. By posting User Content, you grant Sonar a non-exclusive, worldwide, royalty-free, perpetual license to use, modify, reproduce, and display your User Content in connection with operating and promoting the App.</div>
                    <div>5.3. Prohibited Conduct.</div>
                    <ul>
                        <li>Unlawful, defamatory, abusive, harassing, or hate speech.</li>
                        <li>Infringing upon the intellectual property or privacy rights of any third party.</li>
                        <li>Spam, advertisements, or malicious software.</li>
                        <li>You agree not to use the chat function for bullying, trolling, or commercial solicitation.</li>
                    </ul>
                    <div>6. Disclaimer of Warranties and Limitation of Liability</div>
                    <div>6.1. "AS IS" Basis. The Sonar App is provided on an "as is" and "as available" basis, without warranties of any kind.</div>
                    <div>6.2. Limitation of Liability. Sonar will not be liable for any indirect, incidental, punitive, or consequential damages arising out of or in connection with your use of the App, including any damages resulting from reliance on information obtained from the App or from mistakes, omissions, interruptions, deletion of files or email, errors, defects, viruses, delays in operation or transmission, or any failure of performance.</div>
                    <div>7. Governing Law</div>
                    <div>7.1. Jurisdiction. These Terms shall be governed by the laws of [Your Jurisdiction/Country], without regard to its conflict of law provisions.</div>
                    <div>8. Changes to Terms</div>
                    <div>8.1. Updates. We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting the new Terms within the Sonar App or via email. Your continued use of the App after such changes constitutes your acceptance of the new Terms.</div>
                    <div>9. Contact Information</div>
                    <div>If you have any questions about these Terms, please contact us at: [Your Support Email Address].</div>
                </div>
                <Button
                    children={'Confirm'}
                    size={'large'}
                    variant={'light'}
                    onClick={handleBack}
                    className={styles.backButton}
                />
            </div>
        </div>
    );
}