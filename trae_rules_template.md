# Trae IDE 用户规则

此文件包含 Trae IDE 体验的自定义规则和配置。

## 1. 命令别名

为常用操作定义自定义命令别名。

```yaml
command_aliases:
  - alias: "build"
    command: "npm run build"
    description: "构建项目"
  - alias: "dev"
    command: "npm run dev"
    description: "启动开发服务器"
  - alias: "test"
    command: "npm run test"
    description: "运行测试"
```

## 2. 代码风格偏好

指定您首选的代码风格指南。

```yaml
code_style:
  indentation: "spaces"  # 或 "tabs"
  indent_size: 2
  line_length: 80
  semi_colons: true
  single_quotes: false
  trailing_commas: "es5"
```

## 3. 项目特定设置

为特定项目类型或目录定义设置。

```yaml
project_settings:
  - path: "*/frontend/*"
    settings:
      default_extension: ".tsx"
      formatter: "prettier"
  - path: "*/backend/*"
    settings:
      default_extension: ".py"
      formatter: "black"
```

## 4. 工具使用偏好

配置 Trae 如何使用各种工具。

```yaml
tool_preferences:
  grep:
    default_output_mode: "content"
    show_line_numbers: true
  run_command:
    default_blocking: true
    default_target_terminal: "new"
  edit:
    preserve_indentation: true
```

## 5. 工作流自动化

为常见任务定义自动化工作流。

```yaml
workflows:
  - name: "New Feature"
    steps:
      - "git checkout -b feature/{name}"
      - "npm install"
      - "code ."
  - name: "Bug Fix"
    steps:
      - "git checkout -b fix/{name}"
      - "npm install"
      - "npm test"
```

## 6. 键盘快捷键

自定义常用操作的键盘快捷键。

```yaml
keyboard_shortcuts:
  - action: "Run Test"
    shortcut: "Ctrl+Shift+T"
  - action: "Format Code"
    shortcut: "Ctrl+Shift+F"
  - action: "Git Commit"
    shortcut: "Ctrl+K Ctrl+C"
```

## 7. AI 助手偏好

配置 AI 助手如何与您交互。

```yaml
ai_assistant:
  code_explanations: true
  optimization_suggestions: true
  documentation_generation: true
  preferred_language: "Chinese"
  max_response_length: 2000
```

## 8. 文件模板

为常用创建的文件定义模板。

```yaml
file_templates:
  - extension: ".py"
    template: |
      #!/usr/bin/env python3
      """
      {description}
      """

      def main():
          pass

      if __name__ == "__main__":
          main()
  - extension: ".tsx"
    template: |
      import React from 'react';

      interface {ComponentName}Props {{
        // Props here
      }}

      export const {ComponentName}: React.FC<{ComponentName}Props> = ({{}}) => {{
        return (
          <div>
            {/* Component content */}
          </div>
        );
      }};
```

## 9. 环境变量

为项目定义环境变量。

```yaml
environment_variables:
  - name: "API_KEY"
    value: "your-api-key-here"
    scope: "local"
  - name: "DEBUG"
    value: "true"
    scope: "development"
```

## 10. Git 集成

配置 Git 相关设置和别名。

```yaml
git_integration:
  default_branch: "main"
  commit_message_template: "{type}: {description}"
  pre_commit_hooks:
    - "npm run lint"
    - "npm run test"
  git_aliases:
    - alias: "st"
      command: "status"
    - alias: "co"
      command: "checkout"
    - alias: "br"
      command: "branch"
```

## 使用提示

- 所有配置使用 YAML 语法
- 缩进在 YAML 中很重要
- 使用注释 (#) 解释复杂的配置
- 测试您的配置以确保它们按预期工作

## 示例：完整配置

```yaml
# 完整的 user_rules.yaml 示例
command_aliases:
  - alias: "build"
    command: "npm run build"
    description: "构建项目"

code_style:
  indentation: "spaces"
  indent_size: 2

project_settings:
  - path: "*/frontend/*"
    settings:
      default_extension: ".tsx"

ai_assistant:
  code_explanations: true
  preferred_language: "Chinese"
```

根据您的具体需求和偏好修改此模板。
