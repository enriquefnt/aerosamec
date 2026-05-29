import * as React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function formatLocalDateTime(date: Date): string {
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

export default function DateTimeField({
  label,
  value,
  onChangeValue,
}: {
  label: string;
  value: string;
  onChangeValue: (value: string) => void;
}) {
  const initialDate = React.useMemo(() => {
    const parsed = value ? new Date(value) : new Date();
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [value]);

  const [date, setDate] = React.useState<Date>(initialDate);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [showTimePicker, setShowTimePicker] = React.useState(false);

  React.useEffect(() => {
    onChangeValue(formatLocalDateTime(date));
  }, [date, onChangeValue]);

  const onDateSelected = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') setShowDatePicker(false);
    if (selectedDate) {
      const next = new Date(date);
      next.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setDate(next);
    }
  };

  const onTimeSelected = (_event: DateTimePickerEvent, selectedTime?: Date) => {
    if (Platform.OS !== 'ios') setShowTimePicker(false);
    if (selectedTime) {
      const next = new Date(date);
      next.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
      setDate(next);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.row}>
        <Pressable style={[styles.button, styles.left]} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.buttonText}>Fecha: {formatLocalDateTime(date).slice(0, 10)}</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.right]} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.buttonText}>Hora: {formatLocalDateTime(date).slice(11, 16)}</Text>
        </Pressable>
      </View>

      {(showDatePicker || Platform.OS === 'ios') && (
        <DateTimePicker value={date} mode="date" display="default" onChange={onDateSelected} />
      )}

      {(showTimePicker || Platform.OS === 'ios') && (
        <DateTimePicker value={date} mode="time" display="default" onChange={onTimeSelected} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 8 },
  label: { color: '#374151', marginBottom: 4, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 8 },
  button: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  left: {},
  right: {},
  buttonText: { color: '#111827', fontWeight: '500' },
});
