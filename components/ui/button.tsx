"use client";

import { useTheme } from "@/components/theme-provider";
import type React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type StyleProp,
  type TextStyle,
  type TouchableOpacityProps,
  type ViewStyle,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

export function Button({
  variant = "default",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const { colors, isDark } = useTheme();

  // Determine button styles based on variant
  const getButtonStyles = () => {
    switch (variant) {
      case "outline":
        return {
          backgroundColor: "transparent",
          borderColor: colors.border,
          borderWidth: 1,
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          borderWidth: 0,
        };
      case "destructive":
        return {
          backgroundColor: colors.error,
        };
      default:
        return {
          backgroundColor: colors.primary,
        };
    }
  };

  // Determine text color based on variant
  const getTextColor = () => {
    switch (variant) {
      case "outline":
      case "ghost":
        return colors.text;
      case "destructive":
      default:
        return "#ffffff";
    }
  };

  // Determine padding based on size
  const getPadding = () => {
    switch (size) {
      case "sm":
        return { paddingVertical: 6, paddingHorizontal: 12 };
      case "lg":
        return { paddingVertical: 12, paddingHorizontal: 24 };
      default:
        return { paddingVertical: 8, paddingHorizontal: 16 };
    }
  };

  // Determine font size based on size
  const getFontSize = () => {
    switch (size) {
      case "sm":
        return 14;
      case "lg":
        return 18;
      default:
        return 16;
    }
  };

  const buttonStyles = [
    styles.button,
    getButtonStyles(),
    getPadding(),
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    { color: getTextColor(), fontSize: getFontSize() },
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          {typeof children === "string" ? (
            <Text style={textStyles}>{children}</Text>
          ) : (
            children
          )}
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  text: {
    fontWeight: "500",
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
});
