import React, { ReactNode } from 'react';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ children, className = '' }) => (
  <div className={`container mx-auto px-3 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </div>
);

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { default: 1, sm: 2, lg: 3, xl: 4 },
  gap = 'gap-2 sm:gap-3 lg:gap-4',
  className = ''
}) => {
  const getGridCols = () => {
    const gridCols = [`grid-cols-${cols.default}`];
    if (cols.sm) gridCols.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) gridCols.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) gridCols.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) gridCols.push(`xl:grid-cols-${cols.xl}`);
    return gridCols.join(' ');
  };

  return (
    <div className={`grid ${getGridCols()} ${gap} ${className} min-w-0`}>
      {children}
    </div>
  );
};

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({ children, className = '', onClick }) => (
  <div
    className={`bg-background-primary rounded-lg sm:rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow duration-300 min-w-0 ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

interface ResponsiveTextProps {
  children: ReactNode;
  variant?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  variant = 'base',
  className = ''
}) => {
  const textSizes = {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
    '2xl': 'text-2xl sm:text-3xl'
  };

  return (
    <div className={`${textSizes[variant]} ${className}`}>
      {children}
    </div>
  );
};

interface ResponsiveButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const ResponsiveButton: React.FC<ResponsiveButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  type = 'button'
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary/50 disabled:bg-primary/50',
    secondary: 'bg-background-secondary text-text-primary hover:bg-background-tertiary focus:ring-primary/30 disabled:bg-background-secondary/50',
    outline: 'border border-border text-text-primary hover:bg-background-secondary focus:ring-primary/30 disabled:bg-background-secondary/50'
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs sm:text-sm',
    md: 'px-2 py-1.5 sm:px-3 sm:py-2 text-sm sm:text-base',
    lg: 'px-3 py-2 sm:px-4 sm:py-2.5 text-base sm:text-lg'
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

interface ResponsiveInputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  error?: string;
  label?: string;
  required?: boolean;
}

export const ResponsiveInput: React.FC<ResponsiveInputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  error,
  label,
  required = false
}) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-xs sm:text-sm font-medium text-text-primary">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
    )}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`
        w-full px-2 py-1.5 sm:px-3 sm:py-2
        border border-border rounded-lg
        bg-background-primary text-text-primary
        placeholder-text-tertiary
        focus:outline-none focus:ring-2 focus:ring-primary/20
        disabled:bg-background-secondary disabled:cursor-not-allowed
        text-sm
        ${error ? 'border-error focus:ring-error/20' : ''}
        ${className}
      `}
    />
    {error && (
      <p className="text-error text-xs mt-1">{error}</p>
    )}
  </div>
);

interface ResponsiveTableProps {
  headers: string[];
  rows: ReactNode[][];
  className?: string;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  headers,
  rows,
  className = ''
}) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="min-w-full divide-y divide-border">
      <thead className="bg-background-secondary">
        <tr>
          {headers.map((header, index) => (
            <th
              key={index}
              className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-text-secondary"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-background-primary divide-y divide-border">
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td
                key={cellIndex}
                className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 whitespace-nowrap text-sm text-text-primary"
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const ResponsiveSpinner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`loading-spinner ${className}`} />
);

export const ResponsiveDivider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <hr className={`border-t border-border my-3 sm:my-4 lg:my-6 ${className}`} />
);

export const ResponsiveAlert: React.FC<{
  children: ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}> = ({ children, variant = 'info', className = '' }) => {
  const variants = {
    info: 'bg-info/10 text-info border-info/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    error: 'bg-error/10 text-error border-error/20'
  };

  return (
    <div className={`p-3 sm:p-4 rounded-lg border ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}; 