import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './AccountSettings.module.css';
import { SettingsSection, SettingsItem, Input, Button, Modal, DropDown, LeftArrow, Form, LoadingImage } from '@shared/ui';
import { useAuth } from '@shared/lib/auth/useAuth';
import { useCurrentUserId } from '@shared/lib/auth/useCurrentUserId';
import { ModalDatePicker } from '@widgets/ModalDatePicker';
import {
  useRequestEmailChangeMutation,
  useConfirmPasswordChangeMutation,
  useUpdateUserMutation,
  useRequestPasswordChangeMutation,
  useUpdateUserAvatarMutation,
  useGetUserByIdQuery,
  useGetUserProfileQuery,
  useGetUsersQuery,
  userApi
} from '@shared/api';
import { getImageUrlById } from '@shared/lib/image-utils';
import { useNotifications } from '@shared/store/notificationStore';
import { useAppDispatch } from '@shared/store/hooks';

export const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { logout } = useAuth();
  const currentUserId = useCurrentUserId();
  
  const [updateUser] = useUpdateUserMutation();
  const [requestEmailChange] = useRequestEmailChangeMutation();
  const [confirmPasswordChange] = useConfirmPasswordChangeMutation();
  const [requestPasswordChange] = useRequestPasswordChangeMutation();
  const [updateUserAvatar] = useUpdateUserAvatarMutation();
  const { showSuccess, showError } = useNotifications();

  const { data: currentUserData } = useGetUserByIdQuery(currentUserId!, {
    skip: !currentUserId,
  });

  const { data: currentUserProfile } = useGetUserProfileQuery(currentUserId!, {
    skip: !currentUserId,
  });

  // Get full user data (including dateOfBirth) from users list
  const { data: usersList } = useGetUsersQuery(undefined, {
    skip: !currentUserId,
  });
  
  const currentUserFullData = usersList?.find(user => user.id === currentUserId);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Form fields
  const [username, setUsername] = useState('');
  const [publicIdentifier, setPublicIdentifier] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [email, setEmail] = useState('');
  const [biography, setBiography] = useState('');

  // Password modal fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordToken, setPasswordToken] = useState('');
  const [tokenSent, setTokenSent] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    // Use full user data if available (includes dateOfBirth)
    if (currentUserFullData) {
      setUsername(currentUserFullData.userName || '');
      setPublicIdentifier(currentUserFullData.publicIdentifier || '');
      setDateOfBirth(currentUserFullData.dateOfBirth || '');
      setEmail(currentUserFullData.email || '');
      setBiography(currentUserFullData.biography || '');
      if (currentUserFullData.avatarUrl) {
        setAvatarPreview(currentUserFullData.avatarUrl);
      } else if (currentUserFullData.avatarImageId) {
        const imageUrl = getImageUrlById(currentUserFullData.avatarImageId);
        if (imageUrl) {
          setAvatarPreview(imageUrl);
        }
      }
    } else if (currentUserProfile) {
      // Fallback to profile data
      setUsername(currentUserProfile.userName || '');
      setPublicIdentifier(currentUserProfile.publicIdentifier || '');
      setBiography(currentUserProfile.biography || '');
      if (currentUserProfile.imageUrl) {
        setAvatarPreview(currentUserProfile.imageUrl);
      } else if (currentUserProfile.avatarImageId) {
        const imageUrl = getImageUrlById(currentUserProfile.avatarImageId);
        if (imageUrl) {
          setAvatarPreview(imageUrl);
        }
      }
    }
    
    // Also use currentUserData for publicIdentifier if profile is not available
    if (currentUserData && !currentUserProfile && !currentUserFullData) {
      setPublicIdentifier(currentUserData.publicIdentifier || '');
      if (currentUserData.imageUrl) {
        setAvatarPreview(currentUserData.imageUrl);
      }
    }
  }, [currentUserData, currentUserProfile, currentUserFullData]);

  const [isLoading, setIsLoading] = useState(false);

  const handleSaveAccountInfo = async () => {
    setIsLoading(true);

    try {
      const updates: any = {};
      
      // Save old public identifier before update
      const oldPublicIdentifier = currentUserProfile?.publicIdentifier || currentUserData?.publicIdentifier;
      const publicIdentifierChanged = publicIdentifier.trim() && publicIdentifier !== oldPublicIdentifier;
      
      if (username.trim() && username !== currentUserProfile?.userName) {
        // Note: UserName might not be updatable via this endpoint
        // Keeping it for potential future API support
      }
      
      if (publicIdentifierChanged) {
        updates.PublicIdentifier = publicIdentifier.trim();
      }
      
      if (dateOfBirth) {
        updates.DateOfBirth = dateOfBirth;
      }
      
      if (biography !== (currentUserFullData?.biography || currentUserProfile?.biography || '')) {
        updates.Biography = biography.trim() || null;
      }

      // Update avatar if selected
      if (selectedAvatarFile) {
        await updateUserAvatar(selectedAvatarFile).unwrap();
        
        // Invalidate user profile and user data caches after avatar update
        if (currentUserId) {
          const tagsToInvalidate: Array<{ type: 'User'; id: string | number }> = [
            { type: 'User', id: currentUserId },
            { type: 'User', id: `PROFILE_${currentUserId}` },
            { type: 'User', id: 'LIST' },
          ];
          
          // Also invalidate profile by identifier if we have it
          const currentPublicIdentifier = currentUserProfile?.publicIdentifier || currentUserData?.publicIdentifier;
          if (currentPublicIdentifier) {
            tagsToInvalidate.push({ type: 'User', id: `PROFILE_${currentPublicIdentifier}` });
          }
          
          dispatch(userApi.util.invalidateTags(tagsToInvalidate));
        }
      }

      // Update user data if there are changes
      let updatedUserData: any = null;
      let newPublicIdentifierFromResponse: string | null = null;
      
      if (Object.keys(updates).length > 0) {
        updatedUserData = await updateUser(updates).unwrap();
        
        // Get new publicIdentifier from response if it was updated
        if (publicIdentifierChanged && updatedUserData?.publicIdentifier) {
          newPublicIdentifierFromResponse = updatedUserData.publicIdentifier;
        }
        
        // Update form with returned data (including dateOfBirth and biography)
        if (updatedUserData?.dateOfBirth) {
          setDateOfBirth(updatedUserData.dateOfBirth);
        }
        if (updatedUserData?.biography !== undefined) {
          setBiography(updatedUserData.biography || '');
        }
        
        // Update RTK Query cache with new data immediately
        if (currentUserId && updatedUserData) {
          dispatch(
            userApi.util.updateQueryData('getUserById', currentUserId, (draft) => {
              Object.assign(draft, updatedUserData);
            })
          );
        }
        
        // Invalidate user profile caches after any user data update (including biography)
        if (currentUserId) {
          const tagsToInvalidate: Array<{ type: 'User'; id: string | number }> = [
            { type: 'User', id: currentUserId },
            { type: 'User', id: `PROFILE_${currentUserId}` },
            { type: 'User', id: 'LIST' },
          ];
          
          // Also invalidate profile by identifier if we have it
          const currentPublicIdentifier = currentUserProfile?.publicIdentifier || currentUserData?.publicIdentifier;
          if (currentPublicIdentifier) {
            tagsToInvalidate.push({ type: 'User', id: `PROFILE_${currentPublicIdentifier}` });
          }
          
          dispatch(userApi.util.invalidateTags(tagsToInvalidate));
        }
      }

      // If public identifier changed, update URL and cache
      if (publicIdentifierChanged && oldPublicIdentifier) {
        const newPublicIdentifier = newPublicIdentifierFromResponse || publicIdentifier.trim();
        
        // Invalidate cache for old and new profile identifiers and user data
        const tagsToInvalidate: Array<{ type: 'User'; id: string | number }> = [
          { type: 'User', id: `PROFILE_${oldPublicIdentifier}` },
          { type: 'User', id: `PROFILE_${newPublicIdentifier}` },
          { type: 'User', id: 'LIST' }, // Invalidate user list to refresh all user data
        ];
        
        if (currentUserId) {
          tagsToInvalidate.push(
            { type: 'User', id: currentUserId },
            { type: 'User', id: `PROFILE_${currentUserId}` }
          );
        }
        
        dispatch(userApi.util.invalidateTags(tagsToInvalidate));
        
        // Check if we're currently on the profile page with old identifier
        const profilePathPattern = /^\/user\/([^/]+)$/;
        const match = location.pathname.match(profilePathPattern);
        
        if (match && match[1] === oldPublicIdentifier) {
          // Update URL to new identifier immediately
          navigate(`/user/${newPublicIdentifier}`, { replace: true });
        } else {
          // Store new identifier in sessionStorage so we can redirect after navigate(-1)
          sessionStorage.setItem('updatedPublicIdentifier', newPublicIdentifier);
          sessionStorage.setItem('oldPublicIdentifier', oldPublicIdentifier);
        }
      }

      if (selectedAvatarFile || Object.keys(updates).length > 0) {
        showSuccess('Account information updated successfully!');
        setSelectedAvatarFile(null);
      }
    } catch (err: any) {
      showError(err?.data?.message || 'Failed to update account information', err?.data?.errors || err?.data?.details);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestEmailChange = async () => {
    if (!email.trim()) {
      showError('Email cannot be empty');
      return;
    }

    setIsLoading(true);

    try {
      await requestEmailChange(email).unwrap();
      setShowEmailModal(false);
      showSuccess('Verification email sent. Please check your inbox and click the confirmation link.');
    } catch (err: any) {
      showError(err?.data?.message || 'Failed to request email change', err?.data?.errors || err?.data?.details);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword || !passwordToken) {
      showError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      showError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

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
      showSuccess('Password changed successfully!');
    } catch (err: any) {
      showError(err?.data?.message || 'Failed to change password', err?.data?.errors || err?.data?.details);
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

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showError('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showError('Image size should be less than 5MB');
        return;
      }
      setSelectedAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          icon={<LeftArrow />}
          size="medium"
          variant="filled"
          theme="dark"
          onClick={() => navigate(-1)}
          className={styles.backButton}
          iconOnly
        />
        <h2 className={styles.title}>Account</h2>
      </div>
      
      <div className={styles.content}>
        <SettingsSection title="Account Information">
          <Form onSubmit={(e) => { e.preventDefault(); handleSaveAccountInfo(); }} className={styles.accountForm}>
            <div className={styles.avatarUploadContainer}>
              {avatarPreview && (
                <div className={styles.avatarPreview}>
                  <LoadingImage src={avatarPreview} alt="Avatar preview" />
                </div>
              )}
              <label className={styles.fileInputLabel}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className={styles.fileInput}
                />
                <span className={styles.fileInputButton}>
                  {avatarPreview ? 'Change Avatar' : 'Choose Avatar'}
                </span>
              </label>
              {selectedAvatarFile && (
                <p className={styles.fileName}>{selectedAvatarFile.name}</p>
              )}
            </div>

            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              helperText="Note: Username update may require verification"
            />

            <Input
              label="Public Identifier"
              value={publicIdentifier}
              onChange={(e) => setPublicIdentifier(e.target.value)}
              placeholder="Enter public identifier"
            />

            <Input
              label="Date of Birth"
              placeholder="yyyy-mm-dd"
              icon={<DropDown/>}
              iconPosition="prefix"
              iconClickable={true}
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              onIconClick={() => setIsDatePickerOpen(true)}
              readOnly
            />
            <ModalDatePicker
              isOpen={isDatePickerOpen}
              onClose={() => setIsDatePickerOpen(false)}
              onConfirm={(date) => setDateOfBirth(date)}
              initialValue={dateOfBirth}
            />

            <div className={styles.textareaContainer}>
              <label htmlFor="biography-input" className={styles.textareaLabel}>
                About
              </label>
              <textarea
                id="biography-input"
                className={styles.textarea}
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                placeholder="Tell others about yourself"
                rows={4}
              />
              <p className={styles.textareaHelperText}>
                Tell others about yourself
              </p>
            </div>

            <div className={styles.formActions}>
              <Button variant="filled" theme="dark" type="submit" loading={isLoading} fullWidth>
                Save Changes
              </Button>
            </div>
          </Form>

          <div className={styles.separateActions}>
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
          </div>
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

      <Modal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)}>
        <div className={styles.modalContent}>
          <h2 className={styles.modalTitle}>Change Email</h2>
          <Input
            label="New Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter new email"
          />
          <div className={styles.modalActions}>
            <Button variant="filled" theme="light" onClick={() => setShowEmailModal(false)}>
              Cancel
            </Button>
            <Button variant="filled" theme="dark" onClick={handleRequestEmailChange} loading={isLoading}>
              Verify
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showPasswordModal} onClose={() => { setShowPasswordModal(false); setTokenSent(false); }}>
        <div className={styles.modalContent}>
          <h2 className={styles.modalTitle}>Change Password</h2>
          {!tokenSent ? (
            <>
              <p className={styles.modalDescription}>
                A verification token will be sent to your email. You'll need this token to complete the password change.
              </p>
              <div className={styles.modalActions}>
                <Button variant="filled" theme="light" onClick={() => { setShowPasswordModal(false); setTokenSent(false); }}>
                  Cancel
                </Button>
                <Button variant="filled" theme="dark" onClick={async () => {
                  setIsLoading(true);
                  try {
                    await requestPasswordChange().unwrap();
                    setTokenSent(true);
                    showSuccess('Verification token sent to your email!');
                  } catch (err: any) {
                    showError(err?.data?.message || 'Failed to send token', err?.data?.errors || err?.data?.details);
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
              />
              <div className={styles.modalActions}>
                <Button variant="filled" theme="light" onClick={() => { setShowPasswordModal(false); setTokenSent(false); }}>
                  Cancel
                </Button>
                <Button variant="filled" theme="dark" onClick={handleChangePassword} loading={isLoading}>
                  Change Password
                </Button>
              </div>
            </>
          )}
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
            <Button variant="filled" theme="light" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="filled" theme="dark" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

