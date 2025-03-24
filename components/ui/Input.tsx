import { Feather } from '@expo/vector-icons';
import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '../theme-provider';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function ThemedInput({ label, error, leftIcon, rightIcon, ...props }: InputProps) {
  const { colors } = useTheme();

  return (
    <View>
      <Text className="text-base font-medium mb-2" style={{ color: colors.text }}>
        {label}
      </Text>
      <View
        className="flex-row items-center border rounded-lg px-3 mb-4 h-[50px]"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        {leftIcon}
        <TextInput
          className="ml-2 flex-1 h-[50px] text-base"
          style={{ color: colors.text }}
          placeholderTextColor={colors.muted}
          {...props}
        />
        {rightIcon}
      </View>
    </View>
  );
}