import { CellViewType } from "~/enum"
import { defineConfig } from "~/profile"
import { Addon } from "~/addon"
import { getExcerptNotes, isfileExists, readJSON } from "~/sdk"
import { OpenCC } from "~/modules/autosimplify/opencc"
import { lang } from "./lang"

export function simplifyText(text: string) {
  try {
    if (!Addon.OpenCC) {
      if (!isfileExists(Addon.path + "/simplified.json")) {
        throw "simplified.json not found"
      }
      Addon.OpenCC = new OpenCC(readJSON(Addon.path + "/simplified.json"))
    }
    // 大陆台湾香港
    const { taiwanIdiom, variant } = self.globalProfile.autosimplify
    const ret = (() => {
      if (variant[0] === 1) {
        if (taiwanIdiom) return Addon.OpenCC.taiwanToSimplifiedWithPhrases(text)
        else return Addon.OpenCC.taiwanToSimplified(text)
      } else if (variant[0] === 2)
        return Addon.OpenCC.hongKongToSimplified(text)
      else return Addon.OpenCC.traditionalToSimplified(text)
    })()
    const { customSimplify: params } = self.tempProfile.replaceParam
    return (
      params?.reduce(
        (acc, param) => acc.replace(param.regexp, param.newSubStr),
        ret
      ) ?? ret
    )
  } catch (err) {
    console.error(err)
    return text
  }
}

export default defineConfig({
  name: "AutoSimplify",
  key: "autosimplify",
  intro: lang.intro,
  settings: [
    {
      key: "on",
      type: CellViewType.Switch,
      label: lang.on.label,
      help: lang.on.help,
      auto: {
        modifyExcerptText: {
          index: 20,
          method({ text }) {
            return simplifyText(text)
          }
        }
      }
    },
    {
      key: "variant",
      type: CellViewType.Select,
      label: lang.variant.label,
      option: lang.variant.$option3
    },
    {
      key: "taiwanIdiom",
      type: CellViewType.Switch,
      label: lang.taiwan_idiom.label,
      bind: ["variant", 1]
    },
    {
      key: "customSimplify",
      type: CellViewType.Input,
      help: lang.custom_simplify.help
    }
  ],
  actions4card: [
    {
      type: CellViewType.ButtonWithInput,
      label: lang.simplify_card.label,
      key: "simplifyCard",
      option: lang.simplify_card.$option3,
      method: ({ nodes, option }) => {
        nodes.forEach(node => {
          if (option == 0 || option == 1) {
            getExcerptNotes(node).forEach(note => {
              const text = note.excerptText
              if (text) note.excerptText = simplifyText(text)
            })
          }
          if ((option == 0 || option == 2) && node.noteTitle) {
            node.noteTitle = simplifyText(node.noteTitle)
          }
        })
      }
    }
  ]
})