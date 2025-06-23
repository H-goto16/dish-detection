import useColorScheme from '@/hooks/useColorScheme';
import BottomSheet, {
    BottomSheetBackdrop,
    type BottomSheetBackdropProps,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
interface CustomBottomSheetProps {
  children: React.ReactNode;
  isOpen?: boolean;
  onChange?: (isOpen: boolean) => void;
  backdropClosable?: boolean;
  snapPoints?: (string | number)[];
  defaultSnapIndex?: number;
  height?: string | number;
}

const CustomBottomSheet = ({
  children,
  isOpen = false,
  onChange,
  backdropClosable = true,
  snapPoints: customSnapPoints,
  defaultSnapIndex = 0,
  height,
}: CustomBottomSheetProps) => {
  const colors = useColorScheme();

  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => {
    if (height !== undefined) {
      return [height];
    }
    if (customSnapPoints) {
      return customSnapPoints;
    }
    return ['25%', '50%', '90%'];
  }, [customSnapPoints, height]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      const isSheetOpen = index >= 0;
      onChange?.(isSheetOpen);
    },
    [onChange],
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        enableTouchThrough={!backdropClosable}
        pressBehavior={backdropClosable ? 'close' : 'none'}
      />
    ),
    [backdropClosable],
  );

  useEffect(() => {
    if (isOpen) {
      const indexToUse = height !== undefined ? 0 : defaultSnapIndex;
      bottomSheetRef.current?.snapToIndex(indexToUse);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen, defaultSnapIndex, height]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={isOpen ? (height !== undefined ? 0 : defaultSnapIndex) : -1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: colors.icon }}
      backgroundStyle={{ backgroundColor: colors.background }}
    >
      <BottomSheetView
        style={[
          styles.contentContainer,
          { backgroundColor: colors.background },
        ]}
      >
        {children}
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 24,
  },
});

export default CustomBottomSheet;
