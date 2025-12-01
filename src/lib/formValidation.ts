/**
 * 通用表单验证工具
 * 支持必填字段检查、正则验证、自定义验证函数
 */

export type ValidationRule<T = string> = {
  pattern?: RegExp;
  validate?: (value: T) => boolean;
  errorType: string;
  required?: boolean;
};

export type ValidationRules<T extends Record<string, any>> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

export type ErrorMessages = Record<string, { zh: string; en: string }>;

export type FormErrors = {
  [key: string]: string;
};

export type ValidationConfig<T extends Record<string, any>> = {
  rules: ValidationRules<T>;
  requiredFields?: (keyof T)[];
  errorMessages: ErrorMessages;
  language?: "zh" | "en";
};

/**
 * 验证单个字段
 */
export function validateField<T extends Record<string, any>>(
  fieldName: keyof T,
  value: T[keyof T],
  config: ValidationConfig<T>
): string | "" {
  const { rules, requiredFields, errorMessages } = config;
  const rule = rules[fieldName];

  if (!rule) return "";

  // 检查必填字段
  const isRequired =
    rule.required !== undefined
      ? rule.required
      : requiredFields?.includes(fieldName) ?? false;

  // 处理空值
  const isEmpty =
    value === null ||
    value === undefined ||
    value === "" ||
    (typeof value === "boolean" && !value);

  if (isRequired && isEmpty) {
    return "required";
  }

  // 如果字段为空且不是必填，跳过其他验证
  if (isEmpty && !isRequired) {
    return "";
  }

  // 自定义验证函数
  if (rule.validate && typeof value === "string") {
    if (!rule.validate(value)) {
      return rule.errorType;
    }
  }

  // 正则验证
  if (rule.pattern && typeof value === "string" && value) {
    if (!rule.pattern.test(value)) {
      return rule.errorType;
    }
  }

  return "";
}

/**
 * 验证整个表单
 */
export function validateForm<T extends Record<string, any>>(
  formData: T,
  config: ValidationConfig<T>
): FormErrors {
  const errors: FormErrors = {};
  const { rules, requiredFields } = config;

  // 验证所有有规则的字段
  Object.keys(rules).forEach((fieldName) => {
    const field = fieldName as keyof T;
    const error = validateField(field, formData[field], config);
    if (error) {
      errors[fieldName] = error;
    }
  });

  // 验证必填字段（即使没有规则）
  requiredFields?.forEach((fieldName) => {
    const field = fieldName as keyof T;
    const value = formData[field];
    const isEmpty =
      value === null ||
      value === undefined ||
      value === "" ||
      (typeof value === "boolean" && !value);

    if (isEmpty && !errors[fieldName as string]) {
      errors[fieldName as string] = "required";
    }
  });

  return errors;
}

/**
 * 获取错误消息
 */
export function getErrorMessage(
  errorType: string,
  errorMessages: ErrorMessages,
  language: "zh" | "en" = "zh"
): string {
  return errorMessages[errorType]?.[language] || errorMessages["required"]?.[language] || "";
}

/**
 * 检查表单是否有错误
 */
export function hasErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * 滚动到第一个错误字段
 */
export function scrollToFirstError(errors: FormErrors): void {
  const firstErrorField = Object.keys(errors)[0];
  if (firstErrorField) {
    const element = document.getElementById(firstErrorField);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}


