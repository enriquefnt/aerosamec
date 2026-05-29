import * as React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScreenContainer({
  children,
  footer,
  backgroundColor = '#f3f4f6',
  contentStyle,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
  backgroundColor?: string;
  contentStyle?: ViewStyle;
}) {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, contentStyle]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.main}>{children}</View>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    justifyContent: 'space-between',
  },
  main: {
    flexShrink: 1,
  },
  footer: {
    marginTop: 12,
    paddingBottom: 4,
  },
});
