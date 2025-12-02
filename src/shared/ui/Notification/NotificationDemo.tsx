import React from 'react';
import { useNotifications } from '@shared/store/notificationStore';
import { Button } from '@shared/ui';

export const NotificationDemo: React.FC = () => {
  const { showSuccess, showError } = useNotifications();

  const handleSuccess = () => {
    showSuccess('Operation completed successfully!');
  };

  const handleError = () => {
    showError('Something went wrong!');
  };

  const handleSuccessWithCode = () => {
    showSuccess('User updated successfully', 200);
  };

  const handleErrorWithCode = () => {
    showError('Resource not found', 404);
  };

  const handleLongMessage = () => {
    showError(
      'This is a very long error message that will be truncated because it exceeds the maximum length allowed for notification messages. Only the first 150 characters will be displayed to ensure the notification remains readable and doesn\'t take up too much screen space.'
    );
  };

  return (
    <div style={{ 
      padding: '20px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '10px',
      maxWidth: '400px',
      margin: '20px auto'
    }}>
      <h3>Notification System Demo</h3>
      
      <Button 
        variant="filled" 
        theme="light" 
        onClick={handleSuccess}
        fullWidth
      >
        Show Success
      </Button>

      <Button 
        variant="filled" 
        theme="dark" 
        onClick={handleError}
        fullWidth
      >
        Show Error
      </Button>

      <Button 
        variant="filled" 
        theme="light" 
        onClick={handleSuccessWithCode}
        fullWidth
      >
        Success with Status Code
      </Button>

      <Button 
        variant="filled" 
        theme="dark" 
        onClick={handleErrorWithCode}
        fullWidth
      >
        Error with Status Code
      </Button>

      <Button 
        variant="filled" 
        theme="dark" 
        onClick={handleLongMessage}
        fullWidth
      >
        Long Message (Truncated)
      </Button>
    </div>
  );
};

