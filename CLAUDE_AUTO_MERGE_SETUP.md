# 🤖 Настройка автоматического мерджа веток Claude

## Проблема
GitHub не позволяет Claude Code напрямую создавать workflow файлы без специального разрешения `workflows`.

## Решение
Добавьте workflow вручную через GitHub UI:

### Шаги:

1. Откройте ваш репозиторий на GitHub: https://github.com/Avertenandor/arbitragebotsite
2. Перейдите в `.github/workflows/`
3. Нажмите **Add file → Create new file**
4. Назовите файл: `auto-merge-claude-branches.yml`
5. Скопируйте и вставьте содержимое ниже
6. Закоммитьте файл напрямую в `main`

---

## Содержимое файла `auto-merge-claude-branches.yml`:

```yaml
name: Auto-merge Claude branches to main

on:
  push:
    branches:
      - 'claude/**'

permissions:
  contents: write
  pull-requests: write

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Configure Git
        run: |
          git config --global user.name "github-actions[bot]"
          git config --global user.email "github-actions[bot]@users.noreply.github.com"

      - name: Get branch name
        id: branch
        run: echo "name=${GITHUB_REF#refs/heads/}" >> $GITHUB_OUTPUT

      - name: Create and merge PR
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          BRANCH_NAME: ${{ steps.branch.outputs.name }}
        run: |
          # Получаем последний коммит для описания PR
          LAST_COMMIT_MSG=$(git log -1 --pretty=%B)

          # Создаем PR и сразу мерджим его
          echo "Creating PR from $BRANCH_NAME to main..."

          PR_URL=$(gh pr create \
            --title "Auto-merge: $BRANCH_NAME" \
            --body "🤖 Автоматический мердж изменений Claude из ветки \`$BRANCH_NAME\`

**Последний коммит:**
\`\`\`
$LAST_COMMIT_MSG
\`\`\`

---
_Этот PR был создан и смерджен автоматически через GitHub Actions._" \
            --base main \
            --head "$BRANCH_NAME" 2>&1) || {
              echo "Failed to create PR. It might already exist or there are no changes."
              # Проверяем, существует ли уже PR
              EXISTING_PR=$(gh pr list --head "$BRANCH_NAME" --base main --json number --jq '.[0].number')
              if [ -n "$EXISTING_PR" ]; then
                echo "Found existing PR #$EXISTING_PR"
                PR_NUMBER=$EXISTING_PR
              else
                echo "No PR found and couldn't create one. Exiting."
                exit 0
              fi
            }

          # Извлекаем номер PR из URL или используем существующий
          if [ -z "$PR_NUMBER" ]; then
            PR_NUMBER=$(echo "$PR_URL" | grep -oP '\d+$' || gh pr list --head "$BRANCH_NAME" --base main --json number --jq '.[0].number')
          fi

          if [ -n "$PR_NUMBER" ]; then
            echo "Merging PR #$PR_NUMBER..."

            # Пытаемся смерджить PR
            gh pr merge "$PR_NUMBER" --merge --auto --delete-branch || {
              echo "Auto-merge failed, trying direct merge..."
              gh pr merge "$PR_NUMBER" --merge --delete-branch
            }

            echo "✅ Successfully merged PR #$PR_NUMBER from $BRANCH_NAME to main"
          else
            echo "Could not determine PR number. Skipping merge."
            exit 1
          fi

      - name: Notify on failure
        if: failure()
        run: |
          echo "❌ Auto-merge workflow failed for branch ${{ steps.branch.outputs.name }}"
          echo "Please check the workflow logs and merge manually if needed."
```

---

## Что будет делать workflow:

✅ **Автоматический триггер** - активируется при push в любую ветку `claude/**`
✅ **Создание PR** - автоматически создает Pull Request в `main`
✅ **Авто-мердж** - мгновенно мерджит PR без ревью
✅ **Очистка** - удаляет ветку после успешного мерджа
✅ **Логирование** - добавляет описание с последним коммитом

## После настройки:

Все изменения из веток Claude будут **автоматически** попадать в `main` при каждом push! 🎉
