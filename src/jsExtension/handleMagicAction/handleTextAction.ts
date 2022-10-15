import {
  appendTextComment,
  copy,
  MN,
  modifyNodeTitle,
  openUrl,
  popup,
  selectIndex,
  showHUD,
  UIAlertViewStyle,
  undoGroupingWithRefresh
} from "marginnote"
import { Addon } from "~/addon"
import { actions4text, isModuleON } from "~/merged"
import { formatText } from "~/modules/autoformat/utils"
import { mainOCR as ocrSelection } from "~/modules/autoocr/utils"
import { simplifyText } from "~/modules/autosimplify"
import { isURL } from "~/utils"
import lang from "../lang"

const enum NoteOption {
  Copy,
  Title,
  MergeTitle,
  MergeExcerpt,
  Excerpt,
  Comment
}

export default async function (key: string, option: number, content: string) {
  const imageFromSelection = MN.currentDocumentController
    .imageFromSelection()
    ?.base64Encoding()
  if (imageFromSelection === undefined) return showHUD(lang.not_select_area, 2)
  let res: string | undefined = undefined

  if (key.endsWith("OCR")) {
    res = await actions4text[key]({
      text: "",
      imgBase64: imageFromSelection,
      option
    })
  } else {
    const { preFormat, preOCR, preSimplify } = self.docProfile.magicaction4text
    const { selectionText } = MN.currentDocumentController
    let text =
      preOCR && isModuleON("autoocr")
        ? (await ocrSelection(imageFromSelection)) ?? selectionText
        : selectionText
    if (!text) return showHUD(lang.no_text_selection, 2)
    if (preSimplify && isModuleON("autosimplify")) text = simplifyText(text)
    if (preFormat && isModuleON("autoformat")) text = formatText(text)
    res = await actions4text[key]({
      text,
      imgBase64: "",
      option
    })
  }

  if (res) {
    if (isURL(res, true)) {
      const { option } = await popup(
        {
          title: Addon.title,
          message: lang.detect_link,
          type: UIAlertViewStyle.Default,
          buttons: [lang.sure]
        },
        ({ buttonIndex }) => ({
          option: buttonIndex
        })
      )
      if (option !== -1) {
        openUrl(
          res.replace(
            /^.*(https?:\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]).*$/,
            "$1"
          )
        )
        return
      }
    }
    const { lastFocusNote } = MN.currentDocumentController
    const { noteOptions } = self.globalProfile.magicaction4text
    if (!lastFocusNote || noteOptions.length === 0) {
      copy(res)
    } else {
      let option = noteOptions[0]
      if (noteOptions.length > 1) {
        const index = await selectIndex(
          lang.text_more_option.$options6.filter((k, i) =>
            noteOptions.includes(i)
          ),
          Addon.title,
          lang.text_more_option.selected_excerpt
        )
        option = noteOptions[index]
      }
      undoGroupingWithRefresh(() => {
        if (res)
          switch (option) {
            case NoteOption.Copy:
              copy(res)
              break
            case NoteOption.Title:
              modifyNodeTitle(lastFocusNote, res)
              break
            case NoteOption.MergeTitle:
              modifyNodeTitle(
                lastFocusNote,
                lastFocusNote.noteTitle + "; " + res
              )
              break
            case NoteOption.Excerpt:
              lastFocusNote.excerptText = res
              break
            case NoteOption.MergeExcerpt:
              const { excerptText } = lastFocusNote
              lastFocusNote.excerptText = excerptText ?? "" + res
              break
            case NoteOption.Comment:
              if (key === "formulaOCR") {
                const { markdown } = self.globalProfile.autoocr
                // 0. markdown
                // 1. mymarkdown
                // 2. milkdown
                switch (markdown[0]) {
                  case 0:
                    lastFocusNote.appendHtmlComment(
                      "```math\n" + res + "\n```",
                      "```math\n" + res + "\n```",
                      { width: 420, height: 100 },
                      "MarkDownEditor"
                    )
                    break
                  case 1:
                    lastFocusNote.appendHtmlComment(
                      res,
                      res,
                      { width: 420, height: 100 },
                      "MarkdownEditor"
                    )
                    break
                  case 2:
                    lastFocusNote.appendHtmlComment(
                      res,
                      res,
                      { width: 420, height: 100 },
                      "MilkdownEditor"
                    )
                    break
                }
              } else appendTextComment(lastFocusNote, res)
          }
      })
    }
  }
}