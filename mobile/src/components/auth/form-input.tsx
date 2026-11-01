import { Control, Controller, FieldPath, FieldValues, RegisterOptions } from "react-hook-form";

import { Input, InputProps } from "@/components/ui";

type FormInputProps<T extends FieldValues> = Omit<InputProps, "value" | "onChangeText" | "onBlur" | "errorMessage"> & {
    control: Control<T>;
    name: FieldPath<T>;
    rules?: RegisterOptions<T, FieldPath<T>>;
};

/** An Input bound to react-hook-form, showing the field's validation message */
export function FormInput<T extends FieldValues>({ control, name, rules, ...props }: FormInputProps<T>) {
    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { value, onChange, onBlur, ref }, fieldState: { error } }) => (
                <Input ref={ref} value={value ?? ""} onChangeText={onChange} onBlur={onBlur} errorMessage={error?.message} {...props} />
            )}
        />
    );
}
