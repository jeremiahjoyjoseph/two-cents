import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
import { PINVerificationBottomSheet } from './PINVerificationBottomSheet';

/**
 * Wrapper component that shows PIN verification bottom sheet when required
 * Add this to your root layout to enable periodic PIN verification
 */
export const PINVerificationWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isPINRequired, setIsPINRequired, verifyPIN } = useAuth();

  const handleVerify = async (pin: string): Promise<boolean> => {
    const isValid = await verifyPIN(pin);
    if (isValid) {
      setIsPINRequired(false);
    }
    return isValid;
  };

  const handleCancel = () => {
    // Optional: You can implement logout or other behavior here
    // For now, just keep the modal open until PIN is verified
    console.log('PIN verification cancelled - modal will remain open');
  };

  return (
    <>
      {children}
      <PINVerificationBottomSheet
        isVisible={isPINRequired}
        onVerify={handleVerify}
        onCancel={handleCancel}
      />
    </>
  );
};

