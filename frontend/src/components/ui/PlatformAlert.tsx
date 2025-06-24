import { Alert, Platform } from 'react-native';

interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface PlatformAlertOptions {
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

export class PlatformAlert {
  static alert(title: string, message?: string, buttons?: AlertButton[]): void {
    if (Platform.OS === 'web') {
      this.webAlert(title, message, buttons);
    } else {
      this.nativeAlert(title, message, buttons);
    }
  }

  private static webAlert(title: string, message?: string, buttons?: AlertButton[]): void {
    const fullMessage = message ? `${title}\n\n${message}` : title;

    if (!buttons || buttons.length <= 1) {
      // Simple alert for single button or no buttons
      window.alert(fullMessage);
      if (buttons && buttons[0]?.onPress) {
        buttons[0].onPress();
      }
      return;
    }

    // For multiple buttons, use confirm dialog
    const hasCancel = buttons.some(btn => btn.style === 'cancel');
    const confirmText = hasCancel ? 'OK' : 'Yes';
    const cancelText = hasCancel ? 'Cancel' : 'No';

    const result = window.confirm(`${fullMessage}\n\nClick "${confirmText}" to proceed or "${cancelText}" to cancel.`);

    if (result) {
      // Find the first non-cancel button
      const confirmButton = buttons.find(btn => btn.style !== 'cancel');
      if (confirmButton?.onPress) {
        confirmButton.onPress();
      }
    } else {
      // Find the cancel button
      const cancelButton = buttons.find(btn => btn.style === 'cancel');
      if (cancelButton?.onPress) {
        cancelButton.onPress();
      }
    }
  }

  private static nativeAlert(title: string, message?: string, buttons?: AlertButton[]): void {
    const alertButtons = buttons?.map(btn => ({
      text: btn.text,
      style: btn.style,
      onPress: btn.onPress
    }));

    Alert.alert(title, message, alertButtons);
  }

  // Convenience methods
  static success(title: string, message?: string, onPress?: () => void): void {
    this.alert(title, message, [{ text: 'OK', onPress }]);
  }

  static error(title: string, message?: string, onPress?: () => void): void {
    this.alert(title, message, [{ text: 'OK', onPress }]);
  }

  static confirm(
    title: string,
    message?: string,
    onConfirm?: () => void,
    onCancel?: () => void
  ): void {
    this.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: onCancel },
      { text: 'OK', style: 'destructive', onPress: onConfirm }
    ]);
  }
}