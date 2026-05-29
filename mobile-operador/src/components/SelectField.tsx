import * as React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export type SelectOption = {
  label: string;
  value: string;
};

export default function SelectField({
  label,
  placeholder,
  value,
  options,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);

  const selectedLabel = React.useMemo(() => {
    return options.find((o) => o.value === value)?.label ?? '';
  }, [options, value]);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={value ? styles.triggerText : styles.placeholderText}>
          {value ? selectedLabel : placeholder}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.sheetTitle}>{label}</Text>
            {options.map((option) => {
              const selected = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}

            <Pressable style={styles.cancelButton} onPress={() => setOpen(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 8 },
  label: { color: '#374151', marginBottom: 4, fontWeight: '600' },
  trigger: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerText: { color: '#111827' },
  placeholderText: { color: '#9ca3af' },
  chevron: { color: '#6b7280', fontSize: 16, marginLeft: 8 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17,24,39,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    padding: 12,
    maxHeight: '70%',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionSelected: {
    backgroundColor: '#eff6ff',
  },
  optionText: { color: '#111827' },
  optionTextSelected: { color: '#1d4ed8', fontWeight: '600' },
  cancelButton: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  cancelText: { color: '#111827', fontWeight: '600' },
});
