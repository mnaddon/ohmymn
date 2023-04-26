# AutoTag

在匹配到正则的情况下自动添加指定标签，也可以从摘录中提取特定内容为标签。

::: tip 更新
[v4.0.11](/update) 支持记录自动生成的标签，在修改摘录时自动删除之前生成的标签。
:::

## 自定义

::: warning 自定义格式
[Replace() 函数格式——提取](../custom.md#replace-函数)
:::

**例**

- `(/^.+$/gs, "这是一个例子")` 即可每次都添加一个标签为“这是一个例子”。

::: tip 更新
[v4.0.11](/update) 支持图片摘录自动添加标签。
[v4.0.16](/update) 通过空格来添加多个标签。标点符号自动替换为 `_`。
:::

- `(/@picture/gs, "这是一张图片")` 摘录图片时自动添加标签。

## [MagicAction for Card](magicaction4card.md#添加标签)

### 添加标签

::: warning 输入格式
[Replace() 函数格式——提取](../custom.md#replace-函数)，传入卡片中的摘录。
:::

由于大部分情况下只是为了添加标签，而无须提取，所以你可以直接输入标签内容。