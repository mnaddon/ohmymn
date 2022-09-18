import { DocumentController, MbBookNote } from ".."
import { DirectionOfSelection } from "~/enum"
import { IRowButton } from "./DataSource"
export * from "./Module"
export * from "./DataSource"
export * from "./AutoUtils"

export interface EventHandler {
  (sender: {
    // 不是都有哈，具体要看发送了什么
    userInfo: {
      key: string
      option: number
      row: IRowButton
      content: string
      name: string
      type: "text" | "card"
      status: boolean
      note: MbBookNote
      selections: number[]
      message: string
      noteid: string
      arrow: DirectionOfSelection
      /**
       * returns a {@link DocumentController} instance
       */
      documentController: DocumentController
      winRect: string
    }
  }): void
}

export interface GestureHandler {
  (sender: UIGestureRecognizer): void
}
