import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AccountSettings.module.css';
import { SettingsSection, SettingsItem, Input, Button, Modal, DropDown } from '@shared/ui';
import { ProfileHeader } from '@widgets/ProfileHeader';
import { useAuth } from '@shared/lib/auth/useAuth';
import { ModalDatePicker } from '@widgets/ModalDatePicker';
import {
  useRequestEmailChangeMutation,
  useConfirmPasswordChangeMutation,
  useUpdateUserMutation,
  useRequestPasswordChangeMutation
} from '@shared/api';

export const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [updateUser] = useUpdateUserMutation();
  const [requestEmailChange] = useRequestEmailChangeMutation();
  const [confirmPasswordChange] = useConfirmPasswordChangeMutation();
  const [requestPasswordChange] = useRequestPasswordChangeMutation();

  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPublicIdentifierModal, setShowPublicIdentifierModal] = useState(false);
  const [showDateOfBirthModal, setShowDateOfBirthModal] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordToken, setPasswordToken] = useState('');
  const [newPublicIdentifier, setNewPublicIdentifier] = useState('');
  const [newDateOfBirth, setNewDateOfBirth] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenSent, setTokenSent] = useState(false);

  const handleChangeUsername = async () => {
    if (!newUsername.trim()) {
      setError('Username cannot be empty');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await updateUser({ PublicIdentifier: newUsername }).unwrap();
      setShowUsernameModal(false);
      setNewUsername('');
      //Alert
      console.log('Username updated successfully!');
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to update username');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestEmailChange = async () => {
    if (!newEmail.trim()) {
      setError('Email cannot be empty');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await requestEmailChange(newEmail).unwrap();
      setShowEmailModal(false);
      setNewEmail('');
      // Alert
      console.log('Verification email sent. Please check your inbox and click the confirmation link.');
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to request email change');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword || !passwordToken) {
      setError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await confirmPasswordChange({
        Token: passwordToken,
        NewPassword: newPassword,
        OldPassword: oldPassword,
      }).unwrap();

      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordToken('');
      setTokenSent(false);
      // Alert
      console.log('Password changed successfully!');
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePublicIdentifier = async () => {
    if (!newPublicIdentifier.trim()) {
      setError('Public identifier cannot be empty');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await updateUser({ PublicIdentifier: newPublicIdentifier }).unwrap();
      setShowPublicIdentifierModal(false);
      setNewPublicIdentifier('');
      // Alert
      console.log('Public identifier updated successfully!');
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to update public identifier');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeDateOfBirth = async () => {
    if (!newDateOfBirth.trim()) {
      setError('Date of birth cannot be empty');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await updateUser({ DateOfBirth: newDateOfBirth }).unwrap();
      setShowDateOfBirthModal(false);
      setNewDateOfBirth('');
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to update date of birth');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    console.log('Delete account - API integration needed');
    setShowDeleteModal(false);
    logout();
    navigate('/hello');
  };

  return (
    <div className={styles.container}>
      <ProfileHeader title="Account" showBackButton />
      
      <div className={styles.content}>
        <SettingsSection title="Account Information">
          <SettingsItem
            label="Change Username"
            description="Update your public username"
            onClick={() => setShowUsernameModal(true)}
          />
          <SettingsItem
            label="Change Public Identifier"
            description="Update your public identifier"
            onClick={() => setShowPublicIdentifierModal(true)}
          />
          <SettingsItem
            label="Change Date of Birth"
            description="Update your date of birth"
            onClick={() => setShowDateOfBirthModal(true)}
          />
          <SettingsItem
            label="Change Email"
            description="Update your email address"
            onClick={() => setShowEmailModal(true)}
          />
          <SettingsItem
            label="Change Password"
            description="Update your password"
            onClick={() => setShowPasswordModal(true)}
          />
        </SettingsSection>

        <SettingsSection title="Sessions">
          <SettingsItem
            label="Active Sessions"
            description="View and manage your active sessions"
            onClick={() => navigate('/settings/sessions')}
          />
        </SettingsSection>

        <SettingsSection title="Danger Zone">
          <SettingsItem
            label="Delete Account"
            description="Permanently delete your account"
            onClick={() => setShowDeleteModal(true)}
            showArrow={false}
          />
        </SettingsSection>
      </div>

      <Modal isOpen={showUsernameModal} onClose={() => setShowUsernameModal(false)}>
        <div className={styles.modalContent}>
          <h2 className={styles.modalTitle}>Change Username</h2>
          <Input
            label="New Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Enter new username"
            error={error}
          />
          <div className={styles.modalActions}>
            <Button variant="light" onClick={() => setShowUsernameModal(false)}>
              Cancel
            </Button>
            <Button variant="dark" onClick={handleChangeUsername} loading={isLoading}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)}>
        <div className={styles.modalContent}>
          <h2 className={styles.modalTitle}>Change Email</h2>
          <Input
            label="New Email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter new email"
            error={error}
          />
          <div className={styles.modalActions}>
            <Button variant="light" onClick={() => setShowEmailModal(false)}>
              Cancel
            </Button>
            <Button variant="dark" onClick={handleRequestEmailChange} loading={isLoading}>
              Verify
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showPasswordModal} onClose={() => { setShowPasswordModal(false); setTokenSent(false); setError(''); }}>
        <div className={styles.modalContent}>
          <h2 className={styles.modalTitle}>Change Password</h2>
          {!tokenSent ? (
            <>
              <p className={styles.modalDescription}>
                A verification token will be sent to your email. You'll need this token to complete the password change.
              </p>
              <div className={styles.modalActions}>
                <Button variant="light" onClick={() => { setShowPasswordModal(false); setTokenSent(false); }}>
                  Cancel
                </Button>
                <Button variant="dark" onClick={async () => {
                  setIsLoading(true);
                  setError('');
                  try {
                    await requestPasswordChange().unwrap();
                    setTokenSent(true);
                    // Alert
                    console.log('Verification token sent to your email!');
                  } catch (err: any) {
                    setError(err?.data?.message || 'Failed to send token');
                  } finally {
                    setIsLoading(false);
                  }
                }} loading={isLoading}>
                  Send Token
                </Button>
              </div>
            </>
          ) : (
            <>
              <Input
                label="Verification Token"
                type="text"
                value={passwordToken}
                onChange={(e) => setPasswordToken(e.target.value)}
                placeholder="Enter token from email"
              />
              <Input
                label="Current Password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
          />
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                error={error}
              />
              <div className={styles.modalActions}>
                <Button variant="light" onClick={() => { setShowPasswordModal(false); setTokenSent(false); setError(''); }}>
                  Cancel
                </Button>
                <Button variant="dark" onClick={handleChangePassword} loading={isLoading}>
                  Change Password
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal isOpen={showPublicIdentifierModal} onClose={() => setShowPublicIdentifierModal(false)}>
        <div className={styles.modalContent}>
          <h2 className={styles.modalTitle}>Change Public Identifier</h2>
          <Input
            label="New Public Identifier"
            value={newPublicIdentifier}
            onChange={(e) => setNewPublicIdentifier(e.target.value)}
            placeholder="Enter new public identifier"
            error={error}
          />
          <div className={styles.modalActions}>
            <Button variant="light" onClick={() => setShowPublicIdentifierModal(false)}>
              Cancel
            </Button>
            <Button variant="dark" onClick={handleChangePublicIdentifier} loading={isLoading}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDateOfBirthModal} onClose={() => setShowDateOfBirthModal(false)}>
        <div className={styles.modalContent}>
          <h2 className={styles.modalTitle}>Change Date of Birth</h2>
          <Input
            label="New Date of Birth"
            placeholder="yyyy-mm-dd"
            icon={<DropDown/>}
            iconPosition="prefix"
            iconClickable={true}
            value={newDateOfBirth}
            onChange={(e) => setNewDateOfBirth(e.target.value)}
            onIconClick={() => setIsDatePickerOpen(true)}
            readOnly
          />
          <ModalDatePicker
            isOpen={isDatePickerOpen}
            onClose={() => setIsDatePickerOpen(false)}
            onConfirm={(date) => setNewDateOfBirth(date)}
            initialValue={newDateOfBirth}
          />
          <div className={styles.modalActions}>
            <Button variant="light" onClick={() => setShowDateOfBirthModal(false)}>
              Cancel
            </Button>
            <Button variant="dark" onClick={handleChangeDateOfBirth} loading={isLoading}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className={styles.modalContent}>
          <h2 className={styles.modalTitle}>Delete Account</h2>
          <p className={styles.warningText}>
            Are you sure you want to delete your account? This action cannot be undone.
            All your data will be permanently deleted.
          </p>
          <div className={styles.modalActions}>
            <Button variant="light" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="dark" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

