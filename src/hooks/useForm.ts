import { useState, useCallback, FormEvent, ChangeEvent, FocusEvent } from 'react';

interface FormConfig<T extends { [key: string]: any }> {
  initialValues: T;
  validationRules: {
    [K in keyof T]: (value: T[K], formData?: T) => string;
  };
  onSubmit: (values: T) => Promise<void>;
}

export function useForm<T extends { [key: string]: any }>({
  initialValues,
  validationRules,
  onSubmit
}: FormConfig<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (name: keyof T) => {
      if (validationRules[name]) {
        const error = validationRules[name](values[name], values);
        setErrors(prev => ({
          ...prev,
          [name]: error
        }));
        return error;
      }
      return '';
    },
    [validationRules, values]
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = event.target;
      setValues(prev => ({
        ...prev,
        [name]: value
      }));
      validateField(name as keyof T);
    },
    [validateField]
  );

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = event.target;
      setTouched(prev => ({
        ...prev,
        [name]: true
      }));
      validateField(name as keyof T);
    },
    [validateField, values]
  );

  const validateForm = useCallback(() => {
    const formErrors: { [key: string]: string } = {};
    let isValid = true;

    (Object.keys(values) as Array<keyof T>).forEach(key => {
      const error = validateField(key);
      if (error) {
        formErrors[key as string] = error;
        isValid = false;
      }
    });

    setErrors(formErrors);
    return isValid;
  }, [validateField, values]);

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      
      // Mark all fields as touched
      const touchedFields = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );
      setTouched(touchedFields);

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, validateForm, values]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit
  };
}
