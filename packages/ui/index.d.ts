import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  children?: React.ReactNode;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  padding?: string;
  children?: React.ReactNode;
}

export interface CardHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface BadgeProps {
  variant?: string;
  children?: React.ReactNode;
  className?: string;
}

export interface AvatarProps {
  name?: string;
  src?: string;
  size?: "sm" | "md" | "lg";
}

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  children?: React.ReactNode;
}

export interface DropdownItemProps {
  children?: React.ReactNode;
  onClick?: () => void;
}

export interface TabsProps {
  tabs: Array<{ value: string; label: string; content?: React.ReactNode }>;
  value?: string;
  onChange?: (val: string) => void;
}

export interface TableProps {
  columns: Array<{ key: string; header: string; render?: (row: any) => React.ReactNode }>;
  data: any[];
  loading?: boolean;
}

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface AlertProps {
  variant?: "info" | "success" | "warning" | "danger";
  title?: string;
  children?: React.ReactNode;
}

export interface ToastProps {
  message: string;
  variant?: "info" | "success" | "warning" | "danger";
  onClose?: () => void;
}

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
}

export interface SkeletonProps {
  className?: string;
}

export interface SkeletonTextProps {
  lines?: number;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export interface BreadcrumbsProps {
  items: Array<{ label: string; href?: string }>;
}

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}

export const Button: React.FC<ButtonProps>;
export const Input: React.FC<InputProps>;
export const Select: React.FC<SelectProps>;
export const Textarea: React.FC<TextareaProps>;
export const Checkbox: React.FC<CheckboxProps>;
export const Radio: React.FC<RadioProps>;
export const Card: React.FC<CardProps>;
export const CardHeader: React.FC<CardHeaderProps>;
export const CardBody: React.FC<CardBodyProps>;
export const CardFooter: React.FC<CardFooterProps>;
export const Badge: React.FC<BadgeProps>;
export const Avatar: React.FC<AvatarProps>;
export const Modal: React.FC<ModalProps>;
export const Dropdown: React.FC<DropdownProps>;
export const DropdownItem: React.FC<DropdownItemProps>;
export const Tabs: React.FC<TabsProps>;
export const Table: React.FC<TableProps>;
export const Pagination: React.FC<PaginationProps>;
export const Alert: React.FC<AlertProps>;
export const Toast: React.FC<ToastProps>;
export const Spinner: React.FC<SpinnerProps>;
export const Skeleton: React.FC<SkeletonProps>;
export const SkeletonText: React.FC<SkeletonTextProps>;
export const EmptyState: React.FC<EmptyStateProps>;
export const Breadcrumbs: React.FC<BreadcrumbsProps>;
export const PageHeader: React.FC<PageHeaderProps>;
