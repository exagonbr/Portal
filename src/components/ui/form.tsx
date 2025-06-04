import { useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {}

const Form = ({ className, ...props }: FormProps) => {
  return <form className={cn('space-y-6', className)} {...props} />;
};

interface FormFieldProps {
  name: string;
  render: (props: { field: any }) => React.ReactNode;
}

const FormField = ({ name, render }: FormFieldProps) => {
  const { register } = useFormContext();
  return render({ field: register(name) });
};

interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const FormItem = ({ className, ...props }: FormItemProps) => {
  return <div className={cn('space-y-2', className)} {...props} />;
};

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const FormLabel = ({ className, ...props }: FormLabelProps) => {
  return (
    <label
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  );
};

interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {}

const FormControl = ({ className, ...props }: FormControlProps) => {
  return <div className={cn('mt-2', className)} {...props} />;
};

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const FormMessage = ({ className, ...props }: FormMessageProps) => {
  return (
    <p
      className={cn('text-sm font-medium text-destructive', className)}
      {...props}
    />
  );
};

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
}; 