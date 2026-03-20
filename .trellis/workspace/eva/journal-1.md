# Session Journal

## Session 1 - 2026-03-20

**Title**: 更新 backend spec 和检查工具

**Commit**: 4ee74a3

**Summary**:
根据 Join Table onDelete CASCADE commits，更新 backend spec 文档和检查工具

### Work Done

1. **Spec 文档更新**:
   - `database.md`: 添加 `ref` 外键引用文档、onDelete 行为说明、Join Table 规范
   - `model-checklist.md`: 添加 MODEL-004 Blocker 规则（Join Table 必须设置 onDelete: 'CASCADE'）

2. **Backend Check 工具更新**:
   - `tools/backend-check/index.mjs`: 添加 MODEL-004 规则
   - 规则检查 Join Table（X_Y 格式）所有 ref 必须包含 `onDelete: 'CASCADE'`
   - 排除普通实体表（Forum_Post、Forum_Reply 等）的误判

### Files Changed

- `.trellis/spec/backend/database.md` (+59 行)
- `.trellis/spec/backend/20-checklists/model-checklist.md` (+6 行)
- `tools/backend-check/index.mjs` (+44 行)

### Related Commits

- `680112b` fix(models): 多个 join table 外键添加 ON DELETE CASCADE
- `1758b91` fix(models): Forum_Post_Tag 外键添加 ON DELETE CASCADE
