"use client";

import { useTheme } from "@/providers/theme-provider";
import type React from "react";
import {
  ActivityIndicator,
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
          backgroundColor: "#000000",
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
        return "py-2 px-4";
      case "lg":
        return "py-3 px-6";
      default:
        return "py-2.5 px-5";
    }
  };

  // Determine font size based on size
  const getFontSize = () => {
    switch (size) {
      case "sm":
        return "text-sm";
      case "lg":
        return "text-lg";
      default:
        return "text-base";
    }
  };

  const buttonStyles = [
    "flex-row items-center justify-center rounded-lg",
    getPadding(),
    disabled && "opacity-50",
    style,
  ];

  const textStyles = [
    "font-medium",
    getFontSize(),
    disabled && "opacity-50",
    textStyle,
  ];

  return (
    <TouchableOpacity
      className={buttonStyles.join(" ")}
      style={[getButtonStyles(), style]}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          {typeof children === "string" ? (
            <Text className={textStyles.join(" ")} style={{ color: getTextColor() }}>
              {children}
            </Text>
          ) : (
            children
          )}
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </TouchableOpacity>
  );
}
