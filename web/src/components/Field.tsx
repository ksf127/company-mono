import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  wide?: boolean;
  children: ReactNode;
}

/** 表单字段容器，统一标签与提示样式 */
export function Field({ label, required, hint, wide, children }: FieldProps) {
  return (
    <label className={wide ? 'field field-wide' : 'field'}>
      <span className="field-label">
        {label}
        {required ? <em>*</em> : null}
      </span>
      {children}
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}
