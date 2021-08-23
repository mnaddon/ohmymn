import { excerptNotes } from "utils/notebook"
import { showHUD, string2ReplaceParam } from "utils/public"

const config: IConfig = {
  name: "AutoReplace",
  intro: "自动替换摘录中的某些错误",
  settings: [
    {
      key: "on",
      type: cellViewType.switch,
      label: "摘录时自动执行"
    },
    {
      key: "customReplace",
      type: cellViewType.input,
      help: "自定义，点击查看具体格式",
      link: "https://github.com/ourongxing",
    }
  ],
  actions: [
    {
      type: cellViewType.buttonWithInput,
      label: "批量替换摘录文字",
      key: "replaceChecked",
      help: "具体输入格式见顶上帮助信息"
    }
  ]
}

const util = {}
const action: IActionMethod = {
  replaceChecked({ content, nodes }) {
    // 检查输入正确性
    try {
      const params = string2ReplaceParam(content)
      for (const node of nodes) {
        const notes = excerptNotes(node)
        for (const note of notes) {
          const text = note.excerptText
          let _text = ""
          if (text) {
            for (const item of params) {
              _text = text.replaceAll(item.regexp, item.replace)
            }
          }
          if (text !== _text) note.excerptText = _text
        }
      }
    } catch {
      showHUD("输入错误")
    }
  }
}
export default { config, util, action }