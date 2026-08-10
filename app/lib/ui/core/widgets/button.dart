import 'package:app/ui/core/app_theme.dart';
import 'package:app/ui/core/constants.dart';
import 'package:app/ui/core/spacing/app_spacing.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

sealed class Button extends StatelessWidget {
  const Button({super.key});

  factory Button.primary({
    required Widget child,
    required VoidCallback? onPressed,
    Color? backgroundColor,
    Color? foregroundColor,
    EdgeInsetsGeometry? padding,
    BorderRadius? borderRadius,
  }) => PrimaryButton(
    onPressed: onPressed,
    backgroundColor: backgroundColor,
    foregroundColor: foregroundColor,
    padding: padding,
    borderRadius: borderRadius,
    child: child,
  );
  factory Button.ghost({
    required Widget child,
    required VoidCallback? onPressed,
    Color? backgroundColor,
    Color? foregroundColor,
    EdgeInsetsGeometry? padding,
    BorderRadius? borderRadius,
  }) => GhostButton(
    onPressed: onPressed,
    backgroundColor: backgroundColor,
    foregroundColor: foregroundColor,
    padding: padding,
    borderRadius: borderRadius,
    child: child,
  );
  factory Button.secondary({
    required Widget child,
    required VoidCallback? onPressed,
    Color? backgroundColor,
    Color? foregroundColor,
    EdgeInsetsGeometry? padding,
    BorderRadius? borderRadius,
  }) => SecondaryButton(
    onPressed: onPressed,
    backgroundColor: backgroundColor,
    foregroundColor: foregroundColor,
    padding: padding,
    borderRadius: borderRadius,
    child: child,
  );
  factory Button.icon({
    required Widget child,
    required VoidCallback? onPressed,
    Color? backgroundColor,
    Color? foregroundColor,
    EdgeInsetsGeometry? padding,
    BorderRadius? borderRadius,
  }) => IconButton(
    onPressed: onPressed,
    backgroundColor: backgroundColor,
    foregroundColor: foregroundColor,
    padding: padding,
    borderRadius: borderRadius,
    child: child,
  );
}

final class PrimaryButton extends Button {
  final Widget child;
  final VoidCallback? onPressed;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final EdgeInsetsGeometry? padding;
  final BorderRadius? borderRadius;
  const PrimaryButton({
    super.key,
    required this.child,
    required this.onPressed,
    this.backgroundColor,
    this.foregroundColor,
    this.padding,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    if (isApple) {
      return CupertinoButton(
        onPressed: onPressed,
        padding: padding,
        color: backgroundColor ?? AppTheme.buttonPrimary(context),
        foregroundColor: foregroundColor ?? AppTheme.background(context),
        borderRadius: borderRadius,
        child: child,
      );
    } else {
      return ElevatedButton(onPressed: onPressed, child: child);
    }
  }
}

final class GhostButton extends Button {
  final Widget child;
  final VoidCallback? onPressed;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final EdgeInsetsGeometry? padding;
  final BorderRadius? borderRadius;
  const GhostButton({
    super.key,
    required this.child,
    required this.onPressed,
    this.backgroundColor,
    this.foregroundColor,
    this.padding,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    if (isApple) {
      return Container(
        decoration: BoxDecoration(
          border: Border.all(
            color: foregroundColor ?? AppTheme.foreground(context),
            width: AppSpacing.eighth,
          ),
          borderRadius: borderRadius,
          color: backgroundColor ?? Theme.of(context).scaffoldBackgroundColor,
        ),
        child: CupertinoButton(
          onPressed: onPressed,
          padding: padding,
          color: CupertinoColors.transparent,
          foregroundColor: foregroundColor ?? AppTheme.foreground(context),
          borderRadius: borderRadius,
          child: child,
        ),
      );
    } else {
      return ElevatedButton(onPressed: onPressed, child: child);
    }
  }
}

final class SecondaryButton extends Button {
  final Widget child;
  final VoidCallback? onPressed;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final EdgeInsetsGeometry? padding;
  final BorderRadius? borderRadius;

  const SecondaryButton({
    super.key,
    required this.child,
    required this.onPressed,
    this.backgroundColor,
    this.foregroundColor,
    this.padding,
    this.borderRadius,
  });
  @override
  Widget build(BuildContext context) {
    if (isApple) {
      return CupertinoButton(
        onPressed: onPressed,
        color: backgroundColor ?? AppTheme.secondaryColor(context),
        foregroundColor: foregroundColor ?? AppTheme.textPrimary(context),
        padding: padding,
        borderRadius: borderRadius,
        child: child,
      );
    } else {
      return ElevatedButton(onPressed: onPressed, child: child);
    }
  }
}

final class IconButton extends Button {
  final Widget child;
  final VoidCallback? onPressed;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final EdgeInsetsGeometry? padding;
  final BorderRadius? borderRadius;
  const IconButton({
    super.key,
    required this.child,
    required this.onPressed,
    this.backgroundColor,
    this.foregroundColor,
    this.padding,
    this.borderRadius,
  });
  @override
  Widget build(BuildContext context) {
    if (isApple) {
      return CupertinoButton(
        onPressed: onPressed,
        color: backgroundColor ?? AppTheme.buttonPrimary(context),
        foregroundColor: foregroundColor ?? AppTheme.background(context),
        padding: padding ?? EdgeInsets.zero,
        borderRadius: borderRadius,
        child: child,
      );
    } else {
      return ElevatedButton(onPressed: onPressed, child: child);
    }
  }
}
