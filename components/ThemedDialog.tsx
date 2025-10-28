import { useTheme } from '@/constants/theme';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, Dialog, Portal, Text } from 'react-native-paper';

interface ThemedDialogAction {
  label: string;
  onPress: () => void;
  mode?: 'text' | 'outlined' | 'contained';
  textColor?: string;
}

interface ThemedDialogProps {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  message: string;
  actions?: ThemedDialogAction[];
  type?: 'info' | 'error' | 'warning' | 'success';
}

export const ThemedDialog: React.FC<ThemedDialogProps> = ({
  visible,
  onDismiss,
  title,
  message,
  actions,
  type = 'info',
}) => {
  const theme = useTheme();

  // Default actions if none provided
  const defaultActions: ThemedDialogAction[] = [
    {
      label: 'OK',
      onPress: onDismiss,
      mode: 'text',
    },
  ];

  const dialogActions = actions || defaultActions;

  // Get title based on type if not provided
  const dialogTitle = title || getDefaultTitle(type);

  // Get title color based on type
  const getTitleColor = () => {
    switch (type) {
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      case 'success':
        return theme.colors.success;
      default:
        return theme.colors.onSurface;
    }
  };

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={[
          styles.dialog,
          { 
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        {dialogTitle && (
          <Dialog.Title
            style={[
              styles.title,
              {
                color: getTitleColor(),
              },
            ]}
          >
            {dialogTitle}
          </Dialog.Title>
        )}
        <Dialog.Content>
          <Text
            variant="bodyMedium"
            style={[styles.message, { color: theme.colors.onSurface }]}
          >
            {message}
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          {dialogActions.map((action, index) => (
            <Button
              key={index}
              mode={action.mode || 'text'}
              onPress={() => {
                action.onPress();
                onDismiss();
              }}
              textColor={
                action.textColor ||
                (action.mode === 'contained'
                  ? theme.colors.onPrimary
                  : theme.colors.primary)
              }
              style={styles.actionButton}
            >
              {action.label}
            </Button>
          ))}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const getDefaultTitle = (type: 'info' | 'error' | 'warning' | 'success'): string => {
  switch (type) {
    case 'error':
      return 'Error';
    case 'warning':
      return 'Warning';
    case 'success':
      return 'Success';
    default:
      return 'Information';
  }
};

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 20,
    marginHorizontal: 40,
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    paddingTop: 20,

  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    marginLeft: 8,
  },
});

// Convenience hook for showing dialogs
export const useDialog = () => {
  const [dialogState, setDialogState] = React.useState<{
    visible: boolean;
    title?: string;
    message: string;
    actions?: ThemedDialogAction[];
    type?: 'info' | 'error' | 'warning' | 'success';
  }>({
    visible: false,
    message: '',
  });

  const showDialog = (
    message: string,
    options?: {
      title?: string;
      actions?: ThemedDialogAction[];
      type?: 'info' | 'error' | 'warning' | 'success';
    }
  ) => {
    setDialogState({
      visible: true,
      message,
      title: options?.title,
      actions: options?.actions,
      type: options?.type || 'info',
    });
  };

  const hideDialog = () => {
    setDialogState((prev) => ({ ...prev, visible: false }));
  };

  const DialogComponent = () => (
    <ThemedDialog
      visible={dialogState.visible}
      onDismiss={hideDialog}
      title={dialogState.title}
      message={dialogState.message}
      actions={dialogState.actions}
      type={dialogState.type}
    />
  );

  return {
    showDialog,
    hideDialog,
    Dialog: DialogComponent,
  };
};

